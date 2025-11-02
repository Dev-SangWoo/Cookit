const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');

// ==========================
//  OCR 후 보정 함수
// ==========================
function cleanOcrText(text) {
  return text
    .replace(/\|/g, "1")
    .replace(/ㅣ/g, "1")
    .replace(/I/g, "1")
    .replace(/l/g, "1")
    .replace(/O/g, "0")
    .replace(/o/g, "0")
    .replace(/S/g, "5")
    .replace(/B/g, "8")
    .replace(/Z/g, "2")
    .replace(/[^\w\s가-힣\d,.\-]/g, " ") // 특수문자 정리
    .replace(/\s+/g, " ")
    .trim();
}

// ==========================
//  상품명 + 수량 추출 함수
// ==========================
function extractItemsFromOcr(text) {
  const lines = text.split("\n").map(l => cleanOcrText(l)).filter(Boolean);

  const items = [];
  for (const line of lines) {
    // 예: "삼진 우리가족 한끼 4380 1 4380"
    //     "동물복지인증 유정란 10,990 1 10,990"
    //     "참다랑어 뱃살회 9.900 1 9,900"
    const match = line.match(/^(.+?)\s+([\d,.\-]+)\s+(\d+)\s+([\d,.\-]+)$/);

    if (match) {
      const productName = match[1].trim();
      const quantity = parseInt(match[3], 10);
      const price = match[2].replace(/,/g, ''); // 가격에서 콤마 제거

      items.push({ 
        product_name: productName, 
        quantity: quantity,
        price: parseFloat(price) || 0
      });
    }
  }

  return items;
}

// ==========================
//  영수증 정보 추출 함수
// ==========================
function extractReceiptInfo(text) {
  const lines = text.split("\n").map(l => cleanOcrText(l)).filter(Boolean);
  
  let storeName = '';
  let totalAmount = 0;
  let date = '';
  
  // 매장명 추출 (첫 번째 줄 또는 특정 패턴)
  if (lines.length > 0) {
    storeName = lines[0];
  }
  
  // 총 금액 추출
  for (const line of lines) {
    const totalMatch = line.match(/총\s*금액[:\s]*([\d,]+)/i) || 
                      line.match(/합계[:\s]*([\d,]+)/i) ||
                      line.match(/total[:\s]*([\d,]+)/i);
    if (totalMatch) {
      totalAmount = parseFloat(totalMatch[1].replace(/,/g, ''));
      break;
    }
  }
  
  // 날짜 추출
  for (const line of lines) {
    const dateMatch = line.match(/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/) ||
                     line.match(/(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{4})/);
    if (dateMatch) {
      date = line;
      break;
    }
  }
  
  return {
    storeName,
    totalAmount,
    date
  };
}

// ==========================
//  영수증 OCR 처리 메인 함수
// ==========================
async function processReceiptOcr(imagePath, userId) {
  try {
    console.log('📄 영수증 OCR 처리 시작:', imagePath);
    
    // 1. OCR 실행
    const { data: { text } } = await Tesseract.recognize(
      imagePath,
      "kor+eng",
      { 
        logger: m => console.log(m),
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz가-힣.,- '
      }
    );

    console.log("📄 OCR 원본 결과:\n", text);

    // 2. 영수증 정보 추출
    const receiptInfo = extractReceiptInfo(text);
    console.log("🏪 영수증 정보:", receiptInfo);

    // 3. 상품명 + 수량 추출
    const items = extractItemsFromOcr(text);
    console.log("🛒 추출된 아이템:", items);

    return {
      success: true,
      receiptInfo,
      items,
      rawText: text
    };

  } catch (error) {
    console.error("❌ 영수증 OCR 처리 오류:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ==========================
//  영수증 데이터 정리 및 분류
// ==========================
function categorizeReceiptItems(items) {
  const categories = {
    '채소류': ['배추', '양파', '당근', '감자', '고구마', '상추', '시금치', '브로콜리', '양배추'],
    '육류': ['소고기', '돼지고기', '닭고기', '햄', '소시지', '베이컨', '돈까스', '불고기'],
    '해산물': ['생선', '새우', '게', '오징어', '문어', '굴', '전복', '멸치', '고등어'],
    '유제품': ['우유', '요거트', '치즈', '버터', '마요네즈', '크림'],
    '과일류': ['사과', '바나나', '딸기', '포도', '오렌지', '레몬', '키위', '복숭아'],
    '조미료': ['소금', '설탕', '간장', '고춧가루', '마늘', '생강', '파', '대파'],
    '기타': []
  };

  const categorizedItems = {
    '채소류': [],
    '육류': [],
    '해산물': [],
    '유제품': [],
    '과일류': [],
    '조미료': [],
    '기타': []
  };

  items.forEach(item => {
    let categorized = false;
    const productName = item.product_name.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (category === '기타') continue;
      
      if (keywords.some(keyword => productName.includes(keyword.toLowerCase()))) {
        categorizedItems[category].push(item);
        categorized = true;
        break;
      }
    }
    
    if (!categorized) {
      categorizedItems['기타'].push(item);
    }
  });

  return categorizedItems;
}

module.exports = {
  processReceiptOcr,
  categorizeReceiptItems,
  extractReceiptInfo,
  extractItemsFromOcr,
  cleanOcrText
};



