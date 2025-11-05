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

export interface ReceiptItem {
  id?: string;
  user_id?: string;
  name: string;
  quantity?: number | null;
  unit?: string | null;
  expiration_date?: string | null;
  category?: string | null;
  storage_type?: string | null;
  created_at?: string;
  updated_at?: string;
}

// 📌 재료 목록 조회
export async function getReceiptItems() {
  const token = await getAuthToken();
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const response = await fetch(`${apiUrl}/receipt-items`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '재료 목록 조회 실패');
  }

  return result.items;
}

// 📌 재료 추가
export async function addReceiptItem(item: ReceiptItem) {
  const token = await getAuthToken();
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const response = await fetch(`${apiUrl}/receipt-items`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '재료 추가 실패');
  }

  return result.item;
}

// 📌 여러 재료 일괄 추가
export async function addReceiptItemsBulk(items: ReceiptItem[]) {
  const token = await getAuthToken();
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const response = await fetch(`${apiUrl}/receipt-items/bulk`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '재료 일괄 추가 실패');
  }

  return result.items;
}

// 📌 재료 수정
export async function updateReceiptItem(itemId: string, updates: Partial<ReceiptItem>) {
  const token = await getAuthToken();
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const response = await fetch(`${apiUrl}/receipt-items/${itemId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '재료 수정 실패');
  }

  return result.item;
}

// 📌 재료 삭제
export async function deleteReceiptItem(itemId: string) {
  const token = await getAuthToken();
  const baseUrl = getApiBaseUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  const response = await fetch(`${apiUrl}/receipt-items/${itemId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || '재료 삭제 실패');
  }

  return result;
}

