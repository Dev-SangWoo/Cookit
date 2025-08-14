const { createClient } = require('@supabase/supabase-js');

// 환경변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.SUPABASE_URL || 'https://ujqdizvpkrjunyrcpvtf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('🔍 Supabase 환경변수 확인:');
console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_ANON_KEY 존재:', !!process.env.SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다!');
  console.error('SUPABASE_URL과 SUPABASE_SERVICE_KEY를 .env에 설정해주세요.');
}

// Supabase 클라이언트 생성 (서버용 - 서비스 키 사용)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

module.exports = { supabase };