import { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { AuthState, User } from '../types/auth';

interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ 프로필 자동 생성 함수
  const ensureUserProfile = async (user: User) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!data) {
      console.log('user_profiles에 레코드 없음, 새로 생성합니다.');
      const { error: insertError } = await supabase.from('user_profiles').insert({
        id: user.id,
        email: user.email,
        display_name: user.name,
        avatar_url: user.avatar_url,
      });

      if (insertError) {
        console.error('user_profiles 생성 실패:', insertError);
      } else {
        console.log('user_profiles 생성 완료');
      }
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const mapped = mapSupabaseUser(session.user);
        setUser(mapped);
        ensureUserProfile(mapped); // ✅ 여기!
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.email || 'No user');
      setSession(session);

      if (session?.user) {
        const mapped = mapSupabaseUser(session.user);
        setUser(mapped);
        ensureUserProfile(mapped); // ✅ 여기도!
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            const mapped = mapSupabaseUser(session.user);
            setSession(session);
            setUser(mapped);
            ensureUserProfile(mapped); // (선택 사항)
          }
        });
      }
    };
    const subscription_appState = AppState.addEventListener('change', handleAppStateChange);

    const handleDeepLink = async (url: string) => {
      console.log('Deep link received:', url);
      const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1] || '');
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      console.log('access_token:', accessToken);
      console.log('refresh_token:', refreshToken);

      if (accessToken) {
        console.log('Deep link에서 토큰 발견, 세션 설정 시도...');
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        if (!error && data.session) {
          console.log('세션 설정 완료:', data.user?.email);
          const mapped = mapSupabaseUser(data.user);
          setSession(data.session);
          setUser(mapped);
          ensureUserProfile(mapped); // ✅ 여기도!
          return;
        }
      }

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          console.log('백업 세션 확인 성공:', session.user.email);
          const mapped = mapSupabaseUser(session.user);
          setSession(session);
          setUser(mapped);
          ensureUserProfile(mapped);
        }
      });
    };

    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink(url);
    });

    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.unsubscribe();
      subscription_appState?.remove();
      linkingSubscription?.remove();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);

      const redirectTo = 'cookitmobile://';
      console.log('구글 로그인 시작...');
      console.log('사용하는 redirectTo:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (error) throw error;
      if (!data.url) throw new Error('OAuth URL이 없습니다.');

      console.log('구글 로그인 리디렉션 URL:', data.url);

      if (Platform.OS === 'web') {
        window.location.href = data.url;
      } else {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        console.log('브라우저 결과:', result);
      }
    } catch (error) {
      console.error('로그인 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);

      await supabase.auth.signOut();
      setSession(null);
      setUser(null);

      if (Platform.OS === 'web') {
        try {
          localStorage.clear();
          console.log('웹 로컬 스토리지 초기화 완료');
        } catch (err) {
          console.warn('웹 로컬 스토리지 초기화 실패:', err);
        }
      } else {
        try {
          const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
          await AsyncStorage.clear();
          console.log('모바일 AsyncStorage 초기화 완료');
        } catch (err) {
          console.warn('AsyncStorage 초기화 실패:', err);
        }

        try {
          const SecureStore = await import('expo-secure-store');
          const allKeys = ['sb-access-token', 'sb-refresh-token'];
          for (const key of allKeys) {
            await SecureStore.deleteItemAsync(key);
          }
          console.log('모바일 SecureStore 토큰 삭제 완료');
        } catch (err) {
          console.warn('SecureStore 초기화 실패:', err);
        }
      }

      console.log('로그아웃 완료');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const mapSupabaseUser = (supabaseUser: any): User => ({
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name,
    avatar_url: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
  });

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내에서만 사용 가능합니다');
  }
  return context;
}
