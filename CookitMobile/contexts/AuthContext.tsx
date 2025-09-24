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
  updateUserProfile: (updates: Partial<User>) => Promise<void>; // ✅ updateUserProfile 함수 타입 정의 추가
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapSupabaseUser = (supabaseUser: any): User => ({
  id: supabaseUser.id,
  email: supabaseUser.email,
  name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || null,
  avatar_url: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || null,
  bio: null,
  cooking_level: null,
  favorite_cuisines: [],
  dietary_restrictions: [],
});

WebBrowser.maybeCompleteAuthSession();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ AuthProvider에 updateUserProfile 함수 정의
  const updateUserProfile = async (updates: Partial<User>) => {
    if (user) {
      setUser(prevUser => (prevUser ? { ...prevUser, ...updates } : null));
    }
  };

const ensureUserProfile = async (supabaseUser: User) => {
  const { data: profileData, error: profileError } = await supabase
    .from('user_profiles')
    .select('display_name, bio, cooking_level, favorite_cuisines, dietary_restrictions')
    .eq('id', supabaseUser.id)
    .maybeSingle(); // ✅ .single() 대신 .maybeSingle() 사용

  if (profileError && profileError.code !== 'PGRST116') {
    // 예상치 못한 다른 오류가 발생했을 경우
    console.error('user_profiles 조회 실패:', profileError);
    setUser(prevUser => prevUser ? { ...prevUser, name: null } : null);
    return;
  }

  // 프로필 데이터가 없거나 (null), 필수 정보가 누락된 경우
  if (!profileData || profileData.display_name === null || profileData.bio === null || profileData.cooking_level === null) {
    console.log('필수 프로필 정보 누락, 온보딩으로 리디렉션');
    const { error: upsertError } = await supabase
      .from('user_profiles')
      .upsert({ id: supabaseUser.id, email: supabaseUser.email, avatar_url: supabaseUser.avatar_url }, { onConflict: 'id' });

    if (upsertError) {
      console.error('user_profiles 생성/업데이트 실패:', upsertError);
    }

    // 'name'을 null로 설정하여 App.js에서 온보딩 화면으로 이동하도록 트리거
    setUser({
      id: supabaseUser.id,
      email: supabaseUser.email,
      avatar_url: supabaseUser.avatar_url,
      name: profileData?.display_name,
      bio: profileData?.bio || null,
      cooking_level: profileData?.cooking_level || null,
      favorite_cuisines: profileData?.favorite_cuisines || [],
      dietary_restrictions: profileData?.dietary_restrictions || [],
    });
  } else {
    // 모든 프로필 정보가 있는 경우
    console.log('사용자 프로필 설정 완료');
    setUser({
      id: supabaseUser.id,
      email: supabaseUser.email,
      avatar_url: supabaseUser.avatar_url,
      name: profileData.display_name,
      bio: profileData.bio,
      cooking_level: profileData.cooking_level,
      favorite_cuisines: profileData.favorite_cuisines,
      dietary_restrictions: profileData.dietary_restrictions,
    });
  }
};

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      if (initialSession?.user) {
        const mapped = mapSupabaseUser(initialSession.user);
        setUser(mapped);
        ensureUserProfile(mapped);
      }
      setLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.email || 'No user');
      setSession(session);
      if (session?.user) {
        const mapped = mapSupabaseUser(session.user);
        setUser(mapped);
        ensureUserProfile(mapped);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        supabase.auth.getSession();
      }
    };
    const subscription_appState = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.unsubscribe();
      subscription_appState?.remove();
    };
  }, []);

  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      console.log('딥링크 수신:', url);
      const hash = url.split('#')[1];
      if (!hash) {
        console.log('URL에 해시(#)가 없습니다. 딥링크 처리를 건너뜁니다.');
        return;
      }
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        console.log('딥링크에서 토큰 발견, 세션 설정 시도...');
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('세션 설정 오류:', error);
        } else if (data.session) {
          console.log('세션 설정 완료:', data.session.user.email);
          const mapped = mapSupabaseUser(data.session.user);
          setSession(data.session);
          setUser(mapped);
          ensureUserProfile(mapped);
        }
      }
    };

    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink(url);
    });

    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      linkingSubscription.remove();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const redirectTo = Linking.createURL('/');
      console.log('구글 로그인 시작, 리디렉션 URL:', redirectTo);
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
      await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
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
      console.log('로그아웃 완료');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signOut, updateUserProfile }}>
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