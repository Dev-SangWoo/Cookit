const fs = require("fs");
const path = require("path");

const videoId = process.argv[2];
if (!videoId) {
  console.error("❌ 사용법: node parse_summary_for_firestore.js [videoId]");
  process.exit(1);
}

const summaryPath = path.join("result_out", `${videoId}_summary.txt`);
const outputPath = path.join("parsed_out", `${videoId}_parsed.json`);

if (!fs.existsSync(summaryPath)) {
  console.error(`❌ 요약 파일이 존재하지 않습니다: ${summaryPath}`);
  process.exit(1);
}

const summary = fs.readFileSync(summaryPath, "utf-8");

// 🔍 단계별 정규식 파싱
const stepRegex = /\*\*(\d+단계:.*?)\*\*\n+(\* \*\*재료:.*?\n)?(\* \*\*설명:.*?)(?=\n\*\*|$)/gs;

const results = [];
let match;

while ((match = stepRegex.exec(summary)) !== null) {
  const fullTitle = match[1].trim(); // "1단계: 삼겹살 굽기 (00:00:07)"
  const rawIngredients = match[2] || "";
  const descriptionBlock = match[3] || "";

  // 제목 안의 타임라인 추출
  const titleTimelineMatch = fullTitle.match(/\((\d{2}:\d{2}(?::\d{2})?)\)/);
  const stepTimeline = titleTimelineMatch ? titleTimelineMatch[1] : "";
  const stepTitle = fullTitle.replace(/\(\d{2}:\d{2}(?::\d{2})?\)/, "")
                             .replace(/^\d+단계:\s*/, "")
                             .trim();

  // 재료 정제
  const ingredients = rawIngredients
    .replace("* **재료:**", "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // 설명 문장별 분해
  const rawDescription = descriptionBlock.replace("* **설명:**", "").trim();
  const sentences = rawDescription.split(/(?<=\.)\s+/); // 문장 단위로 분리

  const substeps = [];
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const timelineMatch = sentence.match(/\(?(\d{2}:\d{2}(?::\d{2})?)\)?/);
    const timeline = timelineMatch ? timelineMatch[1] : (i === 0 ? stepTimeline : "");

    const cleanDescription = sentence.replace(/\(?\d{2}:\d{2}(?::\d{2})?\)?/, "").trim();
    if (cleanDescription) {
      substeps.push({
        description: cleanDescription,
        timeline: timeline,
      });
    }
  }

  results.push({
    stepNumber: results.length + 1,
    stepTitle: stepTitle,
    substeps: substeps,
    ingredients: ingredients,
  });
}

// 결과 디렉토리 없으면 생성
if (!fs.existsSync("parsed_out")) {
  fs.mkdirSync("parsed_out");
}

fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf-8");
console.log(`✅ 변환 완료! Firestore 업로드용 JSON: ${outputPath}`);
