import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { supabase } from '../services/supabaseClient.js';
import { performOCR } from '../services/ocrHandler.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('이미지 파일만 업로드 가능합니다.'));
  },
});

// 상품 간단 분류 (카테고리 필드가 없으므로 이름 기반 임시 분류)
function categorizeReceiptItems(items) {
  const categories = {
    vegetables: ['배추', '양파', '대파', '고추', '감자', '호박'],
    meats: ['돼지', '소고기', '닭', '베이컨'],
    seafood: ['새우', '오징어', '낙지', '조개'],
    dairy: ['우유', '치즈', '버터', '요거트'],
    staples: ['밥', '라면', '밀가루', '설탕', '소금'],
  };

  const result = {};
  for (const item of items) {
    const name = item.product_name || '';
    let matched = 'others';
    for (const [cat, keys] of Object.entries(categories)) {
      if (keys.some(k => name.includes(k))) { matched = cat; break; }
    }
    if (!result[matched]) result[matched] = [];
    result[matched].push(item);
  }
  return result;
}

// 영수증 OCR 처리 API (DB 저장 없이 결과만 반환)
router.post('/process', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '영수증 이미지가 필요합니다.' });

    const imagePath = req.file.path;
    console.log('📄 영수증 OCR 처리 시작:', imagePath);

    // OCR 처리 (DB 저장 없이 결과만 추출)
    const items = await performOCR(imagePath);

    const categorizedItems = categorizeReceiptItems(items || []);

    // 임시 파일 삭제
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    res.json({
      success: true,
      data: {
        items,
        categorizedItems,
        totalItems: items?.length || 0,
      },
    });
  } catch (error) {
    console.error('영수증 OCR 처리 오류:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'OCR 처리 중 오류가 발생했습니다.' });
  }
});

// 이전 엔드포인트들은 제거됨
// OCR 결과는 로컬에서 관리하고, 저장은 /api/receipt-items (receiptItemsApi)를 통해 수행

export default router;


