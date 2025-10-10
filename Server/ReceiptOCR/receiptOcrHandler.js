const Tesseract = require("tesseract.js");
const { supabase } = require('../services/supabaseClient.js');

// ==========================
//  영수증 OCR 후 보정 함수
// ==========================
function cleanReceiptOcrText(text) {
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
//  영수증에서 상품명 + 수량 추출 함수
// ==========================
function extractReceiptItems(text) {
  const lines = text.split("\n").map(l => cleanReceiptOcrText(l)).filter(Boolean);

  const items = [];
  for (const line of lines) {
    // 영수증 형식: "삼진 우리가족 한끼 4380 1 4380"
    //             "동물복지인증 유정란 10,990 1 10,990"
    //             "참다랑어 뱃살회 9.900 1 9,900"
    const match = line.match(/^(.+?)\s+([\d,.\-]+)\s+(\d+)\s+([\d,.\-]+)$/);

    if (match) {
      const productName = match[1].trim();
      const quantity = parseInt(match[3], 10);
      const price = match[2].replace(/[,.]/g, ''); // 가격에서 쉼표, 점 제거

      items.push({ 
        product_name: productName, 
        quantity: quantity,
        price: parseInt(price) || 0
      });
    }
  }

  return items;
}

// ==========================
//  영수증 OCR 실행 + Supabase 저장
// ==========================
async function processReceipt(imagePath, userId) {
  try {
    console.log(`🧾 영수증 OCR 처리 시작: ${imagePath}`);
    
    // 1. OCR 실행 (한국어 + 영어)
    const { data: { text } } = await Tesseract.recognize(
      imagePath,
      "kor+eng",
      { 
        logger: m => console.log('OCR 진행:', m.status, m.progress) 
      }
    );

    console.log("📄 영수증 OCR 원본 결과:\n", text);

    // 2. 상품명 + 수량 추출
    const items = extractReceiptItems(text);

    console.log("✅ 추출된 영수증 아이템:", items);

    // 3. Supabase 저장 (receipt_items 테이블에)
    if (items.length > 0) {
      const { data, error } = await supabase
        .from("receipt_items")
        .insert(
          items.map(item => ({
            user_id: userId,
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price,
            receipt_date: new Date().toISOString()
          }))
        );

      if (error) {
        console.error("❌ 영수증 데이터 저장 실패:", error);
        throw error;
      } else {
        console.log("🎉 영수증 데이터 저장 성공:", data);
        return {
          success: true,
          items: items,
          total_items: items.length,
          message: `${items.length}개의 상품이 영수증에서 추출되었습니다.`
        };
      }
    } else {
      console.log("⚠️ 영수증에서 추출된 아이템이 없습니다.");
      return {
        success: false,
        items: [],
        total_items: 0,
        message: "영수증에서 상품 정보를 찾을 수 없습니다."
      };
    }

  } catch (err) {
    console.error("❌ 영수증 OCR 처리 오류:", err);
    throw err;
  }
}

// ==========================
//  영수증 아이템 조회 함수
// ==========================
async function getReceiptItems(userId, limit = 50) {
  try {
    const { data, error } = await supabase
      .from("receipt_items")
      .select("*")
      .eq("user_id", userId)
      .order("receipt_date", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("❌ 영수증 아이템 조회 실패:", error);
      throw error;
    }

    return {
      success: true,
      items: data || [],
      total_count: data?.length || 0
    };
  } catch (err) {
    console.error("❌ 영수증 아이템 조회 오류:", err);
    throw err;
  }
}

module.exports = {
  processReceipt,
  getReceiptItems,
  extractReceiptItems,
  cleanReceiptOcrText
};
