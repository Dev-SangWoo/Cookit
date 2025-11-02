// 영수증 OCR API 테스트 스크립트
const API_BASE_URL = 'http://localhost:3000/api';

async function testReceiptOcrAPI() {
  try {
    console.log('🧾 영수증 OCR API 테스트 시작...');
    
    // 1. 서비스 상태 확인
    console.log('\n1️⃣ 영수증 OCR 서비스 상태 확인');
    const statusResponse = await fetch(`${API_BASE_URL}/receipt-ocr/status`);
    const statusData = await statusResponse.json();
    
    console.log('✅ 서비스 상태:', statusData.success ? '정상' : '오류');
    console.log('✅ 서비스 정보:', statusData.service);
    console.log('✅ 지원 기능:', statusData.features);
    
    // 2. 헬스 체크
    console.log('\n2️⃣ 영수증 OCR 헬스 체크');
    const healthResponse = await fetch(`${API_BASE_URL}/receipt-ocr/health`);
    const healthData = await healthResponse.json();
    
    console.log('✅ 헬스 상태:', healthData.success ? '정상' : '오류');
    console.log('✅ 상태 메시지:', healthData.message);
    console.log('✅ 테스트 이미지 사용 가능:', healthData.testImageAvailable);
    
    // 3. 영수증 아이템 조회 테스트 (샘플 사용자 ID)
    console.log('\n3️⃣ 영수증 아이템 조회 테스트');
    const testUserId = 'test-user-123';
    const itemsResponse = await fetch(`${API_BASE_URL}/receipt-ocr/items/${testUserId}?limit=10`);
    const itemsData = await itemsResponse.json();
    
    console.log('✅ 아이템 조회 성공:', itemsData.success);
    console.log('✅ 조회된 아이템 수:', itemsData.data?.total_count || 0);
    
    if (itemsData.data?.items && itemsData.data.items.length > 0) {
      console.log('✅ 첫 번째 아이템:');
      const firstItem = itemsData.data.items[0];
      console.log('   - 상품명:', firstItem.product_name);
      console.log('   - 수량:', firstItem.quantity);
      console.log('   - 가격:', firstItem.price);
      console.log('   - 날짜:', firstItem.receipt_date);
    }
    
    console.log('\n🎉 영수증 OCR API 테스트 완료!');
    console.log('\n📋 사용 가능한 엔드포인트:');
    console.log('   - GET  /api/receipt-ocr/status     - 서비스 상태');
    console.log('   - GET  /api/receipt-ocr/health     - 헬스 체크');
    console.log('   - GET  /api/receipt-ocr/items/:user_id - 아이템 조회');
    console.log('   - POST /api/receipt-ocr/process    - 영수증 처리 (이미지 업로드)');
    
  } catch (error) {
    console.error('❌ 영수증 OCR API 테스트 실패:', error.message);
    console.log('\n🔧 문제 해결 방법:');
    console.log('   1. 서버가 실행 중인지 확인: npm start');
    console.log('   2. 포트 3000이 사용 가능한지 확인');
    console.log('   3. 환경 변수(.env) 파일이 설정되어 있는지 확인');
  }
}

// 테스트 실행
testReceiptOcrAPI();
