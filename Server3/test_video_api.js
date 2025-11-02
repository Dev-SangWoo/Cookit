const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testVideoAnalysis() {
  try {
    console.log('📹 로컬 비디오 파일 분석 시작...');
    
    const videoPath = '한번 보면 성공하는 소갈비찜 비밀재료 공개합니다 [tOrUOZ7oFnc].mp4';
    
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

testVideoAnalysis();

