const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const videoId = process.argv[2];
if (!videoId) {
  console.error("❌ 사용법: node send_to_gemini.js [videoId]");
  process.exit(1);
}

// ✅ 절대경로 기반 경로 설정 (scripts 폴더 기준, 상위 디렉토리로 이동)
const serverRoot = path.join(__dirname, "..");
const promptPath = path.join(serverRoot, "prompt_out", `${videoId}_prompt.txt`);
const videoPath = path.join(serverRoot, "video_files", `${videoId}.mp4`);
const outputDir = path.join(serverRoot, "result_out");
const outputPath = path.join(outputDir, `${videoId}_summary.txt`);

function readFileSafely(filePath, label) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ${label} 파일이 없습니다: ${filePath}`);
    process.exit(1);
  }
  return fs.readFileSync(filePath, "utf-8");
}

function createVideoPart(filePath) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
    console.warn("⚠️ video.mp4가 없거나 비어 있습니다. 텍스트 기반 분석만 진행합니다.");
    return null;
  }
  const fileData = fs.readFileSync(filePath);
  return {
    inlineData: {
      data: Buffer.from(fileData).toString("base64"),
      mimeType: "video/mp4",
    },
  };
}

async function runGeminiSummarization() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: "models/gemini-2.5-flash",
    generationConfig: {
      temperature: 0.3,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  });

  const promptText = readFileSafely(promptPath, "프롬프트");
  const videoPart = createVideoPart(videoPath);

  const parts = [
    {
      text: `다음은 OCR, Whisper, 자막 텍스트를 통합한 데이터입니다. 영상이 존재할 경우 반드시 참고하여 단계별 조리 요약을 작성하세요.\n\n${promptText}`,
    },
  ];

  if (videoPart) parts.push(videoPart);

  console.log("🚀 Gemini 요청 중...");

  try {
    const result = await model.generateContent({ contents: [{ parts }] });
    const summaryText = result.response.text();

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(outputPath, summaryText, "utf-8");
    console.log(`✅ 요약 결과 저장 완료: ${outputPath}`);
  } catch (err) {
    console.error("❌ Gemini 요청 중 오류 발생:", err.message);
  }
}

runGeminiSummarization();
