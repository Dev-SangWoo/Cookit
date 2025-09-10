// components/GoogleSignInButton.tsx

import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function GoogleSignInButton() {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <Pressable
      style={[styles.button, loading && styles.buttonDisabled]}
      onPress={signInWithGoogle}
      disabled={loading}
    >
      <Text style={styles.buttonText}>
        {loading ? '로그인 중...' : 'Google로 로그인'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});