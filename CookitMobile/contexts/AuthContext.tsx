import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import { User, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isSetupComplete: boolean;
  setSetupComplete: (complete: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  useEffect(() => {
    // 세션 상태 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ? mapSupabaseUser(session.user) : null);
      setLoading(false);
    });

    // 인증 상태 변화 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.email || 'No user');
      setSession(session);
      setUser(session?.user ? mapSupabaseUser(session.user) : null);
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

    // URL 링크 처리 (OAuth 리디렉션 감지)
    const handleDeepLink = async (url: string) => {
      console.log('Deep link received:', url);
      
      // OAuth 완료 후 세션 새로고침  
      if (url.includes('cookitmobile://') || url.includes('exp://')) {
        console.log('OAuth 리디렉션 감지, 세션 처리 중...');
        
        try {
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
          
          const params = parseUrlParams(url);
          const accessToken = params.access_token;
          const refreshToken = params.refresh_token;
          
          if (accessToken) {
            console.log('Deep link에서 토큰 발견, 세션 설정 중...');
            
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
        } catch (error) {
          console.error('Deep link 토큰 처리 오류:', error);
        }
        
        // 백업: 일반적인 세션 새로고침
        let retryCount = 0;
        const maxRetries = 3;
        
        const refreshSession = async () => {
          retryCount++;
          console.log(`Deep link 세션 새로고침 시도 ${retryCount}/${maxRetries}`);
          
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (session) {
            console.log('Deep link 세션 확인 성공:', session.user.email);
            setSession(session);
            setUser(mapSupabaseUser(session.user));
          } else if (retryCount < maxRetries) {
            setTimeout(refreshSession, 1000);
          } else {
            console.log('Deep link 세션 새로고침 최대 시도 완료');
          }
        };
        
        setTimeout(refreshSession, 500);
      }
    };

    // 초기 URL 확인
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // URL 변화 리스너
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
      // Google 로그인 로직은 나중에 구현
      console.log('Google 로그인 구현 예정');
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
    } catch (error) {
      console.error('로그아웃 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const mapSupabaseUser = (supabaseUser: any): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name,
      avatar_url: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
    };
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
    isSetupComplete,
    setSetupComplete,
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