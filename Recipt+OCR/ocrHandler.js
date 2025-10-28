import Tesseract from "tesseract.js";
import supabase from "./supabaseClient.js";

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

      items.push({ product_name: productName, quantity });
    }
  }

  return items;
}

// ==========================
//  OCR 실행 + Supabase 저장
// ==========================
async function processReceipt(imagePath, userId) {
  try {
    // 1. OCR 실행
    const { data: { text } } = await Tesseract.recognize(
      imagePath,
      "kor+eng",
      { logger: m => console.log(m) }
    );

    console.log("📄 OCR 원본 결과:\n", text);

    // 2. 상품명 + 수량 추출
    const items = extractItemsFromOcr(text);

    console.log("✅ 보정 후 추출된 아이템:", items);

    // 3. Supabase 저장 (receipt_items 테이블에)
    if (items.length > 0) {
      const { data, error } = await supabase
        .from("receipt_items")  // ✅ 새 테이블명
        .insert(
          items.map(item => ({
            user_id: userId,
            product_name: item.product_name,
            quantity: item.quantity
          }))
        );

      if (error) console.error("❌ Supabase 저장 실패:", error);
      else console.log("🎉 Supabase 저장 성공:", data);
    } else {
      console.log("⚠️ 추출된 아이템이 없습니다.");
    }

  } catch (err) {
    console.error("❌ OCR 처리 오류:", err);
  }
}

// ==========================
//  테스트 실행
// ==========================
const testUserId = "325a46bb-2809-4732-bd23-17db475942d5"; // 실제 user_id로 교체
await processReceipt("./test/receipt1.jpg", testUserId);
