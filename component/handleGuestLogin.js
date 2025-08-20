import { supabase } from '../lib/supabase'; // Supabase 클라이언트 불러오기

const handleGuestLogin = async () => {
  try {
    // 1. 임의의 이메일과 비밀번호 생성
    const guestEmail = `guest_${Date.now()}@cookit.com`;
    const guestPassword = 'dummy_password';

    // 2. Supabase에 회원가입 요청
    const { data, error } = await supabase.auth.signUp({
      email: guestEmail,
      password: guestPassword,
    });

    if (error) {
      alert(error.message);
      return;
    }

    // 3. 회원가입 성공 후 프로필 설정 화면으로 이동
    if (data.user) {
      alert('게스트 계정으로 로그인했습니다!');
      // 프로필 설정 또는 메인 화면으로 리디렉션
      // 예시: router.push('/profile-setup');
    }
  } catch (err) {
    alert('오류가 발생했습니다: ' + err.message);
  }
};