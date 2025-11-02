const axios = require('axios');

async function testTextRecipeGeneration() {
  try {
    console.log('🤖 텍스트 기반 레시피 생성 시작...');
    
    const text = `
소갈비찜 만드는 방법:

1. 소갈비를 찬물에 담가 핏물을 빼고 준비합니다.
2. 양파와 당근을 썰어 준비합니다.
3. 팬에 기름을 두르고 소갈비를 볶습니다.
4. 양파와 당근을 넣고 볶습니다.
5. 간장, 설탕, 마늘을 넣고 끓입니다.
6. 중불에서 30분간 끓입니다.

비밀재료: 사과, 배, 대추 등이 들어갑니다.
    `;
    
    const response = await axios.post('http://localhost:3000/api/ai/generate-recipe', {
      text: text,
      videoUrl: 'https://www.youtube.com/watch?v=tOrUOZ7oFnc'
    });
    
    console.log('✅ 레시피 생성 완료!');
    console.log('결과:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ 레시피 생성 실패:', error.response?.data || error.message);
  }
}

testTextRecipeGeneration();

