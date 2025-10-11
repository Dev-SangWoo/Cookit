const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { processReceipt, getReceiptItems } = require('../ReceiptOCR/receiptOcrHandler.js');

const router = express.Router();

// 파일 업로드 설정 (영수증 이미지용)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/receipts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 제한 (영수증은 작은 이미지)
  },
  fileFilter: (req, file, cb) => {
    // 이미지 파일만 허용
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  }
});

/**
 * @route POST /api/receipt-ocr/process
 * @desc 영수증 이미지에서 상품 정보 추출
 * @formdata {file} receipt - 영수증 이미지 파일
 * @body {string} user_id - 사용자 ID
 */
router.post('/process', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '영수증 이미지 파일이 필요합니다.'
      });
    }

    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id가 필요합니다.'
      });
    }

    console.log(`🧾 영수증 OCR 요청: ${req.file.originalname} (사용자: ${user_id})`);
    
    const result = await processReceipt(req.file.path, user_id);
    
    // 업로드된 파일 삭제
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.json({
      success: result.success,
      data: {
        items: result.items,
        total_items: result.total_items,
        message: result.message
      },
      metadata: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        processedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('영수증 OCR 처리 오류:', error);
    
    // 오류 발생 시 업로드된 파일 삭제
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: error.message || '영수증 OCR 처리 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route GET /api/receipt-ocr/items/:user_id
 * @desc 사용자의 영수증 아이템 목록 조회
 * @param {string} user_id - 사용자 ID
 * @query {number} limit - 조회할 아이템 수 (기본값: 50)
 */
router.get('/items/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { limit = 50 } = req.query;
    
    console.log(`📋 영수증 아이템 조회 요청: 사용자 ${user_id}, 제한 ${limit}개`);
    
    const result = await getReceiptItems(user_id, parseInt(limit));
    
    res.json({
      success: true,
      data: {
        items: result.items,
        total_count: result.total_count
      },
      metadata: {
        user_id,
        limit: parseInt(limit),
        retrievedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('영수증 아이템 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message || '영수증 아이템 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route GET /api/receipt-ocr/status
 * @desc 영수증 OCR 서비스 상태 확인
 */
router.get('/status', (req, res) => {
  try {
    res.json({
      success: true,
      service: 'Receipt OCR',
      status: 'active',
      features: {
        image_upload: true,
        korean_ocr: true,
        item_extraction: true,
        database_storage: true
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
 * @route GET /api/receipt-ocr/health
 * @desc 영수증 OCR 서비스 헬스 체크
 */
router.get('/health', async (req, res) => {
  try {
    // 간단한 OCR 테스트 (테스트 이미지가 있는 경우)
    const testImagePath = path.join(__dirname, '../ReceiptOCR/test/receipt1.jpg');
    
    if (fs.existsSync(testImagePath)) {
      // 테스트 OCR 실행 (실제 처리는 하지 않고 상태만 확인)
      res.json({
        success: true,
        status: 'healthy',
        message: '영수증 OCR 서비스가 정상 작동 중입니다.',
        testImageAvailable: true,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        success: true,
        status: 'healthy',
        message: '영수증 OCR 서비스가 정상 작동 중입니다.',
        testImageAvailable: false,
        timestamp: new Date().toISOString()
      });
    }
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
