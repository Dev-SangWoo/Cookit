import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import GoogleSignInButton from './GoogleSignInButton';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
  const handleSignInSuccess = () => {
    // 로그인 성공 후 메인 화면으로 이동
    router.replace('/(tabs)');
  };

  const checkSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('현재 세션:', session?.user?.email || 'No session');
    if (session) {
      alert(`로그인됨: ${session.user.email}`);
    } else {
      alert('세션 없음');
    }
  };

  const checkRedirectUri = () => {
    const redirectUri = require('expo-auth-session').makeRedirectUri({
      path: 'auth'
    });
    console.log('현재 리디렉트 URI:', redirectUri);
    alert(`리디렉트 URI: ${redirectUri}`);
  };

  const forceRefreshSession = async () => {
    console.log('강제 세션 새로고침 시작...');
    
    try {
      // 1. 현재 세션 로그아웃
      await supabase.auth.signOut();
      console.log('기존 세션 로그아웃 완료');
      
      // 2. 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 3. 세션 다시 확인
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        console.log('새로고침 후 세션 발견:', session.user.email);
        alert(`세션 복구 성공: ${session.user.email}`);
        handleSignInSuccess();
      } else {
        console.log('새로고침 후에도 세션 없음');
        alert('세션이 여전히 없습니다. 다시 로그인해주세요.');
      }
    } catch (error) {
      console.error('강제 새로고침 오류:', error);
      alert(`새로고침 오류: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Cookit에 오신 것을 환영합니다!</Text>
        <Text style={styles.subtitle}>
          맛있는 레시피를 발견하고 공유해보세요
        </Text>
        
        <View style={styles.buttonContainer}>
          <GoogleSignInButton onSuccess={handleSignInSuccess} />
          
          <Pressable style={styles.debugButton} onPress={checkSession}>
            <Text style={styles.debugButtonText}>세션 확인 (디버그)</Text>
          </Pressable>
          
          <Pressable style={styles.debugButton} onPress={checkRedirectUri}>
            <Text style={styles.debugButtonText}>리디렉트 URI 확인</Text>
          </Pressable>
          
          <Pressable style={[styles.debugButton, { backgroundColor: '#ff6b6b' }]} onPress={forceRefreshSession}>
            <Text style={styles.debugButtonText}>세션 강제 새로고침</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 16,
  },
  debugButton: {
    backgroundColor: '#666',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  debugButtonText: {
    color: 'white',
    fontSize: 14,
  },
});