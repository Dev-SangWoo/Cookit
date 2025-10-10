const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY가 환경변수에 설정되지 않았습니다.');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });
  }

  /**
   * 텍스트를 요리 레시피로 변환
   * @param {string} combinedText - OCR, 자막, Whisper 통합 텍스트
   * @param {string} videoUrl - 원본 YouTube URL
   * @returns {Promise<Object>} 구조화된 레시피
   */
  async generateRecipeFromText(combinedText, videoUrl = '') {
    try {
      const prompt = this.generateRecipePrompt(combinedText, videoUrl);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const recipeText = response.text();

      // 구조화된 레시피로 파싱
      return this.parseRecipeResponse(recipeText);
    } catch (error) {
      console.error('Gemini API 요청 오류:', error);
      throw new Error(`레시피 생성 실패: ${error.message}`);
    }
  }

  /**
   * 영상과 텍스트를 함께 분석하여 레시피 생성
   * @param {string} videoPath - 영상 파일 경로
   * @param {string} combinedText - 통합 텍스트
   * @param {string} videoUrl - 원본 URL
   * @returns {Promise<Object>} 구조화된 레시피
   */
  async generateRecipeFromVideoAndText(videoPath, combinedText, videoUrl = '') {
    try {
      const videoPart = this.createVideoPart(videoPath);
      const prompt = this.generateRecipePrompt(combinedText, videoUrl);
      
      const result = await this.model.generateContent([prompt, videoPart]);
      const response = await result.response;
      const recipeText = response.text();

      return this.parseRecipeResponse(recipeText);
    } catch (error) {
      console.error('Gemini 영상+텍스트 분석 오류:', error);
      throw new Error(`영상 분석 실패: ${error.message}`);
    }
  }

  /**
   * 영상 파일을 Gemini용 객체로 변환
   * @param {string} filePath - 영상 파일 경로
   * @returns {Object} Gemini 영상 파트
   */
  createVideoPart(filePath) {
    const fileData = fs.readFileSync(filePath);
    return {
      inlineData: {
        data: Buffer.from(fileData).toString("base64"),
        mimeType: "video/mp4",
      },
    };
  }

  /**
   * 레시피 생성을 위한 프롬프트 생성
   * @param {string} combinedText - 통합 텍스트
   * @param {string} videoUrl - 영상 URL
   * @returns {string} 생성된 프롬프트
   */
  generateRecipePrompt(combinedText, videoUrl) {
    return `당신은 요리 분석 전문가입니다.

다음 텍스트는 하나의 요리 유튜브 영상에서 추출된 자막, OCR, Whisper 텍스트를 통합한 것입니다.
${videoUrl ? `이 영상의 주소: ${videoUrl}` : ''}

이 텍스트의 내용을 조리 단계별로 정리하여 구조화된 레시피를 만들어주세요.

중요한 요구사항:
1. 각 조리 단계마다 영상에서 해당 단계가 시작되는 시간과 끝나는 시간을 정확히 추정해주세요.
2. 시간은 HH:MM:SS 형식으로 표기해주세요 (예: "00:01:30", "00:05:45").
3. 텍스트 내용과 자막의 시간 정보를 종합하여 각 단계의 시작/종료 시간을 결정해주세요.

요약 규칙:
1. 단계별로 "1단계", "2단계"로 번호를 붙여 정리하고, 각 단계는 여러 '세부 조리 동작'으로 구성될 수 있습니다.
2. 각 세부 조리 동작은 다음 정보를 포함합니다:
   - 동작: 구체적인 조리 행동 (예: "양파를 다진다", "팬에 기름을 두른다")
   - 재료: 해당 단계에서 사용되는 재료와 양 (예: "양파 1개", "식용유 2큰술")
   - 도구: 사용되는 조리 도구 (예: "칼", "도마", "팬")
   - 시간: 예상 소요 시간 (예: "3분", "중불에서 5분")
   - 팁: 주의사항이나 요령 (선택사항)

3. 최종적으로 다음 JSON 형식으로 출력해주세요:
{
  "title": "요리 제목",
  "description": "요리 설명",
  "ingredients": [
    {"name": "재료명", "amount": "양", "unit": "단위"}
  ],
  "tools": ["필요한 도구들"],
  "steps": [
    {
      "stepNumber": 1,
      "title": "단계 제목",
      "start_time": "00:01:30",
      "end_time": "00:03:45",
      "actions": [
        {
          "action": "구체적인 행동",
          "ingredients": ["사용 재료"],
          "tools": ["사용 도구"],
          "time": "소요시간",
          "tip": "팁 (선택사항)"
        }
      ]
    }
  ],
  "cookingTime": "총 조리시간",
  "servings": "인분",
  "difficulty": "난이도",
  "tags": ["태그들"]
}

주의사항:
- start_time과 end_time은 각 단계가 영상에서 시작되고 끝나는 정확한 시간이어야 합니다.
- 시간 추정이 어려운 경우, 텍스트 내용과 자막의 흐름을 바탕으로 합리적으로 추정해주세요.
- 각 단계는 연속적이어야 하며, 겹치지 않도록 해주세요.

분석할 텍스트:
${combinedText}`;
  }

  /**
   * Gemini 응답을 구조화된 레시피로 파싱
   * @param {string} responseText - Gemini 응답 텍스트
   * @returns {Object} 파싱된 레시피 객체
   */
  parseRecipeResponse(responseText) {
    try {
      // JSON 부분만 추출 시도
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // JSON 파싱 실패 시 기본 구조 반환
      return {
        title: "요리 레시피",
        description: "AI가 생성한 레시피입니다.",
        rawResponse: responseText,
        ingredients: [],
        tools: [],
        steps: [],
        cookingTime: "미정",
        servings: "미정",
        difficulty: "중급",
        tags: ["AI생성"]
      };
    } catch (error) {
      console.error('레시피 파싱 오류:', error);
      return {
        title: "레시피 파싱 오류",
        error: error.message,
        rawResponse: responseText
      };
    }
  }
}

module.exports = GeminiService;