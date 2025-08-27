import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GoogleSignInButton from './GoogleSignInButton';

export default function AuthScreen() {
  const handleSignInSuccess = () => {
    // 로그인 성공 시 AuthContext가 자동으로 상태를 업데이트하여 메인 화면으로 이동
    console.log('로그인 성공! 메인 화면으로 이동합니다.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🍳</Text>
          <Text style={styles.title}>Cookit</Text>
        </View>
        
        <Text style={styles.subtitle}>
          맛있는 레시피를 발견하고 공유해보세요
        </Text>
        
        <View style={styles.buttonContainer}>
          <GoogleSignInButton onSuccess={handleSignInSuccess} />
        </View>
        
        <Text style={styles.footerText}>
          로그인하여 개인 맞춤 레시피를 받아보세요
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF6B35',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 64,
    lineHeight: 26,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});