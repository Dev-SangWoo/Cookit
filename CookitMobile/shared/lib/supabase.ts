import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// 환경변수를 다양한 방법으로 시도
let EXPO_PUBLIC_SUPABASE_URL: string | undefined;
let EXPO_PUBLIC_SUPABASE_ANON_KEY: string | undefined;

try {
  // @env에서 import 시도
  const envModule = require('@env');
  EXPO_PUBLIC_SUPABASE_URL = envModule.EXPO_PUBLIC_SUPABASE_URL;
  EXPO_PUBLIC_SUPABASE_ANON_KEY = envModule.EXPO_PUBLIC_SUPABASE_ANON_KEY;
} catch (error) {
  console.log('@env import 실패, fallback 사용');
}

const getEnvVar = (envVar: string | undefined, configKey: string, fallback: string) => {
  // 1. @env에서 직접 import
  if (envVar && envVar !== 'undefined') return envVar;
  
  // 2. Expo Constants에서 시도
  const fromExpoConfig = Constants.expoConfig?.extra?.[configKey];
  if (fromExpoConfig) return fromExpoConfig;
  
  const fromManifest = Constants.manifest?.extra?.[configKey];
  if (fromManifest) return fromManifest;
  
  // 3. Fallback 값 사용
  return fallback;
};

const supabaseUrl = getEnvVar(
  EXPO_PUBLIC_SUPABASE_URL,
  'supabaseUrl',
  '' // fallback 제거 - 환경변수가 필수
);

const supabaseAnonKey = getEnvVar(
  EXPO_PUBLIC_SUPABASE_ANON_KEY,
  'supabaseAnonKey',
  '' // fallback 제거 - 환경변수가 필수
);

console.log('=== Supabase 환경변수 디버깅 ===');
console.log('Constants.expoConfig?.extra:', Constants.expoConfig?.extra);
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key 존재:', !!supabaseAnonKey);
console.log('================================');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다!');
  console.error('📋 해결 방법:');
  console.error('1. .env.example을 .env로 복사하세요');
  console.error('2. .env 파일에 실제 Supabase URL과 키를 입력하세요');
  console.error('3. README.md의 환경변수 설정 가이드를 참고하세요');
  throw new Error('환경변수가 설정되지 않았습니다. .env 파일을 확인하세요.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

console.log('Supabase client 생성됨:', !!supabase);
console.log('Supabase auth 객체:', !!supabase.auth);