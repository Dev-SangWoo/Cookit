import React from 'react';
import { View, Button, StyleSheet, Text, Alert } from 'react-native'; // Alert 추가
import { handleGoogleLogin } from '../component/LoginHandle';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigation = useNavigation();


  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Cookit에 오신 것을 환영합니다</Text>
      <Text style={{ marginBottom: 20 }}>Cookit 앱에서 맛있는 레시피를 발견하고 공유해보세요.</Text>
      <Button title="Google 로그인" onPress={handleGoogleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 }
});