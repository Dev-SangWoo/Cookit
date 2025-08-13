const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const videoId = process.argv[2];
if (!videoId) {
  console.error("❌ 사용법: node send_to_gemini.js [videoId]");
  process.exit(1);
}

const promptPath = path.join("prompt_out", `${videoId}_prompt.txt`);
const videoPath = "video.mp4";
const outputDir = "result_out";
const outputPath = path.join(outputDir, `${videoId}_summary.txt`);

function readFileSafely(filePath, label) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ${label} 파일이 없습니다: ${filePath}`);
    process.exit(1);
  }
  return fs.readFileSync(filePath, "utf-8");
}

function createVideoPart(filePath) {
  const fileData = fs.readFileSync(filePath);
  return {
    inlineData: {
      data: Buffer.from(fileData).toString("base64"),
      mimeType: "video/mp4",
    },
  };
}

async function runGeminiSummarization() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.3,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  });

  const promptText = readFileSafely(promptPath, "프롬프트");
  const videoPart = createVideoPart(videoPath);

  const input = {
    contents: [{
      parts: [
        {
          text: `다음은 OCR, Whisper를 통합한 텍스트입니다. 반드시 영상 내용을 함께 참고하여 조리 과정을 단계별로 요약하세요.\n\n${promptText}`,
        },
        videoPart,
      ],
    }],
  };

  console.log(`🚀 Gemini 요청 중...`);

  try {
    const result = await model.generateContent(input);
    const summaryText = result.response.text();

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    fs.writeFileSync(outputPath, summaryText, "utf-8");
    console.log(`✅ 요약 결과 저장 완료: ${outputPath}`);
  } catch (err) {
    console.error("❌ Gemini 요청 중 오류 발생:", err.message);
  }
}

runGeminiSummarization();
