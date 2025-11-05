import Constants from 'expo-constants';
import { supabase } from '@shared/lib/supabase';

// API Base URL 가져오기
const getApiBaseUrl = () => {
  return Constants.expoConfig?.extra?.apiBaseUrl || 
         process.env.EXPO_PUBLIC_API_BASE_URL || 
         'http://localhost:3000';
};

// 인증 토큰 가져오기
const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('로그인이 필요합니다.');
  }
  return session.access_token;
};

// 📌 좋아요한 레시피 목록 조회
export async function getMyLikedRecipes() {
  const token = await getAuthToken();
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const response = await fetch(`${apiUrl}/recipe-likes/user/liked`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '좋아요한 레시피 조회 실패');
  }

  return result.likes;
}

// 📌 좋아요 삭제 (좋아요 ID로)
export async function deleteRecipeLike(likeId: string) {
  const token = await getAuthToken();
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const response = await fetch(`${apiUrl}/recipe-likes/user/liked/${likeId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '좋아요 삭제 실패');
  }

  return result;
}

