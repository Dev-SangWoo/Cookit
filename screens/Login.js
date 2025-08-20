import React from 'react';
import { View, Button, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native'; // TouchableOpacity와 Alert 추가
import { handleGoogleLogin } from '../component/LoginHandle';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigation = useNavigation();

  // handleGuestLogin 함수를 컴포넌트 내부로 이동
  const handleGuestLogin = async () => {
    try {
      const guestEmail = `guest_${Date.now()}@cookit.com`;
      const guestPassword = 'dummy_password';

      const { data, error } = await supabase.auth.signUp({
        email: guestEmail,
        password: guestPassword,
      });

      if (error) {
        Alert.alert('오류 발생', error.message);
        return;
      }

      if (data.user) {
        Alert.alert('로그인 성공', '게스트 계정으로 로그인했습니다!');
        // 프로필 설정 또는 메인 화면으로 리디렉션
        // 예시: navigation.navigate('ProfileSetup'); 
      }
    } catch (err) {
      Alert.alert('오류 발생', '오류가 발생했습니다: ' + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Cookit에 오신 것을 환영합니다</Text>
      <Text style={{ marginBottom: 20 }}>Cookit 앱에서 맛있는 레시피를 발견하고 공유해보세요.</Text>
      <Button title="Google 로그인" onPress={handleGoogleLogin} />
      {/* 게스트 로그인 버튼 추가 */}
      <TouchableOpacity onPress={handleGuestLogin} style={styles.guestButton}>
        <Text style={styles.guestButtonText}>게스트로 시작하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', // 가운데 정렬 추가
    padding: 20 
  },
  guestButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  guestButtonText: {
    color: '#000',
    textAlign: 'center',
  },
});