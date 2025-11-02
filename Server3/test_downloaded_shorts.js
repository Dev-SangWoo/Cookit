const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testDownloadedShortsAnalysis() {
  try {
    console.log('📹 다운로드된 YouTube Shorts 분석 시작...');
    
    const videoPath = '진짜 부드럽게 만드는 \'소갈비찜\' 레시피 알려드릴게요! [uNs6pQtF7AA].mp4';
    
    if (!fs.existsSync(videoPath)) {
      console.error('❌ 비디오 파일을 찾을 수 없습니다:', videoPath);
      return;
    }
    
    console.log('✅ 비디오 파일 발견:', videoPath);
    
    const form = new FormData();
    form.append('video', fs.createReadStream(videoPath));
    
    const response = await axios.post('http://localhost:3000/api/ai/analyze-video', form, {
      headers: {
        ...form.getHeaders()
      }
    });
    
    console.log('✅ 분석 완료!');
    console.log('결과:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ 분석 실패:', error.response?.data || error.message);
  }
}

testDownloadedShortsAnalysis();

