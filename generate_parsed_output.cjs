// ==========================
// file: generate_parsed_output.cjs (자동 JSON 복구 + start_time 변환 완전 통합 버전)
// ==========================
const fs = require("fs");
const path = require("path");

// ===============================
// 유틸: "HH:MM:SS" → 초(int) 변환
// ===============================
function timeToSeconds(t) {
  if (!t) return null;

  const parts = t.split(":").map(Number);

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  return null;
}

// ===============================
// 0) 실행 인자에서 videoId 받기
// ===============================
const videoId = process.argv[2];
if (!videoId) {
  console.error("❌ videoId가 필요합니다.");
  process.exit(1);
}

// ===============================
// 1) 주요 경로
// ===============================
const serverRoot = path.join(__dirname, "..");
const resultPath = path.join(serverRoot, "result_out", `${videoId}_summary.txt`);
const parsedDir = path.join(serverRoot, "parsed_out");
const parsedPath = path.join(parsedDir, `${videoId}_parsed.json`);

if (!fs.existsSync(parsedDir)) fs.mkdirSync(parsedDir, { recursive: true });

if (!fs.existsSync(resultPath)) {
  console.error("❌ 요약 파일을 찾을 수 없습니다:", resultPath);
  process.exit(1);
}

// ===============================
// 2) summary.txt 읽기
// ===============================
let raw = fs.readFileSync(resultPath, "utf-8").trim();

raw = raw
  .replace(/```json/gi, "")
  .replace(/```/g, "")
  .trim();

let parsedJSON;

// ===============================
// 3) JSON 파싱 + 자동 복구 로직
// ===============================
try {
  parsedJSON = JSON.parse(raw);
} catch (err) {
  console.warn("⚠️ JSON 파싱 실패 — 자동 복구 시도 중...");
  console.warn("원본 오류:", err.message);

  let fixed = raw;

  // 줄바꿈 제거
  fixed = fixed.replace(/(\r\n|\n|\r)/g, " ");

  // ' → "
  fixed = fixed.replace(/'/g, '"');

  // 키: 값 형태 복구
  fixed = fixed.replace(/(\w+)\s*:/g, '"$1":');

  // 잘못된 쉼표 제거
  fixed = fixed.replace(/,(\s*[}\]])/g, "$1");

  // 이중 공백 제거
  fixed = fixed.replace(/\s\s+/g, " ");

  try {
    parsedJSON = JSON.parse(fixed);
    console.log("✅ JSON 자동 복구 성공!");
  } catch (err2) {
    console.error("❌ JSON 복구 실패. summary.txt 확인 필요");
    console.error(err2.message);
    process.exit(1);
  }
}

// ===============================
// 4) start_time 문자열 → 초(int) 변환
// ===============================
if (Array.isArray(parsedJSON.instructions)) {
  parsedJSON.instructions = parsedJSON.instructions.map((stepObj) => {
    if (Array.isArray(stepObj.actions)) {
      stepObj.actions = stepObj.actions.map((act) => {
        if (typeof act.start_time === "string") {
          act.start_time_seconds = timeToSeconds(act.start_time);
        } else {
          act.start_time_seconds = null;
        }
        return act;
      });
    }
    return stepObj;
  });
}

// ===============================
// 5) 메타 정보 추가
// ===============================
parsedJSON.video_id = videoId;
parsedJSON.created_at = new Date().toISOString();

// ===============================
// 6) 저장
// ===============================
fs.writeFileSync(parsedPath, JSON.stringify(parsedJSON, null, 2), "utf-8");

console.log(`✅ parsed_out JSON 저장 완료: ${parsedPath}`);
console.log("📌 저장된 JSON은 단계별 썸네일 생성에 사용됩니다.");
