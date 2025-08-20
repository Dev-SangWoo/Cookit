import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '../lib/supabase';
import { makeRedirectUri } from 'expo-auth-session';
import { Alert } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export const handleGoogleLogin = async () => {
  try {
    // preferLocalhost를 제거하고 useProxy를 사용합니다.
    const redirectUrl = makeRedirectUri({
      scheme: 'cookitmobile',
      useProxy: true
    });

    console.log('Redirect URI:', redirectUrl); // 👈 1. 리디렉션 URI 확인

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      },
    });

    if (error) {
      throw error;
    }

    if (data.url) {
      console.log('Auth URL received:', data.url);

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );

      console.log('WebBrowser result:', result); // 👈 이 로그가 출력되는지 확인

      if (result.type === 'success') {
        const { url } = result;
        console.log('Success URL:', url); // 👈 4. 성공 리디렉션 URL 확인

        // URL에서 해시 부분을 추출하여 파라미터로 변환
        const hash = url.split('#')[1];
        if (!hash) {
          console.error('URL에 해시(#) 부분이 없습니다.'); // 👈 해시 부분 부재 확인
          return;
        }

        const urlParams = new URLSearchParams(hash);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');

        console.log('Extracted Access Token:', accessToken); // 👈 5. 토큰 추출 확인
        console.log('Extracted Refresh Token:', refreshToken);

        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          console.log('Supabase 세션 설정 완료');
        } else {
          console.error('액세스 토큰 또는 리프레시 토큰이 누락되었습니다.'); // 👈 토큰 누락 확인
        }
      } else {
        console.error('인증 세션이 성공적으로 완료되지 않았습니다. 유형:', result.type);
      }
    }
  } catch (err) {
    Alert.alert('로그인 오류', err.message);
    console.error('로그인 오류:', err);
  }
};