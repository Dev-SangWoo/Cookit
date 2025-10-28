// ==========================
// file: run_full_pipeline.cjs
// ==========================

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const startTime = Date.now();

// ✅ 실행 기준 디렉토리(Server 폴더) 고정
process.chdir(__dirname);
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

// ✅ 주요 경로 설정 (모두 절대경로)
const videoPath = path.join(__dirname, "video_files", `${videoId}.mp4`);
const resultPath = path.join(__dirname, "result_out", `${videoId}_summary.txt`);
const promptPath = path.join(__dirname, "prompt_out", `${videoId}_prompt.txt`);
const whisperScript = path.join(__dirname, "test_whisper.py");
const ocrScript = path.join(__dirname, "ocr_analyze.cjs");
const combineScript = path.join(__dirname, "generate_combined_text.cjs");
const promptScript = path.join(__dirname, "generate_prompt.cjs");
const geminiScript = path.join(__dirname, "send_to_gemini.cjs");
const parsedScript = path.join(__dirname, "generate_parsed_output.cjs"); // ✅ 추가됨
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
      `yt-dlp -f "best[ext=mp4]" -o "${videoPath}" "${cleanUrl}"`,
      "YouTube 영상 다운로드"
    );

    if (!fs.existsSync(videoPath) || fs.statSync(videoPath).size === 0) {
      console.warn("⚠️ 영상 파일이 존재하지 않거나 비어 있음:", videoPath);
    } else {
      console.log("✅ 영상 파일 다운로드 완료:", videoPath);
    }

    // ✅ 2️⃣ Whisper 음성 인식
    runCommand(
      `python "${whisperScript}" "${videoPath}"`,
      "Whisper 음성 인식"
    );

    // ✅ 3️⃣ OCR 텍스트 추출
    runCommand(
      `node "${ocrScript}" "${videoPath}"`,
      "OCR 텍스트 추출"
    );
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

  // ✅ [4.5/5] Gemini 결과 → parsed_out 변환 (추가된 부분)
  logStep("4.5/5", "결과 JSON 파일 생성 중...");
  try {
    runCommand(`node "${parsedScript}" ${videoId}`, "결과 JSON 생성");
  } catch {
    console.warn("⚠️ 결과 JSON 생성 실패 — parsed_out 폴더 확인 필요");
  }

  // [5/5] Supabase 업로드
  logStep("5/5", "Supabase 'recipes' 테이블 업로드 중...");
  try {
    runCommand(`node "${supabaseScript}" ${videoId}`, "Supabase 업로드");

    if (fs.existsSync(resultPath)) {
      fs.unlinkSync(resultPath);
      console.log(`🧹 업로드 성공 — 결과 파일 삭제 완료: ${resultPath}`);
    }

    // ✅ 분석 완료 후 parsed_out JSON 파일 삭제
    const parsedFile = path.join(__dirname, "parsed_out", `${videoId}_parsed.json`);
    if (fs.existsSync(parsedFile)) {
      fs.unlinkSync(parsedFile);
      console.log(`🧹 parsed_out 정리 완료: ${parsedFile}`);
    }

  } catch {
    console.error("⚠️ Supabase 업로드 실패 — result_out 폴더 확인 필요");
  }

  // ✅ 전체 완료
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✅ 전체 파이프라인 실행 완료! (총 소요 시간: ${elapsed}초)`);
})();
