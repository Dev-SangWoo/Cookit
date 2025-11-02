// YouTube 분석 API 테스트
const axios = require('axios');

async function testYouTubeAnalysis() {
  try {
    console.log('🔍 YouTube 분석 API 테스트 시작...');
    
    const testData = {
      videoId: 'test123',
      title: '테스트 영상',
      channelTitle: '테스트 채널',
      thumbnail: 'https://example.com/thumbnail.jpg'
    };
    
    const response = await axios.post('http://localhost:3000/api/youtube-analysis/analyze', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ YouTube 분석 API 응답:');
    console.log('상태:', response.status);
    console.log('데이터:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ YouTube 분석 API 테스트 실패:');
    console.error('에러:', error.response?.data || error.message);
    console.error('상태 코드:', error.response?.status);
  }
}

testYouTubeAnalysis();



