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
    console.log("\n[OCR-1] 유튜브 영상 다운로드 (최대 360p) 중...");
    execSync(
      `yt-dlp --no-playlist --force-overwrites -f "bestvideo[ext=mp4][height<=360]+bestaudio[ext=m4a]/best[ext=mp4][height<=360]" -o "${videoFile}" "${url}"`,
      { stdio: "inherit" }
    );

    // 디렉토리 준비
    if (!fs.existsSync(frameDir)) fs.mkdirSync(frameDir);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    console.log("\n[OCR-2] 프레임을 2초 간격으로 추출 중 (하단 자막 영역만)...");

    // 기존 프레임 제거
    fs.readdirSync(frameDir).forEach((f) =>
      fs.unlinkSync(path.join(frameDir, f))
    );

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

    for (const frame of frames) {
      const framePath = path.join(frameDir, frame);
      const { data: { text } } = await Tesseract.recognize(
        framePath,
        "kor", // ← 한글만 인식
        { logger: m => process.stdout.write(".") }
      );

      const clean = text.trim();
      if (clean) {
        ocrText += `\n[${frame}]\n${clean}\n`;
      }
    }

    // 유튜브 영상 ID 추출
    const videoId = url.match(/v=([a-zA-Z0-9_-]+)/)?.[1] || "result";
    const outputPath = path.join(outputDir, `${videoId}.txt`);
    fs.writeFileSync(outputPath, ocrText.trim(), "utf-8");

    console.log(`\n\n[OCR-4] OCR 결과 저장 완료 → ${outputPath}`);
  } catch (err) {
    console.error("❌ OCR 처리 중 오류 발생:", err.message);
  }
})();
