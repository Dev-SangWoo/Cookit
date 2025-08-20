// handleGuestLogin.js 파일
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';

export const handleGuestLogin = async (navigation) => {
  try {
    const guestEmail = `guest_${Date.now()}@cookit.com`;
    const guestPassword = 'dummy_password';

    // ✅ 변경된 부분: signUp 함수가 반환하는 data를 직접 사용
    const { data, error } = await supabase.auth.signUp({
      email: guestEmail,
      password: guestPassword,
    });

    if (error) {
      Alert.alert('오류 발생', error.message);
      return;
    }

    // ✅ 변경된 부분: 세션 대신 data.user가 있는지 확인
    if (data.user) {
      Alert.alert('로그인 성공', '닉네임 설정이 필요합니다.');
      navigation.navigate('HomeTab', { //벽을 느끼다
        userId: data.user.id, // 👈 signUp 성공 후 받은 user.id를 바로 사용
        email: data.user.email,
        googleName: null,
        googleAvatar: null,
      });
    } else {
      Alert.alert('오류', '사용자 정보를 가져오지 못했습니다. 다시 시도해주세요.');
    }
  } catch (err) {
    Alert.alert('오류 발생', '오류가 발생했습니다: ' + err.message);
  }
};