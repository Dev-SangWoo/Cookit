const fs = require("fs");
const path = require("path");

const videoId = process.argv[2];
const videoUrl = process.argv[3];

if (!videoId || !videoUrl) {
  console.error("❌ 사용법: node generate_prompt.js [videoId] [videoUrl]");
  process.exit(1);
}

const inputPath = path.join("combined_sub", `${videoId}.txt`);
const outputDir = path.join("prompt_out");
const outputPath = path.join(outputDir, `${videoId}_prompt.txt`);

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function generatePromptText(url, combinedText) {
  return `당신은 요리 분석 전문가입니다.

다음 텍스트는 하나의 요리 유튜브 영상에서 추출된 자막, OCR, Whisper 텍스트를 통합한 것입니다.
이 영상의 주소는 다음과 같습니다:

🔗 영상 링크: ${url}

이 영상의 실제 내용을 반드시 함께 참고하여  
아래 텍스트의 내용을 조리 단계로 정리해주세요.

요약 규칙:
1. 단계별로 "1단계", "2단계"로 번호를 붙여 정리하고, 각 단계는 여러 '세부 조리 동작'으로 구성될 수 있습니다.
2. 각 세부 조리 동작은 다음 정보를 포함합니다:
   - 조리 동작 이름
   - 사용된 재료 목록 (있는 경우)
   - 조리 과정 설명
   - 시작 타임라인 (**시:분:초 단위로 해당 동작이 영상에서 처음 시작되는 시점을 정확히 기입**)
3. 중복되는 표현은 간결하게 통합하며, 블로그 스타일처럼 자연스럽고 구체적으로 작성해주세요.
4. 반드시 유튜브 영상 내용을 우선적으로 참고해주세요.

※ 타임라인은 가능한 한 시각적으로 동작이 시작되는 순간 또는 조리 동작이 언어로 언급되는 순간을 기준으로 가장 먼저 등장한 시점을 사용하세요.

--- 타임라인 예시 ---

1단계: 재료 준비 및 손질
- 재료: 파, 마늘, 피망
- 설명: 파 흰대 반 개와 마늘 반 큰술을 다져 준비합니다. 피망은 색감을 위해 선택적으로 사용합니다.
- 시작 타임라인: 00:00:38

...

--- 아래는 통합된 원문 텍스트입니다 ---
-------------------------------
${combinedText}`;
}

try {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`❌ 통합 텍스트 파일이 없습니다: ${inputPath}`);
  }

  const combinedText = fs.readFileSync(inputPath, "utf-8");
  const promptText = generatePromptText(videoUrl, combinedText);

  ensureDirectoryExists(outputDir);
  fs.writeFileSync(outputPath, promptText, "utf-8");

  console.log(`✅ 프롬프트 파일 생성 완료: ${outputPath}`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
