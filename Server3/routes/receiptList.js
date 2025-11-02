const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const receiptOcrService = require('../services/receiptOcrService');
const { supabase } = require('../services/supabaseService');

// Multer 설정 (파일 업로드)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads/receipts/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 제한
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  }
});

// 영수증 OCR 처리 및 목록화 API
router.post('/process', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '영수증 이미지가 필요합니다.' });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: '사용자 ID가 필요합니다.' });
    }

    const imagePath = req.file.path;
    console.log('📄 영수증 OCR 처리 시작:', imagePath);

    // OCR 처리
    const ocrResult = await receiptOcrService.processReceiptOcr(imagePath, userId);
    
    if (!ocrResult.success) {
      // 임시 파일 삭제
      fs.unlinkSync(imagePath);
      return res.status(500).json({ error: ocrResult.error });
    }

    // 상품 분류
    const categorizedItems = receiptOcrService.categorizeReceiptItems(ocrResult.items);

    // Supabase에 저장
    let savedItems = [];
    if (ocrResult.items.length > 0) {
      try {
        const { data, error } = await supabase
          .from('receipt_items')
          .insert(
            ocrResult.items.map(item => ({
              user_id: userId,
              product_name: item.product_name,
              quantity: item.quantity,
              // 기존 테이블 구조에 맞게 수정
              // price와 category는 기존 테이블에 없으므로 제외
              created_at: new Date().toISOString()
            }))
          )
          .select();

        if (error) {
          console.error('❌ Supabase 저장 실패:', error);
        } else {
          savedItems = data;
          console.log('✅ Supabase 저장 성공:', data);
        }
      } catch (dbError) {
        console.error('❌ 데이터베이스 저장 오류:', dbError);
      }
    }

    // 임시 파일 삭제
    fs.unlinkSync(imagePath);

    res.json({
      success: true,
      data: {
        receiptInfo: ocrResult.receiptInfo,
        items: ocrResult.items,
        categorizedItems,
        savedItems,
        totalItems: ocrResult.items.length,
        totalAmount: ocrResult.receiptInfo.totalAmount
      }
    });

  } catch (error) {
    console.error('영수증 OCR 처리 오류:', error);
    
    // 임시 파일 삭제
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'OCR 처리 중 오류가 발생했습니다.' });
  }
});

// 사용자의 영수증 아이템 목록 조회
router.get('/items/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { category, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('receipt_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('❌ 영수증 아이템 조회 실패:', error);
      return res.status(500).json({ error: '아이템 조회 중 오류가 발생했습니다.' });
    }

    // 카테고리별로 분류 (기존 테이블에는 category 필드가 없으므로 서비스에서만 분류)
    const categorizedItems = receiptOcrService.categorizeReceiptItems(data || []);

    res.json({
      success: true,
      data: {
        items: data || [],
        categorizedItems,
        totalCount: data?.length || 0
      }
    });

  } catch (error) {
    console.error('영수증 아이템 조회 오류:', error);
    res.status(500).json({ error: '아이템 조회 중 오류가 발생했습니다.' });
  }
});

// 영수증 아이템 삭제
router.delete('/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { userId } = req.body;

    const { error } = await supabase
      .from('receipt_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ 아이템 삭제 실패:', error);
      return res.status(500).json({ error: '아이템 삭제 중 오류가 발생했습니다.' });
    }

    res.json({
      success: true,
      message: '아이템이 삭제되었습니다.'
    });

  } catch (error) {
    console.error('아이템 삭제 오류:', error);
    res.status(500).json({ error: '아이템 삭제 중 오류가 발생했습니다.' });
  }
});

// 영수증 통계 조회
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('receipt_items')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('❌ 통계 조회 실패:', error);
      return res.status(500).json({ error: '통계 조회 중 오류가 발생했습니다.' });
    }

    const items = data || [];
    const categorizedItems = receiptOcrService.categorizeReceiptItems(items);
    
    const stats = {
      totalItems: items.length,
      // 기존 테이블에는 price 필드가 없으므로 0으로 설정
      totalAmount: 0,
      categoryCounts: Object.keys(categorizedItems).reduce((acc, category) => {
        acc[category] = categorizedItems[category].length;
        return acc;
      }, {}),
      recentItems: items.slice(0, 10)
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('통계 조회 오류:', error);
    res.status(500).json({ error: '통계 조회 중 오류가 발생했습니다.' });
  }
});

// 카테고리별 아이템 조회
router.get('/category/:userId/:category', async (req, res) => {
  try {
    const { userId, category } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('receipt_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ 카테고리별 아이템 조회 실패:', error);
      return res.status(500).json({ error: '카테고리별 아이템 조회 중 오류가 발생했습니다.' });
    }

    // 카테고리별로 필터링
    const categorizedItems = receiptOcrService.categorizeReceiptItems(data || []);
    const categoryItems = categorizedItems[category] || [];

    res.json({
      success: true,
      data: {
        category,
        items: categoryItems,
        totalCount: categoryItems.length
      }
    });

  } catch (error) {
    console.error('카테고리별 아이템 조회 오류:', error);
    res.status(500).json({ error: '카테고리별 아이템 조회 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
