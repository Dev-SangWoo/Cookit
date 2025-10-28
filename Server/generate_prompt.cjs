// ===============================
// file: generate_prompt.cjs
// ===============================

const fs = require("fs");
const path = require("path");

// ✅ 인자: node generate_prompt.cjs [videoId] [videoUrl] [videoTitle]
const videoId = process.argv[2];
const videoUrl = process.argv[3];
const videoTitle = process.argv[4];

if (!videoId || !videoUrl || !videoTitle) {
  console.error("❌ 사용법: node generate_prompt.cjs [videoId] [videoUrl] [videoTitle]");
  process.exit(1);
}

// ✅ 절대경로 설정
const baseDir = __dirname;
const inputPath = path.join(baseDir, "combined_sub", `${videoId}.txt`);
const outputDir = path.join(baseDir, "prompt_out");
const outputPath = path.join(outputDir, `${videoId}_prompt.txt`);

// ✅ 디렉토리 보장 함수
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ✅ 프롬프트 생성 함수
function generatePromptText(url, title, combinedText) {
  const processedAt = new Date().toISOString();

  return `당신은 요리 분석 전문가입니다.

다음 텍스트는 하나의 요리 유튜브 영상에서 추출된 자막, OCR, Whisper 텍스트를 통합한 것입니다.
이 영상의 주소와 제목은 다음과 같습니다:

🔗 영상 링크: ${url}  
🎬 영상 제목: ${title}

이 영상의 실제 내용을 반드시 함께 참고하여  
아래 텍스트의 내용을 조리 단계로 정리해주세요.

---

요약 및 구조화 규칙:
1. 단계별로 "1단계", "2단계"로 번호를 붙여 정리하고, 각 단계는 여러 '세부 조리 동작'으로 구성될 수 있습니다.
2. 각 세부 조리 동작은 다음 정보를 포함합니다:
   - 조리 동작 이름
   - 사용된 재료 목록 (있는 경우)
   - 조리 과정 설명
   - 시작 타임라인 (**시:분:초 단위로 해당 동작이 영상에서 처음 시작되는 시점을 정확히 기입**)
3. 재료는 반드시 이름(name)과 용량/개수(quantity)를 모두 명시합니다.
4. 중복되는 표현은 간결하게 통합하며, 블로그 스타일처럼 자연스럽고 구체적으로 작성해주세요.
5. 반드시 유튜브 영상의 실제 조리 장면을 기준으로 내용의 신뢰성을 확보하세요.
6. 타임라인은 시각적으로 조리 동작이 **시작되는 순간**을 기준으로 작성합니다.
7. 가능한 경우, 영상 내용을 바탕으로 다음 항목을 **추정**하여 함께 기입하세요:
   - 준비 시간(prep_time)과 조리 시간(cook_time): 분 단위로 추정
   - 난이도(difficulty_level): easy, medium, hard 중 선택
   - 영양 정보(nutrition_info): 칼로리, 탄수화물, 단백질, 지방을 g 또는 kcal 단위로 추정
8. 요리의 주재료, 조리법, 카테고리를 반영한 태그(tags)를 3~6개 작성하세요.

※ 타임라인은 가능한 한 시각적으로 동작이 시작되는 순간 또는 조리 동작이 언어로 언급되는 순간을 기준으로 가장 먼저 등장한 시점을 사용하세요.

--- 타임라인 예시 ---

1단계: 재료 준비 및 손질
- 재료: 파, 마늘, 피망
- 설명: 파 흰대 반 개와 마늘 반 큰술을 다져 준비합니다. 피망은 색감을 위해 선택적으로 사용합니다.
- 시작 타임라인: 00:00:38

...

---

추가 지시사항 (매우 중요):
- **출력은 반드시 아래 JSON 형식으로만 작성합니다.**
- **설명이나 문장 없이 JSON만 반환하세요.**
- **JSON 이외의 텍스트("설명", "코드 블록", "\\\`\\\`\\\`json" 등)는 절대 포함하지 마세요.**
- **모든 필드는 아래 스키마를 정확히 따릅니다.**
- ⚠️ **"title" 필드는 반드시 위에서 제공된 유튜브 영상 제목("${title}")을 그대로 사용하세요.**
  - 요약하거나 재구성하지 말고, 원문 제목을 그대로 입력합니다.

---

📘 JSON 출력 스키마 (Supabase recipes 테이블 구조 기반):

{
  "title": "${title}",
  "description": "string (요약 설명)",
  "ingredients": [
    {
      "name": "string (재료명)",
      "quantity": "string (용량, 개수, 비율 등)"
    }
  ],
  "instructions": [
    {
      "step": number,
      "title": "string (단계 제목)",
      "actions": [
        {
          "action": "string (조리 동작 이름)",
          "description": "string (조리 과정 설명)",
          "ingredients": [
            { "name": "string (재료명)", "quantity": "string (해당 단계 사용량 또는 단위)" }
          ],
          "start_time": "00:00:00"
        }
      ]
    }
  ],
  "prep_time": number (분 단위, 없으면 null),
  "cook_time": number (분 단위, 없으면 null),
  "servings": number (인분 수, 없으면 null),
  "difficulty_level": "easy | medium | hard",
  "tags": ["AI-Generated", "YouTube", "요리명", "카테고리", "조리법"],
  "nutrition_info": {
    "calories": "0 kcal",
    "carbs": "0 g",
    "protein": "0 g",
    "fat": "0 g"
  },
  "source_url": "${url}",
  "ai_generated": true,
  "ai_analysis_data": {
    "model": "gemini-2.5-flash",
    "processed_at": "${processedAt}"
  }
}

---

이 스키마를 반드시 따르며, 아래 원문 텍스트를 분석해 JSON을 작성하세요.
JSON 이외의 설명 문장은 절대 포함하지 마세요.

--- 아래는 통합된 원문 텍스트입니다 ---
-------------------------------
${combinedText}`;
}

try {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`❌ 통합 텍스트 파일이 없습니다: ${inputPath}`);
  }

  const combinedText = fs.readFileSync(inputPath, "utf-8");
  const promptText = generatePromptText(videoUrl, videoTitle, combinedText);

  ensureDirectoryExists(outputDir);
  fs.writeFileSync(outputPath, promptText, "utf-8");

  console.log(`✅ 프롬프트 파일 생성 완료 (Supabase JSON 확장형): ${outputPath}`);
} catch (error) {
  console.error("❌ 프롬프트 생성 중 오류 발생:", error.message);
  process.exit(1);
}
