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

export interface PostComment {
  id?: string;
  post_id: string;
  user_id?: string;
  content: string;
  created_at?: string;
  user_profiles?: {
    display_name: string;
    avatar_url: string;
  };
}

export interface RecipeComment {
  id?: string;
  recipe_id: string;
  user_id?: string;
  rating: number;
  comment?: string | null;
  created_at?: string;
  user_profiles?: {
    display_name: string;
    avatar_url: string;
  };
}

// ==================== 게시글 댓글 ====================

// 📌 게시글 댓글 목록 조회
export async function getPostComments(postId: string) {
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const response = await fetch(`${apiUrl}/comments/posts/${postId}`);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '댓글 목록 조회 실패');
  }

  return result.comments;
}

// 📌 게시글 댓글 작성
export async function createPostComment(postId: string, content: string) {
  const token = await getAuthToken();
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const response = await fetch(`${apiUrl}/comments/posts/${postId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '댓글 작성 실패');
  }

  return result.comment;
}

// 📌 게시글 댓글 삭제
export async function deletePostComment(commentId: string) {
  const token = await getAuthToken();
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const response = await fetch(`${apiUrl}/comments/posts/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '댓글 삭제 실패');
  }

  return result;
}

// ==================== 레시피 댓글 ====================

// 📌 레시피 댓글 목록 조회
export async function getRecipeComments(recipeId: string) {
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const response = await fetch(`${apiUrl}/comments/recipes/${recipeId}`);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '레시피 댓글 목록 조회 실패');
  }

  return result.comments;
}

// 📌 레시피 댓글(평점) 작성/수정
export async function saveRecipeComment(recipeId: string, rating: number, comment?: string) {
  const token = await getAuthToken();
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const response = await fetch(`${apiUrl}/comments/recipes/${recipeId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rating, comment }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '레시피 댓글 작성 실패');
  }

  return result.comment;
}

// 📌 내 레시피 댓글 조회
export async function getMyRecipeComment(recipeId: string) {
  const token = await getAuthToken();
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const response = await fetch(`${apiUrl}/comments/recipes/${recipeId}/my`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '내 레시피 댓글 조회 실패');
  }

  return result.comment;
}

