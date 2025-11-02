const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiDirect() {
  try {
    console.log('🔍 Gemini API 직접 테스트 시작...');
    
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY가 설정되지 않았습니다.');
      return;
    }
    
    console.log('✅ GEMINI_API_KEY 확인됨');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });
    
    console.log('✅ Gemini 모델 초기화 완료');
    
    const prompt = "간단한 계란후라이 레시피를 JSON 형식으로 만들어주세요.";
    
    console.log('🤖 Gemini API 호출 중...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini 응답 받음!');
    console.log('📝 응답 길이:', text.length);
    console.log('📝 응답 내용:');
    console.log(text);
    
  } catch (error) {
    console.error('❌ Gemini API 테스트 실패:', error.message);
    console.error('상세 오류:', error);
  }
}

testGeminiDirect();






