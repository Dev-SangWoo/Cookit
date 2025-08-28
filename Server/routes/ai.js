const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const router = express.Router();

// past_version_services 경로 (실제로는 services 폴더에 직접 위치)
const PAST_SERVICES_DIR = path.join(__dirname, '../services');

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
    fileSize: 100 * 1024 * 1024, // 100MB 제한
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'video') {
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('비디오 파일만 업로드 가능합니다.'));
      }
    } else if (file.fieldname === 'image') {
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
 * @desc YouTube 영상을 분석하여 레시피 생성 (past_version_services 사용)
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

    console.log(`🎬 YouTube 분석 요청 (past_version_services): ${url}`);
    
    // 현재 작업 디렉토리를 past_version_services로 변경
    const originalCwd = process.cwd();
    process.chdir(PAST_SERVICES_DIR);
    
    try {
      // 1. run_full_pipeline.js 실행
      console.log('▶️ [1/1] 전체 파이프라인 실행 중...');
      execSync(`node run_full_pipeline.js "${url}"`, { 
        stdio: 'inherit',
        timeout: 300000 // 5분 타임아웃
      });
      
      // 2. 결과 파일 읽기
      const videoId = extractVideoId(url);
      const resultPath = path.join(PAST_SERVICES_DIR, 'result_out', `${videoId}_summary.txt`);
      
      if (fs.existsSync(resultPath)) {
        const resultText = fs.readFileSync(resultPath, 'utf-8');
        
        // 결과를 구조화된 형태로 변환
        const recipe = parseRecipeFromText(resultText);
        
        res.json({
          success: true,
          recipe,
          metadata: {
            videoId,
            videoUrl: url,
            source: 'past_version_services',
            resultFile: resultPath
          }
        });
      } else {
        throw new Error('결과 파일을 찾을 수 없습니다.');
      }
      
    } finally {
      // 원래 작업 디렉토리로 복원
      process.chdir(originalCwd);
    }
    
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
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '비디오 파일이 필요합니다.'
      });
    }

    console.log(`📹 비디오 분석 요청: ${req.file.originalname}`);
    
    // 현재는 past_version_services가 YouTube 전용이므로
    // 업로드된 비디오는 지원하지 않음을 알림
    res.status(501).json({
      success: false,
      error: '업로드된 비디오 분석은 현재 지원하지 않습니다. YouTube URL을 사용해주세요.'
    });
    
  } catch (error) {
    console.error('비디오 분석 오류:', error);
    
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
 * @desc 이미지에서 텍스트 추출 (past_version_services의 OCR 기능 사용)
 * @formdata {file} image - 이미지 파일
 * @body {string} language - OCR 언어 (선택, 기본값: kor+eng)
 */
router.post('/ocr', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '이미지 파일이 필요합니다.'
      });
    }

    const { language = 'kor+eng' } = req.body;
    
    console.log(`🔍 OCR 분석 요청: ${req.file.originalname}`);
    
    // past_version_services의 OCR 기능을 사용하기 위해
    // 이미지를 임시로 복사하고 OCR 분석 수행
    const tempImagePath = path.join(PAST_SERVICES_DIR, 'temp_image.jpg');
    fs.copyFileSync(req.file.path, tempImagePath);
    
    // 현재 작업 디렉토리 변경
    const originalCwd = process.cwd();
    process.chdir(PAST_SERVICES_DIR);
    
    try {
      // Tesseract.js를 직접 사용하여 OCR 수행
      const Tesseract = require('tesseract.js');
      
      const { data: { text } } = await Tesseract.recognize(
        tempImagePath,
        language,
        { 
          logger: m => {
            if (m.status === 'recognizing text') {
              process.stdout.write('.');
            }
          }
        }
      );
      
      // 임시 파일 삭제
      if (fs.existsSync(tempImagePath)) {
        fs.unlinkSync(tempImagePath);
      }
      
      res.json({
        success: true,
        text: text.trim(),
        metadata: {
          fileName: req.file.originalname,
          language,
          fileSize: req.file.size,
          source: 'past_version_services'
        }
      });
      
    } finally {
      process.chdir(originalCwd);
    }
    
  } catch (error) {
    console.error('OCR 분석 오류:', error);
    
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
 * @desc 텍스트에서 레시피 생성 (past_version_services의 Gemini 기능 사용)
 * @body {string} text - 분석할 텍스트
 * @body {string} videoUrl - 원본 영상 URL (선택)
 */
router.post('/generate-recipe', async (req, res) => {
  try {
    const { text, videoUrl } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: '분석할 텍스트가 필요합니다.'
      });
    }

    console.log(`🤖 레시피 생성 요청 (past_version_services): ${text.length}자`);
    
    // 현재 작업 디렉토리 변경
    const originalCwd = process.cwd();
    process.chdir(PAST_SERVICES_DIR);
    
    try {
      // 임시 파일 생성
      const tempId = `temp_${Date.now()}`;
      const promptPath = path.join(PAST_SERVICES_DIR, 'prompt_out', `${tempId}_prompt.txt`);
      
      // 프롬프트 디렉토리 생성
      if (!fs.existsSync(path.dirname(promptPath))) {
        fs.mkdirSync(path.dirname(promptPath), { recursive: true });
      }
      
      // 프롬프트 생성
      const promptText = generatePromptText(videoUrl || '', text);
      fs.writeFileSync(promptPath, promptText, 'utf-8');
      
      // send_to_gemini.js 실행 (텍스트만 사용)
      console.log('🚀 Gemini 요청 중...');
      
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      require('dotenv').config();
      
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      });
      
      const input = {
        contents: [{
          parts: [
            {
              text: `다음은 텍스트 분석 결과입니다. 조리 과정을 단계별로 요약해주세요.\n\n${promptText}`,
            },
          ],
        }],
      };
      
      const result = await model.generateContent(input);
      const summaryText = result.response.text();
      
      // 결과를 구조화된 형태로 변환
      const recipe = parseRecipeFromText(summaryText);
      
      res.json({
        success: true,
        recipe,
        metadata: {
          textLength: text.length,
          videoUrl: videoUrl || null,
          source: 'past_version_services'
        }
      });
      
    } finally {
      process.chdir(originalCwd);
    }
    
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
        ffmpeg: true,
        source: 'past_version_services'
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
    // past_version_services 파일들이 존재하는지 확인
    const requiredFiles = [
      'run_full_pipeline.js',
      'ocr_analyze.js',
      'send_to_gemini.js',
      'generate_combined_text.js',
      'generate_prompt.js'
    ];
    
    const missingFiles = requiredFiles.filter(file => 
      !fs.existsSync(path.join(PAST_SERVICES_DIR, file))
    );
    
    if (missingFiles.length > 0) {
      return res.status(503).json({
        success: false,
        status: 'unhealthy',
        error: `Missing files: ${missingFiles.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      status: 'healthy',
      source: 'past_version_services',
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

// 헬퍼 함수들

/**
 * YouTube URL에서 video ID 추출
 */
function extractVideoId(url) {
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : `video_${Date.now()}`;
}

/**
 * 프롬프트 텍스트 생성
 */
function generatePromptText(url, text) {
  return `당신은 요리 분석 전문가입니다.

다음 텍스트는 요리 관련 내용입니다.
${url ? `이 영상의 주소는 다음과 같습니다:\n🔗 영상 링크: ${url}\n` : ''}

이 내용을 조리 단계로 정리해주세요.

요약 규칙:
1. 단계별로 "1단계", "2단계"로 번호를 붙여 정리하고, 각 단계는 여러 '세부 조리 동작'으로 구성될 수 있습니다.
2. 각 세부 조리 동작은 다음 정보를 포함합니다:
   - 조리 동작 이름
   - 사용된 재료 목록 (있는 경우)
   - 조리 과정 설명
3. 중복되는 표현은 간결하게 통합하며, 블로그 스타일처럼 자연스럽고 구체적으로 작성해주세요.

--- 아래는 분석할 텍스트입니다 ---
-------------------------------
${text}`;
}

/**
 * 텍스트에서 레시피 구조 파싱
 */
function parseRecipeFromText(text) {
  try {
    // JSON 블록이 있는지 확인
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    
    // 일반 JSON 추출
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      const jsonStr = text.substring(jsonStart, jsonEnd);
      return JSON.parse(jsonStr);
    }
    
    // 구조화된 텍스트가 없는 경우 기본 구조로 반환
    return {
      title: 'AI 생성 레시피',
      description: 'AI가 분석한 요리 레시피입니다.',
      ingredients: [],
      steps: [],
      prep_time: null,
      cook_time: null,
      servings: null,
      difficulty: 'medium',
      tags: ['AI-Generated'],
      nutrition: null,
      rawResponse: text
    };
  } catch (error) {
    console.warn('⚠️ 레시피 파싱 실패, 기본 구조 사용:', error.message);
    return {
      title: 'AI 생성 레시피',
      description: 'AI가 분석한 요리 레시피입니다.',
      ingredients: [],
      steps: [],
      prep_time: null,
      cook_time: null,
      servings: null,
      difficulty: 'medium',
      tags: ['AI-Generated'],
      nutrition: null,
      rawResponse: text
    };
  }
}

module.exports = router;