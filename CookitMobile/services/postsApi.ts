import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';

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

// base64 디코딩 헬퍼 함수
const decode = (str: string) => {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'base64');
  } else {
    const binaryString = atob(str);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
};

// 📌 이미지 업로드 함수 (클라이언트에서 직접 업로드)
async function uploadImages(images: string[]): Promise<string[]> {
  const imageUrls: string[] = [];

  for (const uri of images) {
    try {
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `user-post-images/${fileName}`;

      // React Native에서는 FileSystem을 사용하여 base64로 읽기
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
      
      // base64를 바이너리 데이터로 디코딩
      const binaryData = decode(base64);

      const { error: uploadError } = await supabase.storage
        .from('user-post-images')
        .upload(filePath, binaryData, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('user-post-images')
        .getPublicUrl(filePath);

      imageUrls.push(publicUrlData.publicUrl);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      throw error;
    }
  }

  return imageUrls;
}

// 📌 게시글 작성 (서버 API 사용)
export async function createPost({ title, content, recipe_id, images, user_id, tags }: {
  title: string;
  content: string;
  recipe_id?: string;
  images: string[];
  user_id: string;
  tags?: string | string[];
}) {
  const imageUrls = images.length > 0 ? await uploadImages(images) : [];
  const token = await getAuthToken();
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const tagsArray = Array.isArray(tags) ? tags : (tags ? [tags] : ['00']);

  const response = await fetch(`${apiUrl}/user-posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      content,
      recipe_id: recipe_id || null,
      tags: tagsArray,
      image_urls: imageUrls,
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '게시글 작성 실패');
  }

  return result.post;
}

// 📌 게시글 목록 조회 (서버 API 사용)
export async function getPosts(options?: { tags?: string; page?: number; limit?: number }) {
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
  
  const params = new URLSearchParams();
  if (options?.tags) params.append('tags', options.tags);
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());

  const response = await fetch(`${apiUrl}/user-posts?${params.toString()}`);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '게시글 목록 조회 실패');
  }

  return result.posts.map((post: any) => ({
    ...post,
    like_count: post.like_count || 0,
    comment_count: post.comment_count || 0,
  }));
}

// 📌 게시글 수정 (서버 API 사용)
export async function updatePost(postId: string, { title, content, image_urls, tags }: {
  title?: string;
  content?: string;
  image_urls?: string[];
  tags?: string | string[];
}) {
  const token = await getAuthToken();
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (image_urls !== undefined) updateData.image_urls = image_urls;
  if (tags !== undefined) {
    updateData.tags = Array.isArray(tags) ? tags : [tags];
  }

  const response = await fetch(`${apiUrl}/user-posts/${postId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '게시글 수정 실패');
  }

  return result.post;
}

// 📌 게시글 삭제 (서버 API 사용)
export async function deletePost(postId: string) {
  const token = await getAuthToken();
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const response = await fetch(`${apiUrl}/user-posts/${postId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '게시글 삭제 실패');
  }

  return true;
}

// 📌 게시글 1개 조회 (서버 API 사용)
export async function getPostById(postId: string) {
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const response = await fetch(`${apiUrl}/user-posts/${postId}`);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '게시글 조회 실패');
  }

  return result.post;
}
