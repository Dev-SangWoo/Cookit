// ==========================
// file: run_full_pipeline.cjs
// ==========================

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const startTime = Date.now();

// ✅ 실행 기준 디렉토리(Server 폴더) 고정
const serverRoot = path.join(__dirname, "..");
process.chdir(serverRoot);
console.log("📂 실행 기준 디렉토리 고정:", process.cwd());

// ✅ 입력된 URL 받기
const rawUrl = process.argv[2];
if (!rawUrl) {
  console.error("❌ 유튜브 URL을 입력하세요.");
  process.exit(1);
}

// ✅ URL 정리 (&t=117s, &list= 등 제거)
const cleanUrl = rawUrl
  .replace(/&t=\d+s?/i, "")
  .replace(/&si=[^&]+/i, "")
  .replace(/&ab_channel=[^&]+/i, "")
  .replace(/&pp=[^&]+/i, "")
  .replace(/&list=[^&]+/i, "")
  .trim();

// ✅ videoId 추출
const videoIdMatch = cleanUrl.match(/v=([a-zA-Z0-9_-]+)/);
const videoId = videoIdMatch ? videoIdMatch[1] : null;
if (!videoId) {
  console.error("❌ 유효한 유튜브 URL이 아닙니다.");
  process.exit(1);
}

// ✅ 주요 경로 설정
const videoPath = path.join(serverRoot, "video_files", `${videoId}.mp4`);
const resultPath = path.join(serverRoot, "result_out", `${videoId}_summary.txt`);
const promptPath = path.join(serverRoot, "prompt_out", `${videoId}_prompt.txt`);
const whisperScript = path.join(__dirname, "test_whisper.py");
const ocrScript = path.join(__dirname, "ocr_analyze.cjs");
const combineScript = path.join(__dirname, "generate_combined_text.cjs");
const promptScript = path.join(__dirname, "generate_prompt.cjs");
const geminiScript = path.join(__dirname, "send_to_gemini.cjs");
const parsedScript = path.join(__dirname, "generate_parsed_output.cjs");
const supabaseScript = path.join(__dirname, "upload_to_supabase.cjs");

// ✅ 로그/명령 실행 헬퍼
function logStep(step, message) {
  console.log(`\n▶️ [${step}] ${message}`);
}

function runCommand(command, stepName) {
  try {
    console.log(`> ${command}`);
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    console.error(`\n❌ ${stepName} 중 오류 발생:`);
    console.error(error.message);
    process.exit(1);
  }
}

// -------------------------------------------------------------
// ⭐ 추가됨: time 문자열 → 초(Number) 변환 함수
// -------------------------------------------------------------
function timeToSeconds(timeStr) {
  if (!timeStr) return null;
  if (typeof timeStr === "number") return timeStr;

  const parts = timeStr.split(":").map(Number).reverse();
  let seconds = 0;

  if (parts[0]) seconds += parts[0];        // 초
  if (parts[1]) seconds += parts[1] * 60;   // 분
  if (parts[2]) seconds += parts[2] * 3600; // 시간

  return seconds;
}

// ==========================
//  메인 파이프라인
// ==========================
(async () => {
  console.log(`🔗 입력된 원본 링크: ${rawUrl}`);
  console.log(`🧹 정리된 유튜브 링크: ${cleanUrl}`);

  // [1/5] 영상 다운로드 및 Whisper/OCR 처리
  logStep("1/5", "영상 다운로드 및 Whisper/OCR 처리 중...");

  try {
    // ✅ 1️⃣ 유튜브 영상 다운로드
    runCommand(
      `yt-dlp -S "codec:avc:m4a,res,br" -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/bv*+ba/b" --merge-output-format mp4 --extractor-args "youtube:player_client=android" --hls-prefer-native -N 8 -o "${videoPath}" "${cleanUrl}" --retries 5 --retry-sleep 2`,
      "YouTube 영상 다운로드"
    );

    if (!fs.existsSync(videoPath) || fs.statSync(videoPath).size === 0) {
      console.warn("⚠️ 영상 파일이 존재하지 않거나 비어 있음:", videoPath);
    } else {
      console.log("✅ 영상 파일 다운로드 완료:", videoPath);
    }

    // ✅ 2️⃣ Whisper 음성 인식
    runCommand(`python "${whisperScript}" "${videoPath}"`, "Whisper 음성 인식");

    // ✅ 3️⃣ OCR 텍스트 추출
    runCommand(`node "${ocrScript}" "${videoPath}"`, "OCR 텍스트 추출");
  } catch (err) {
    console.error("❌ 오디오 및 Whisper/OCR 분석 중 오류:", err.message);
    process.exit(1);
  }

  // [2/5] 텍스트 통합
  logStep("2/5", "텍스트 통합 중...");
  runCommand(`node "${combineScript}" ${videoId}`, "자막 통합");

  // [3/5] 프롬프트 생성
  logStep("3/5", "프롬프트 생성 중...");
  let videoTitle = "유튜브 영상 제목";
  try {
    console.log("🎬 yt-dlp로 유튜브 영상 제목 가져오는 중...");
    videoTitle = execSync(
      `set PYTHONIOENCODING=utf-8 && yt-dlp --get-title "${cleanUrl}"`,
      { encoding: "utf-8" }
    ).toString().trim();
    console.log(`✅ 영상 제목: ${videoTitle}`);
  } catch {
    console.warn("⚠️ 영상 제목 가져오기 실패 — 기본 제목 사용");
  }

  runCommand(
    `node "${promptScript}" ${videoId} "${cleanUrl}" "${videoTitle}"`,
    "프롬프트 생성"
  );

  if (!fs.existsSync(promptPath)) {
    console.warn("⚠️ 프롬프트 파일이 생성되지 않았습니다:", promptPath);
  }

  // [4/5] Gemini API 요청
  logStep("4/5", "Gemini API 요청 중...");
  runCommand(`node "${geminiScript}" ${videoId}`, "Gemini 요청");

  // ✅ [4.5/5] Gemini 결과 → parsed_out 변환
  logStep("4.5/5", "결과 JSON 파일 생성 중...");
  try {
    runCommand(`node "${parsedScript}" ${videoId}`, "결과 JSON 생성");
  } catch {
    console.warn("⚠️ 결과 JSON 생성 실패 — parsed_out 폴더 확인 필요");
  }

  // -------------------------------------------------------------
  // ⭐ [4.7/5] 단계별 썸네일 캡처 — instructions/actions 구조 지원
  // -------------------------------------------------------------
  logStep("4.7/5", "단계별 타임라인 이미지 캡처 중...");
  try {
    const parsedFile = path.join(serverRoot, "parsed_out", `${videoId}_parsed.json`);
    if (fs.existsSync(parsedFile)) {
      const parsedData = JSON.parse(fs.readFileSync(parsedFile, "utf-8"));
      const instructions = parsedData.instructions || [];
      const outputDir = path.join(serverRoot, "step_thumbnails", videoId);

      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

      let stepCount = 0;

      for (let i = 0; i < instructions.length; i++) {
        const step = instructions[i];
        if (!step.actions) continue;

        // actions 중 start_time이 가장 빠른 것 자동 선택
        const times = step.actions
          .map(a => timeToSeconds(a.start_time))
          .filter(t => t != null && !isNaN(t));

        if (times.length === 0) continue;

        const time = Math.min(...times); // 가장 앞 시간
        const outPath = path.join(outputDir, `step_${i + 1}.jpg`);
        const command = `ffmpeg -ss ${time} -i "${videoPath}" -frames:v 1 -q:v 2 "${outPath}" -y`;

        console.log(`🖼️ Step ${i + 1} 프레임 추출 (${time}s): ${outPath}`);
        execSync(command);

        stepCount++;
      }

      console.log(`✅ 모든 단계 이미지 캡처 완료 (${stepCount}개): ${outputDir}`);
    } else {
      console.warn("⚠️ parsed_out JSON 파일을 찾을 수 없습니다:", parsedFile);
    }
  } catch (err) {
    console.error("❌ 타임라인 이미지 캡처 실패:", err.message);
  }

  // [5/5] Supabase 업로드
  logStep("5/5", "Supabase 'recipes' 테이블 업로드 중...");
  try {
    runCommand(`node "${supabaseScript}" ${videoId}`, "Supabase 업로드");

    // ❌ 삭제 코드 제거됨
    // if (fs.existsSync(resultPath)) {
    //   fs.unlinkSync(resultPath);
    //   console.log(`🧹 업로드 성공 — 결과 파일 삭제 완료: ${resultPath}`);
    // }

    // const parsedFileToDelete = path.join(serverRoot, "parsed_out", `${videoId}_parsed.json`);
    // if (fs.existsSync(parsedFileToDelete)) {
    //   fs.unlinkSync(parsedFileToDelete);
    //   console.log(`🧹 parsed_out 정리 완료: ${parsedFileToDelete}`);
    // }

  } catch {
    console.error("⚠️ Supabase 업로드 실패 — result_out 폴더 확인 필요");
  }

  // ✅ 전체 완료
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✅ 전체 파이프라인 실행 완료! (총 소요 시간: ${elapsed}초)`);
})();
