// screens/AuthScreen.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { useAuth } from '../contexts/AuthContext';

export default function AuthScreen() {
  const { loading } = useAuth();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cookit에 오신 것을 환영합니다!</Text>
      <Text style={styles.subtitle}>
        로그인하여 요리 커뮤니티에 참여하세요.
      </Text>
      <View style={styles.buttonWrapper}>
        <GoogleSignInButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonWrapper: {
    width: '80%',
  },
});