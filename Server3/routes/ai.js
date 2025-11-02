const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AIPipelineService = require('../services/aiPipelineService');
const OCRService = require('../services/ocrService');
const GeminiService = require('../services/geminiService');

const router = express.Router();

// AI 서비스 인스턴스는 필요할 때 생성하도록 변경
let aiPipeline = null;
let ocrService = null;
let geminiService = null;

// 서비스 인스턴스 초기화 함수
function initServices() {
  if (!aiPipeline) aiPipeline = new AIPipelineService();
  if (!ocrService) ocrService = new OCRService();
  if (!geminiService) geminiService = new GeminiService();
}

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB 제한
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'video') {
      // 비디오 파일 검증
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('비디오 파일만 업로드 가능합니다.'));
      }
    } else if (file.fieldname === 'image') {
      // 이미지 파일 검증
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('이미지 파일만 업로드 가능합니다.'));
      }
    } else {
      cb(null, true);
    }
  }
});

/**
 * @route POST /api/ai/analyze-youtube
 * @desc YouTube 영상을 분석하여 레시피 생성
 * @body {string} url - YouTube URL
 */
router.post('/analyze-youtube', async (req, res) => {
  try {
    initServices(); // 서비스 초기화
    
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'YouTube URL이 필요합니다.'
      });
    }

    console.log(`🎬 YouTube 분석 요청: ${url}`);
    
    const result = await aiPipeline.analyzeYouTubeVideo(url);
    
    res.json(result);
  } catch (error) {
    console.error('YouTube 분석 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/ai/analyze-video
 * @desc 업로드된 비디오 파일을 분석하여 레시피 생성
 * @formdata {file} video - 비디오 파일
 */
router.post('/analyze-video', upload.single('video'), async (req, res) => {
  try {
    initServices(); // 서비스 초기화
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '비디오 파일이 필요합니다.'
      });
    }

    console.log(`📹 비디오 분석 요청: ${req.file.originalname}`);
    
    const result = await aiPipeline.analyzeUploadedVideo(req.file.path);
    
    // 업로드된 파일 삭제
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.json(result);
  } catch (error) {
    console.error('비디오 분석 오류:', error);
    
    // 오류 발생 시 업로드된 파일 삭제
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/ai/ocr
 * @desc 이미지에서 텍스트 추출
 * @formdata {file} image - 이미지 파일
 * @body {string} language - OCR 언어 (선택, 기본값: kor+eng)
 */
router.post('/ocr', upload.single('image'), async (req, res) => {
  try {
    initServices(); // 서비스 초기화
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '이미지 파일이 필요합니다.'
      });
    }

    const { language = 'kor+eng' } = req.body;
    
    console.log(`🔍 OCR 분석 요청: ${req.file.originalname}`);
    
    const extractedText = await ocrService.extractTextFromImage(req.file.path, language);
    
    // 업로드된 파일 삭제
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.json({
      success: true,
      text: extractedText,
      metadata: {
        fileName: req.file.originalname,
        language,
        fileSize: req.file.size
      }
    });
  } catch (error) {
    console.error('OCR 분석 오류:', error);
    
    // 오류 발생 시 업로드된 파일 삭제
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/ai/generate-recipe
 * @desc 텍스트에서 레시피 생성
 * @body {string} text - 분석할 텍스트
 * @body {string} videoUrl - 원본 영상 URL (선택)
 */
router.post('/generate-recipe', async (req, res) => {
  try {
    initServices(); // 서비스 초기화
    
    const { text, videoUrl } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: '분석할 텍스트가 필요합니다.'
      });
    }

    console.log(`🤖 레시피 생성 요청 (텍스트 길이: ${text.length}자)`);
    
    const recipe = await geminiService.generateRecipeFromText(text, videoUrl);
    
    res.json({
      success: true,
      recipe,
      metadata: {
        textLength: text.length,
        videoUrl: videoUrl || null
      }
    });
  } catch (error) {
    console.error('레시피 생성 오류:', error);
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
        ocr: true,
        whisper: true,
        ffmpeg: true // TODO: 실제 ffmpeg 설치 확인
      },
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
 * @route GET /api/ai/health
 * @desc AI 서비스 헬스 체크
 */
router.get('/health', async (req, res) => {
  try {
    initServices(); // 서비스 초기화
    
    // 간단한 Gemini API 연결 테스트
    const testResult = await geminiService.generateRecipeFromText(
      '간단한 테스트 텍스트입니다.', 
      ''
    );
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      testResult: !!testResult
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

module.exports = router;