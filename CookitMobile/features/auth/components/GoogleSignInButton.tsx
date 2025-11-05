import React from 'react';
import { Pressable, Text, StyleSheet, Alert } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '@shared/lib/supabase';
import { useAuth } from '@features/auth/contexts/AuthContext';

// 웹 브라우저 완료 처리 설정
WebBrowser.maybeCompleteAuthSession();

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function GoogleSignInButton({ onSuccess, onError }: GoogleSignInButtonProps) {
  const { loading } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      console.log('구글 로그인 시작...');
      
      // 리디렉트 URI 생성 (개발 환경용)
      const redirectUri = makeRedirectUri({
        path: 'auth'
      });
      
      console.log('생성된 리디렉트 URI:', redirectUri);
      
      // Supabase OAuth를 사용한 구글 로그인
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
        },
      });

      if (error) {
        console.error('Supabase OAuth 오류:', error);
        throw error;
      }

      console.log('OAuth URL 생성됨:', data.url);

      // OAuth URL로 브라우저 열기
      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri
        );

        console.log('브라우저 결과:', result);

        if (result.type === 'success') {
          // OAuth 완료 후 세션 새로고침
          console.log('OAuth 성공, 세션 새로고침 중...', result);
          
          // URL에서 토큰 정보 확인
          if (result.url) {
            console.log('결과 URL:', result.url);
            
            // 안전한 URL 파라미터 파싱
            const parseUrlParams = (url: string) => {
              const params: Record<string, string> = {};
              
              // URL 파라미터 부분 추출
              const paramString = url.includes('?') ? url.split('?')[1] : '';
              const hashString = url.includes('#') ? url.split('#')[1] : '';
              
              // 파라미터 파싱
              const parseParams = (str: string) => {
                if (!str) return;
                str.split('&').forEach(pair => {
                  const [key, value] = pair.split('=');
                  if (key && value) {
                    params[decodeURIComponent(key)] = decodeURIComponent(value);
                  }
                });
              };
              
              parseParams(paramString);
              parseParams(hashString);
              
              return params;
            };
            
            const params = parseUrlParams(result.url);
            const accessToken = params.access_token;
            const refreshToken = params.refresh_token;
            
            if (accessToken) {
              console.log('액세스 토큰 발견, Supabase 세션 설정 중...');
              
              try {
                // 토큰으로 세션 설정
                const { data, error } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken || '',
                });
                
                if (error) {
                  throw error;
                }
                
                console.log('세션 설정 완료:', data.user?.email);
                onSuccess?.();
                return;
              } catch (error) {
                console.error('세션 설정 오류:', error);
              }
            }
          }
          
          // 백업 방법: 여러 번 세션 확인 시도
          let retryCount = 0;
          const maxRetries = 5;
          
          const checkSession = async () => {
            retryCount++;
            console.log(`세션 확인 시도 ${retryCount}/${maxRetries}...`);
            
            const { data: sessionData, error } = await supabase.auth.getSession();
            
            if (sessionData.session) {
              console.log('세션 발견!', sessionData.session.user.email);
              onSuccess?.();
            } else if (retryCount < maxRetries) {
              console.log('세션 없음, 1초 후 재시도...');
              setTimeout(checkSession, 1000);
            } else {
              console.log('최대 재시도 횟수 초과');
              Alert.alert('로그인 실패', '세션을 확인할 수 없습니다. 앱을 새로고침하고 다시 시도해주세요.');
            }
          };
          
          // 즉시 첫 번째 시도
          checkSession();
        } else if (result.type === 'cancel') {
          console.log('사용자가 로그인을 취소했습니다.');
        } else {
          console.log('브라우저 오류:', result);
          Alert.alert('로그인 실패', '브라우저에서 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      Alert.alert('로그인 실패', `구글 로그인 중 오류가 발생했습니다: ${error.message}`);
      onError?.(error as Error);
    }
  };

  return (
    <Pressable
      style={[styles.button, loading && styles.buttonDisabled]}
      onPress={handleGoogleSignIn}
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