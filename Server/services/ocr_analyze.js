const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const Tesseract = require("tesseract.js");

// 유튜브 링크 인자로 받기
const url = process.argv[2];
if (!url) {
  console.error("❌ 유튜브 링크를 인자로 전달하세요.");
  process.exit(1);
}

const videoFile = "video.mp4";
const frameDir = "temp_frames";
const outputDir = "OCR_sub";

// OCR 시작 전 video.mp4 강제 삭제
if (fs.existsSync(videoFile)) {
  fs.unlinkSync(videoFile);
}

(async () => {
  try {
    console.log("\n[OCR-1] 유튜브 영상 다운로드 중...");
    execSync(
      `yt-dlp --no-playlist --force-overwrites --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" --extractor-args "youtube:player_client=android" --format "best[height<=480]/worst" -o "${videoFile}" "${url}"`,
      { stdio: "inherit" }
    );

    // 디렉토리 준비
    if (!fs.existsSync(frameDir)) fs.mkdirSync(frameDir);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    console.log("\n[OCR-2] 프레임을 2초 간격으로 추출 중 (하단 자막 영역만)...");

    // 기존 프레임 제거
    if (fs.existsSync(frameDir)) {
      fs.readdirSync(frameDir).forEach((f) =>
        fs.unlinkSync(path.join(frameDir, f))
      );
    }

    // 프레임 추출: 하단 1/4 crop
    execSync(
      `ffmpeg -i "${videoFile}" -vf "fps=1/2,crop=iw:ih/4:0:ih*3/4" ${frameDir}/frame_%03d.jpg`,
      { stdio: "inherit" }
    );

    const frames = fs
      .readdirSync(frameDir)
      .filter((file) => file.endsWith(".jpg"))
      .sort();

    console.log(`\n[OCR-3] 총 ${frames.length}개의 프레임에서 OCR 인식 중...`);

    let ocrText = "";

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      const framePath = path.join(frameDir, frame);
      
      // 프레임 번호로 타임스탬프 계산 (2초 간격)
      const timeInSeconds = i * 2;
      const hours = Math.floor(timeInSeconds / 3600);
      const minutes = Math.floor((timeInSeconds % 3600) / 60);
      const seconds = timeInSeconds % 60;
      const timestamp = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      
      const { data: { text } } = await Tesseract.recognize(
        framePath,
        "kor", // ← 한글만 인식
        { logger: m => process.stdout.write(".") }
      );

      const clean = text.trim();
      if (clean) {
        ocrText += `\n[${timestamp}] (${frame})\n${clean}\n`;
      }
    }

    // 유튜브 영상 ID 추출
    const videoId = url.match(/v=([a-zA-Z0-9_-]+)/)?.[1] || "result";
    const outputPath = path.join(outputDir, `${videoId}.txt`);
    fs.writeFileSync(outputPath, ocrText.trim(), "utf-8");

    console.log(`\n\n[OCR-4] OCR 결과 저장 완료 → ${outputPath}`);
  } catch (err) {
    console.error("❌ OCR 처리 중 오류 발생:", err.message);
    // 오류를 re-throw하여 파이프라인이 중단되도록 함
    process.exit(1);
  }
})();
