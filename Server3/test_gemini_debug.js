const axios = require('axios');

async function testGeminiDebug() {
  try {
    console.log('🔍 Gemini 디버그 테스트 시작...');
    
    const text = "소갈비찜 만드는 방법: 소갈비를 찬물에 담가 핏물을 빼고, 양파와 당근을 썰어 준비합니다. 팬에 기름을 두르고 소갈비를 볶은 후, 양파와 당근을 넣고 볶습니다. 간장, 설탕, 마늘을 넣고 끓입니다.";
    
    const response = await axios.post('http://localhost:3000/api/ai/generate-recipe', {
      text: text,
      videoUrl: 'https://www.youtube.com/watch?v=tOrUOZ7oFnc'
    });
    
    console.log('✅ 응답 받음!');
    console.log('전체 응답:', JSON.stringify(response.data, null, 2));
    
    if (response.data.recipe && response.data.recipe.rawResponse) {
      console.log('\n📝 Gemini 원본 응답:');
      console.log(response.data.recipe.rawResponse);
    }
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.response?.data || error.message);
  }
}

testGeminiDebug();

