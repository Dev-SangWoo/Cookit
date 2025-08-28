const fs = require("fs");
const path = require("path");

// videoId를 입력받음
const videoId = process.argv[2];
if (!videoId) {
  console.error("❌ videoId를 입력하세요. 예: node generate_combined_text.js orC1NOEJ_OQ");
  process.exit(1);
}

// 파일 경로 (현재 디렉토리 기준)
const ocrPath = path.join("OCR_sub", `${videoId}.txt`);
const whisperPath = path.join("whisper_sub", "audio.txt");
const subtitleDir = path.join("yt-dlp_sub");

// 자막 파일 탐색 (.vtt 또는 .srt)
const subtitleFile = fs.existsSync(subtitleDir) ? fs.readdirSync(subtitleDir).find(file =>
  file.endsWith(".vtt") || file.endsWith(".srt")
) : null;
const subtitlePath = subtitleFile ? path.join(subtitleDir, subtitleFile) : null;

// 파일 읽기 함수
function safeRead(filePath, label) {
  if (!filePath || !fs.existsSync(filePath)) {
    return `[${label} 없음]\n`;
  }
  const content = fs.readFileSync(filePath, "utf-8");
  return `[${label}]\n${content.trim()}\n`;
}

// 통합 결과 생성
const result =
  safeRead(ocrPath, "OCR 텍스트") +
  "\n" +
  safeRead(subtitlePath, "자막 텍스트") +
  "\n" +
  safeRead(whisperPath, "Whisper 텍스트");

// 저장
const outputPath = path.join("combined_sub", `${videoId}.txt`);
if (!fs.existsSync("combined_sub")) {
  fs.mkdirSync("combined_sub");
}
fs.writeFileSync(outputPath, result);
console.log(`✅ 통합 텍스트 저장 완료: ${outputPath}`);

// 🔻 여기서 자막 정리
const subDir = path.join(__dirname, 'yt-dlp_sub');
if (fs.existsSync(subDir)) {
  fs.readdirSync(subDir).forEach(file => {
    fs.unlinkSync(path.join(subDir, file));
  });
  console.log(`🧹 yt-dlp_sub 폴더 정리 완료`);
}