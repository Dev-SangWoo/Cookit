const express = require('express');
const router = express.Router();
const axios = require('axios');

// YouTube 영상 분석 API
router.post('/analyze', async (req, res) => {
  try {
    const { videoId, videoUrl, title, channelTitle } = req.body;
    
    if (!videoId && !videoUrl) {
      return res.status(400).json({ 
        success: false, 
        error: '영상 ID 또는 URL이 필요합니다.' 
      });
    }

    // YouTube 영상 URL 생성
    const youtubeUrl = videoUrl || `https://www.youtube.com/watch?v=${videoId}`;
    
    console.log('YouTube 영상 분석 시작:', {
      videoId,
      videoUrl: youtubeUrl,
      title,
      channelTitle
    });

    // AI 분석 서비스 호출 (기존 AI 파이프라인 활용)
    const analysisResult = await analyzeYouTubeVideo({
      videoId,
      videoUrl: youtubeUrl,
      title,
      channelTitle
    });

    res.json({
      success: true,
      data: {
        videoId,
        videoUrl: youtubeUrl,
        title,
        channelTitle,
        analysisId: analysisResult.analysisId,
        status: 'processing',
        message: '영상 분석이 시작되었습니다. 잠시 후 결과를 확인해주세요.'
      }
    });

  } catch (error) {
    console.error('YouTube 영상 분석 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: '영상 분석 중 오류가 발생했습니다.' 
    });
  }
});

// 영상 분석 상태 확인
router.get('/status/:analysisId', async (req, res) => {
  try {
    const { analysisId } = req.params;
    
    // 분석 상태 확인 로직 (실제 구현에서는 데이터베이스에서 상태 확인)
    const status = await checkAnalysisStatus(analysisId);
    
    res.json({
      success: true,
      data: {
        analysisId,
        status: status.status,
        progress: status.progress,
        result: status.result
      }
    });

  } catch (error) {
    console.error('분석 상태 확인 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: '분석 상태 확인 중 오류가 발생했습니다.' 
    });
  }
});

// 분석 결과 가져오기
router.get('/result/:analysisId', async (req, res) => {
  try {
    const { analysisId } = req.params;
    
    const result = await getAnalysisResult(analysisId);
    
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        error: '분석 결과를 찾을 수 없습니다.' 
      });
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('분석 결과 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: '분석 결과 조회 중 오류가 발생했습니다.' 
    });
  }
});

// YouTube 영상 분석 함수
async function analyzeYouTubeVideo({ videoId, videoUrl, title, channelTitle }) {
  try {
    // 분석 ID 생성
    const analysisId = `yt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 분석 작업을 백그라운드에서 시작
    startBackgroundAnalysis({
      analysisId,
      videoId,
      videoUrl,
      title,
      channelTitle
    });

    return {
      analysisId,
      status: 'processing'
    };

  } catch (error) {
    console.error('영상 분석 시작 오류:', error);
    throw error;
  }
}

// 백그라운드 분석 시작
async function startBackgroundAnalysis({ analysisId, videoId, videoUrl, title, channelTitle }) {
  try {
    console.log(`백그라운드 분석 시작: ${analysisId}`);
    
    // 기존 AI 파이프라인 서비스 호출
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:3000/api/ai';
    
    const analysisRequest = {
      type: 'youtube_analysis',
      videoUrl,
      videoId,
      title,
      channelTitle,
      analysisId
    };

    // AI 서비스에 분석 요청
    const response = await axios.post(`${aiServiceUrl}/analyze-video`, analysisRequest, {
      timeout: 30000 // 30초 타임아웃
    });

    console.log(`분석 완료: ${analysisId}`, response.data);
    
    // 분석 결과를 데이터베이스에 저장 (실제 구현에서는 DB 저장)
    await saveAnalysisResult(analysisId, response.data);

  } catch (error) {
    console.error(`백그라운드 분석 오류: ${analysisId}`, error);
    
    // 오류 상태 저장
    await saveAnalysisResult(analysisId, {
      status: 'error',
      error: error.message
    });
  }
}

// 분석 상태 확인
async function checkAnalysisStatus(analysisId) {
  // 실제 구현에서는 데이터베이스에서 상태 확인
  // 여기서는 임시로 처리 중 상태 반환
  return {
    status: 'processing',
    progress: 50,
    result: null
  };
}

// 분석 결과 가져오기
async function getAnalysisResult(analysisId) {
  // 실제 구현에서는 데이터베이스에서 결과 조회
  // 여기서는 임시 결과 반환
  return {
    analysisId,
    status: 'completed',
    result: {
      recipe: {
        title: '추출된 레시피 제목',
        description: 'AI가 분석한 레시피 설명',
        ingredients: ['재료1', '재료2', '재료3'],
        instructions: ['조리법 1', '조리법 2', '조리법 3'],
        cookingTime: '30분',
        difficulty: '중급',
        servings: '2인분'
      },
      videoInfo: {
        videoId: 'extracted_video_id',
        title: '원본 영상 제목',
        channelTitle: '채널명',
        duration: '10:30'
      }
    }
  };
}

// 분석 결과 저장
async function saveAnalysisResult(analysisId, result) {
  // 실제 구현에서는 데이터베이스에 저장
  console.log(`분석 결과 저장: ${analysisId}`, result);
}

module.exports = router;



