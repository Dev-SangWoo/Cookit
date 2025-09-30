const express = require('express');
const { processYouTubeVideo, generateStructuredRecipeWithGemini } = require('../services/enhanced_ai_pipeline');

const router = express.Router();

// 구조화된 AI 파이프라인만 사용 - 파일 업로드 기능 제거

/**
 * @route POST /api/ai/analyze-youtube
 * @desc YouTube 영상을 분석하여 구조화된 레시피 생성 후 DB 저장
 * @body {string} url - YouTube URL
 */
router.post('/analyze-youtube', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'YouTube URL이 필요합니다.'
      });
    }

    console.log(`🎬 YouTube 분석 요청: ${url}`);
    
    // 구조화된 파이프라인 실행 및 DB 자동 저장
    const result = await processYouTubeVideo(url);
    
    res.json({
      success: true,
      message: '레시피가 성공적으로 분석되고 저장되었습니다.',
      recipeId: result.recipe_id,  // 생성된 레시피 ID 반환
      recipe: {
        id: result.recipe_id,
        title: result.title,
      },
      ...result
    });
    
  } catch (error) {
    console.error('YouTube 분석 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});





/**
 * @route GET /api/ai/status
 * @desc AI 서비스 상태 확인
 */
router.get('/status', (req, res) => {
  try {
    res.json({
      success: true,
      status: 'active',
      services: {
        gemini: !!process.env.GEMINI_API_KEY,
        structured_pipeline: true,
        supabase_integration: true,
        ocr: true,
        ffmpeg: true
      },
      pipeline_version: 'enhanced_structured',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/ai/test
 * @desc 구조화된 레시피 생성 테스트 (샘플 텍스트 사용)
 */
router.post('/test', async (req, res) => {
  try {
    const sampleText = `
김치찌개 만들기

재료:
- 돼지고기 200g
- 김치 300g
- 두부 200g
- 대파 1대
- 양파 반개
- 마늘 3쪽
- 고춧가루 1큰술
- 김치국물 1컵
- 물 2컵

조리과정:
1. 돼지고기를 한입 크기로 자르고 마늘을 다진다
2. 팬에 기름을 두르고 돼지고기를 볶는다
3. 김치와 양파를 넣고 함께 볶는다
4. 물과 김치국물을 넣고 끓인다
5. 두부와 대파를 넣고 5분 더 끓인다
6. 마지막에 고춧가루로 간을 맞춘다

조리시간: 25분
인분: 2인분
난이도: 쉬움
`;
    
    console.log('🧪 구조화된 레시피 생성 테스트 시작...');
    
    const structuredRecipe = await generateStructuredRecipeWithGemini(
      'https://youtube.com/watch?v=test',
      sampleText
    );
    
    res.json({
      success: true,
      message: '구조화된 레시피 생성 테스트 완료 - DB 저장은 하지 않음',
      recipe: structuredRecipe,
      sample_text_length: sampleText.length,
      note: 'DB에 저장하려면 /analyze-youtube 엔드포인트를 사용하세요'
    });
    
  } catch (error) {
    console.error('구조화된 레시피 테스트 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/ai/health
 * @desc AI 서비스 헬스 체크
 */
router.get('/health', async (req, res) => {
  try {
    // 필수 환경변수 확인
    const requiredEnvVars = ['GEMINI_API_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      return res.status(503).json({
        success: false,
        status: 'unhealthy',
        error: `Missing environment variables: ${missingEnvVars.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }
    
    // enhanced_ai_pipeline 모듈 로드 테스트
    try {
      require('../services/enhanced_ai_pipeline');
    } catch (error) {
      return res.status(503).json({
        success: false,
        status: 'unhealthy',
        error: 'Enhanced AI pipeline module not accessible',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      status: 'healthy',
      pipeline: 'enhanced_structured',
      features: {
        youtube_analysis: true,
        structured_json_output: true,
        automatic_db_storage: true
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 🎉 구조화된 AI 파이프라인만 사용 - 기존 헬퍼 함수들 제거됨
// 모든 기능은 enhanced_ai_pipeline.js에서 처리됩니다.

module.exports = router;