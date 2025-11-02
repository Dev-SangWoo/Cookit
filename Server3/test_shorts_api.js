const axios = require('axios');

async function testYouTubeShortsAnalysis() {
  try {
    console.log('🎬 YouTube Shorts 분석 시작...');
    console.log('URL: https://www.youtube.com/shorts/uNs6pQtF7AA?feature=share');
    
    const response = await axios.post('http://localhost:3000/api/ai/analyze-youtube', {
      url: 'https://www.youtube.com/shorts/uNs6pQtF7AA?feature=share'
    });
    
    console.log('✅ 분석 완료!');
    console.log('결과:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ 분석 실패:', error.response?.data || error.message);
    
    // 실패 시 텍스트 기반으로 대체 시도
    console.log('\n🔄 텍스트 기반 레시피 생성으로 대체 시도...');
    
    try {
      const textResponse = await axios.post('http://localhost:3000/api/ai/generate-recipe', {
        text: 'YouTube Shorts 영상에서 추출된 요리 정보를 바탕으로 레시피를 생성해주세요.',
        videoUrl: 'https://www.youtube.com/shorts/uNs6pQtF7AA?feature=share'
      });
      
      console.log('✅ 텍스트 기반 레시피 생성 완료!');
      console.log('결과:', JSON.stringify(textResponse.data, null, 2));
      
    } catch (textError) {
      console.error('❌ 텍스트 기반 생성도 실패:', textError.response?.data || textError.message);
    }
  }
}

testYouTubeShortsAnalysis();

