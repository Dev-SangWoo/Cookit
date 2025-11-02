// YouTube API 키 테스트 스크립트
require('dotenv').config();
const axios = require('axios');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

async function testYouTubeAPI() {
  try {
    console.log('🔍 YouTube API 키 테스트 시작...');
    console.log('API 키:', YOUTUBE_API_KEY ? '설정됨' : '설정되지 않음');
    
    if (!YOUTUBE_API_KEY) {
      console.error('❌ YOUTUBE_API_KEY가 설정되지 않았습니다.');
      console.log('💡 .env 파일에 YOUTUBE_API_KEY=your_api_key_here 를 추가하세요.');
      return;
    }

    // 간단한 검색 테스트
    const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
      params: {
        part: 'snippet',
        q: '요리',
        type: 'video',
        maxResults: 1,
        key: YOUTUBE_API_KEY
      }
    });

    console.log('✅ YouTube API 연결 성공!');
    console.log('검색 결과:', response.data.items.length, '개 영상 발견');
    
    if (response.data.items.length > 0) {
      const video = response.data.items[0];
      console.log('첫 번째 영상:');
      console.log('- 제목:', video.snippet.title);
      console.log('- 채널:', video.snippet.channelTitle);
      console.log('- 영상 ID:', video.id.videoId);
    }

  } catch (error) {
    console.error('❌ YouTube API 테스트 실패:');
    console.error('에러:', error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      console.log('💡 API 키가 유효하지 않거나 할당량을 초과했습니다.');
    } else if (error.response?.status === 400) {
      console.log('💡 API 키가 잘못되었거나 YouTube Data API v3가 활성화되지 않았습니다.');
    }
  }
}

testYouTubeAPI();



