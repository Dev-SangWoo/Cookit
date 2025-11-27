// ===============================
// file: generate_combined_text.cjs
// ===============================

const fs = require("fs");
const path = require("path");

// ✅ videoId 인자 확인
const videoId = process.argv[2];
if (!videoId) {
  console.error("❌ videoId를 입력하세요. 예: node generate_combined_text.cjs AiDtSH-JRUc");
  process.exit(1);
}

// ===============================
//  경로 설정
// ===============================
const serverRoot = path.join(__dirname, "..");

const ocrPath = path.join(serverRoot, "services", "OCR_sub", `${videoId}.txt`);
const whisperPath = path.join(serverRoot, "whisper_sub", `${videoId}.txt`);
const subtitleDir = path.join(serverRoot, "yt-dlp_sub");

const outputDir = path.join(serverRoot, "combined_sub");
const outputPath = path.join(outputDir, `${videoId}.txt`);


// ===============================
//  안전한 파일 읽기 헬퍼
// ===============================
function safeRead(filePath, label) {
  if (!filePath || !fs.existsSync(filePath)) {
    console.warn(`⚠️ ${label} 파일이 없습니다: ${filePath}`);
    return `[${label} 없음]\n`;
  }
  const content = fs.readFileSync(filePath, "utf-8").trim();
  return `[${label}]\n${content}\n`;
}


// ===============================
//  yt-dlp 자막 파일 찾기
// ===============================
let subtitlePath = null;

if (fs.existsSync(subtitleDir)) {
  const subtitleFile = fs.readdirSync(subtitleDir).find(
    (file) =>
      file.includes(videoId) &&
      (file.endsWith(".vtt") || file.endsWith(".srt"))
  );

  if (subtitleFile) {
    subtitlePath = path.join(subtitleDir, subtitleFile);
  } else {
    console.warn(`⚠️ 자막 파일을 찾지 못했습니다: ${subtitleDir}`);
  }
} else {
  console.warn("⚠️ yt-dlp_sub 폴더가 없습니다. 자막을 건너뜁니다.");
}


// ===============================
//  Whisper + OCR + Subtitles 통합
// ===============================
const result =
  safeRead(ocrPath, "OCR 텍스트") +
  "\n" +
  safeRead(subtitlePath, "자막 텍스트") +
  "\n" +
  safeRead(whisperPath, "Whisper 텍스트");


// ===============================
//  저장
// ===============================
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, result, "utf-8");
console.log(`✅ 통합 텍스트 저장 완료: ${outputPath}`);


// ===============================
//  ⚠️ 삭제 코드 제거 (필요 없음)
// ===============================
// (자막 폴더 및 파일 제거 X)
