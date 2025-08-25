import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import AuthScreen from './AuthScreen';

export default function AuthNavigator() {
  const { user, loading } = useAuth();

  // 로딩 중일 때 스피너 표시
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  // 인증되지 않은 사용자에게는 로그인 화면 표시
  if (!user) {
    return <AuthScreen />;
  }

  // 인증된 사용자에게는 메인 앱 네비게이션 표시
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
});