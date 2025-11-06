// ==========================
// file: generate_parsed_output.cjs (CommonJS 버전)
// ==========================
const fs = require("fs");
const path = require("path");

// ✅ 실행 인자에서 videoId 받기
const videoId = process.argv[2];
if (!videoId) {
  console.error("❌ videoId가 필요합니다.");
  process.exit(1);
}

// ✅ 주요 경로 (scripts 폴더 기준, 상위 디렉토리로 이동)
const serverRoot = path.join(__dirname, "..");
const resultPath = path.join(serverRoot, "result_out", `${videoId}_summary.txt`);
const parsedDir = path.join(serverRoot, "parsed_out");
const parsedPath = path.join(parsedDir, `${videoId}_parsed.json`);

// ✅ 폴더 없으면 생성
if (!fs.existsSync(parsedDir)) fs.mkdirSync(parsedDir, { recursive: true });

// ✅ result_out 파일 확인
if (!fs.existsSync(resultPath)) {
  console.error("❌ 요약 파일을 찾을 수 없습니다:", resultPath);
  process.exit(1);
}

// ✅ Gemini 결과 읽기
const rawText = fs.readFileSync(resultPath, "utf-8").trim();

// ✅ 기본 JSON 구조 생성
const parsedData = {
  video_id: videoId,
  title: null,
  summary_text: rawText,
  created_at: new Date().toISOString(),
};

// ✅ Gemini 결과에서 제목 추출 (있을 경우)
const titleMatch = rawText.match(/제목\s*[:：]\s*(.+)/);
if (titleMatch) parsedData.title = titleMatch[1].trim();

// ✅ JSON 파일로 저장
fs.writeFileSync(parsedPath, JSON.stringify(parsedData, null, 2), "utf-8");

console.log(`✅ parsed_out JSON 저장 완료: ${parsedPath}`);
