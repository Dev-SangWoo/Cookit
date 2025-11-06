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

// 📌 현재 사용자 프로필 조회
export async function getMyProfile() {
  const token = await getAuthToken();
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const response = await fetch(`${apiUrl}/users/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '프로필 조회 실패');
  }

  return result.profile;
}

// 📌 특정 사용자 프로필 조회 (공개)
export async function getUserProfile(userId: string) {
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const response = await fetch(`${apiUrl}/users/${userId}/profile`);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '프로필 조회 실패');
  }

  return result.profile;
}

// 📌 프로필 업데이트
export async function updateProfile(profileData: {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  cooking_level?: string;
  favorite_cuisines?: string[];
  dietary_restrictions?: string[];
}) {
  const token = await getAuthToken();
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const response = await fetch(`${apiUrl}/users/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '프로필 업데이트 실패');
  }

  return result.profile;
}

// 📌 닉네임 중복 확인
export async function checkNicknameAvailability(nickname: string) {
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const response = await fetch(`${apiUrl}/users/check-nickname/${encodeURIComponent(nickname)}`);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '닉네임 확인 실패');
  }

  return result.available;
}

// 📌 사용자의 게시글 조회 (현재 로그인한 사용자 또는 특정 사용자)
export async function getUserPosts(userId?: string, options?: { page?: number; limit?: number }) {
  const token = await getAuthToken();
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
  
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());

  // userId가 제공되지 않으면 현재 사용자의 게시글 조회
  const endpoint = userId 
    ? `${apiUrl}/users/${userId}/posts?${params.toString()}`
    : `${apiUrl}/users/my-posts?${params.toString()}`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '게시글 조회 실패');
  }

  return result.posts;
}

// 📌 사용자 통계 조회
export async function getUserStats() {
  const token = await getAuthToken();
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const response = await fetch(`${apiUrl}/users/stats`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '통계 조회 실패');
  }

  return result.stats;
}

// 📌 레시피 카테고리 조회
export async function getRecipeCategories() {
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const response = await fetch(`${apiUrl}/recipe-categories`);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '카테고리 조회 실패');
  }

  return result.categories;
}

// 📌 레시피 카테고리 이름만 조회
export async function getRecipeCategoryNames() {
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const response = await fetch(`${apiUrl}/recipe-categories/names`);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '카테고리 이름 조회 실패');
  }

  return result.names;
}

// 📌 이번 주 완성한 요리 목록 조회
export async function getWeekRecipes() {
  const token = await getAuthToken();
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const response = await fetch(`${apiUrl}/users/week-recipes`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '이번 주 요리 조회 실패');
  }

  return result.recipes;
}

// 📌 완료한 모든 레시피 목록 조회
export async function getCompletedRecipes() {
  const token = await getAuthToken();
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const response = await fetch(`${apiUrl}/users/completed-recipes`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '완료한 레시피 조회 실패');
  }

  return result.recipes;
}

// 📌 최근 조회한 레시피 목록 조회
export async function getRecentViewedRecipes(limit?: number) {
  const token = await getAuthToken();
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());

  const response = await fetch(`${apiUrl}/users/recent-viewed?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '최근 조회 레시피 조회 실패');
  }

  return result.recipes;
}

// 📌 사용자가 작성한 레시피 별점/평점 목록 조회
export async function getUserRatings() {
  const token = await getAuthToken();
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const response = await fetch(`${apiUrl}/users/my-ratings`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '별점/평점 조회 실패');
  }

  return result.ratings;
}

