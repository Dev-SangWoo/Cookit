// ===============================
// file: generate_combined_text.cjs
// ===============================

const fs = require("fs");
const path = require("path");

// ✅ videoId 인자 확인
const videoId = process.argv[2];
if (!videoId) {
  console.error("❌ videoId를 입력하세요. 예: node generate_combined_text.cjs orC1NOEJ_OQ");
  process.exit(1);
}

// ✅ 절대경로 설정 (scripts 폴더 기준, 상위 디렉토리로 이동)
const serverRoot = path.join(__dirname, "..");
const ocrPath = path.join(serverRoot, "services", "OCR_sub", `${videoId}.txt`);
const whisperPath = path.join(serverRoot, "whisper_sub", "audio.txt");
const subtitleDir = path.join(serverRoot, "yt-dlp_sub");
const outputDir = path.join(serverRoot, "combined_sub");
const outputPath = path.join(outputDir, `${videoId}.txt`);

// ✅ 보조 함수: 안전한 파일 읽기
function safeRead(filePath, label) {
  if (!filePath || !fs.existsSync(filePath)) {
    console.warn(`⚠️ ${label} 파일이 없습니다: ${filePath}`);
    return `[${label} 없음]\n`;
  }
  const content = fs.readFileSync(filePath, "utf-8").trim();
  return `[${label}]\n${content}\n`;
}

// ✅ 자막 파일 탐색 (.vtt, .srt)
let subtitlePath = null;
if (fs.existsSync(subtitleDir)) {
  const subtitleFile = fs.readdirSync(subtitleDir).find(
    (file) => file.endsWith(".vtt") || file.endsWith(".srt")
  );
  if (subtitleFile) subtitlePath = path.join(subtitleDir, subtitleFile);
} else {
  console.warn("⚠️ yt-dlp_sub 폴더가 없습니다. 자막을 건너뜁니다.");
}

// ✅ 통합 텍스트 생성
const result =
  safeRead(ocrPath, "OCR 텍스트") +
  "\n" +
  safeRead(subtitlePath, "자막 텍스트") +
  "\n" +
  safeRead(whisperPath, "Whisper 텍스트");

// ✅ 출력 디렉토리 생성
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// ✅ 결과 저장
fs.writeFileSync(outputPath, result, "utf-8");
console.log(`✅ 통합 텍스트 저장 완료: ${outputPath}`);

// ✅ 자막 임시 폴더 정리
const subDir = path.join(baseDir, "yt-dlp_sub");
if (fs.existsSync(subDir)) {
  fs.readdirSync(subDir).forEach((file) => {
    fs.unlinkSync(path.join(subDir, file));
  });
  console.log(`🧹 yt-dlp_sub 폴더 정리 완료`);
}
