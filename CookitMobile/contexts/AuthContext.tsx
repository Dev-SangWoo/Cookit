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
  isSetupComplete: boolean;
  setSetupComplete: (complete: boolean) => void;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  // 사용자 초기 설정 완료 여부 확인
  const checkSetupComplete = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('nickname, favorite_cuisines')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('프로필 확인 오류:', error);
        setIsSetupComplete(false);
        return;
      }

      // nickname이 있고 favorite_cuisines이 설정되어 있으면 초기 설정 완료로 간주
      const isComplete = !!(data?.nickname && data?.favorite_cuisines?.length > 0);
      console.log('초기 설정 완료 여부:', isComplete);
      setIsSetupComplete(isComplete);
    } catch (err) {
      console.error('설정 확인 중 오류:', err);
      setIsSetupComplete(false);
    }
  };

  useEffect(() => {
    // 세션 상태 확인
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      const mappedUser = session?.user ? mapSupabaseUser(session.user) : null;
      setUser(mappedUser);
      
      // 사용자가 있으면 초기 설정 완료 여부 확인
      if (mappedUser) {
        await checkSetupComplete(mappedUser.id);
      }
      
      setLoading(false);
    });

    // 인증 상태 변화 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.email || 'No user');
      setSession(session);
      const mappedUser = session?.user ? mapSupabaseUser(session.user) : null;
      setUser(mappedUser);
      
      // 사용자가 있으면 초기 설정 완료 여부 확인
      if (mappedUser) {
        await checkSetupComplete(mappedUser.id);
      } else {
        setIsSetupComplete(false);
      }
      
      setLoading(false);
    });

    // 앱 상태 변화 감지 (백그라운드에서 돌아올 때)
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('App became active, refreshing session...');
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            setSession(session);
            setUser(mapSupabaseUser(session.user));
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
        if (data.session) {
          console.log('Deep link 세션 설정 성공:', data.user?.email);
          setSession(data.session);
          setUser(mapSupabaseUser(data.user));
          return;
        }
      }

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          console.log('백업 세션 확인 성공:', session.user.email);
          setSession(session);
          setUser(mapSupabaseUser(session.user));
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

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      // Supabase user_metadata 업데이트
      const { error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) {
        console.error('프로필 업데이트 오류:', error);
        return;
      }

      // 로컬 상태 업데이트
      setUser({ ...user, ...updates });
    } catch (error) {
      console.error('프로필 업데이트 중 오류:', error);
    }
  };

  const mapSupabaseUser = (supabaseUser: any): User => ({
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name,
    avatar_url: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
  });

  const value: AuthContextType = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
    isSetupComplete,
    setSetupComplete: setIsSetupComplete,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서만 사용할 수 있습니다');
  }
  return context;
}
