const axios = require('axios');

async function testYouTubeAnalysis() {
  try {
    console.log('🎬 YouTube 영상 분석 시작...');
    console.log('URL: https://www.youtube.com/watch?v=tOrUOZ7oFnc');
    
    const response = await axios.post('http://localhost:3000/api/ai/analyze-youtube', {
      url: 'https://www.youtube.com/watch?v=tOrUOZ7oFnc'
    });
    
    console.log('✅ 분석 완료!');
    console.log('결과:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ 분석 실패:', error.response?.data || error.message);
  }
}

testYouTubeAnalysis();

