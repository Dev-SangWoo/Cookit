// ===============================
// file: ocr_analyze.cjs
// ===============================

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { performOCR } = require("../services/ocrHandler.js");

// ✅ 입력 인자 확인
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("❌ 분석할 파일 경로가 필요합니다.");
  process.exit(1);
}

const videoPath = args[0];
const serverRoot = path.join(__dirname, "..");
const outputDir = path.join(serverRoot, "ocr_frames");
const outputImage = path.join(outputDir, "frame.jpg");

// ✅ 출력 폴더 생성
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// ===========================
//  🎥 1️⃣ 영상에서 프레임 추출
// ===========================
try {
  console.log(`🎞️ 영상 프레임 추출 중: ${videoPath}`);
  execSync(`ffmpeg -y -i "${videoPath}" -frames:v 1 "${outputImage}"`);
  console.log(`✅ 프레임 추출 완료 → ${outputImage}`);
} catch (error) {
  console.error("❌ ffmpeg 프레임 추출 오류:", error);
  process.exit(1);
}

// ===========================
//  🔍 2️⃣ 추출된 이미지로 OCR 수행
// ===========================
(async () => {
  try {
    const result = await performOCR(outputImage);
    console.log("✅ OCR 결과:\n", result);
  } catch (error) {
    console.error("❌ OCR 실행 중 오류 발생:", error);
    process.exit(1);
  }
})();
