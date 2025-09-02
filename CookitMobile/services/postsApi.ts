import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';

// 간단한 확장자 추출 함수
function getFileExt(uri: string) {
  return uri.split('.').pop() || 'jpg';
}

// 간단한 MIME 타입 추출 함수
function getMimeType(uri: string) {
  const ext = getFileExt(uri).toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}

// 📌 이미지 업로드 함수
async function uploadImages(images: string[]): Promise<string[]> {
  const imageUrls: string[] = [];

  for (const uri of images) {
    const fileExt = getFileExt(uri);
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `user-post-images/${fileName}`;

    // 파일을 base64로 읽어서 Buffer로 변환
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { error: uploadError } = await supabase.storage
      .from('user-post-images')
      .upload(filePath, Buffer.from(base64, 'base64'), {
        contentType: getMimeType(uri),
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('user-post-images')
      .getPublicUrl(filePath);

    imageUrls.push(publicUrlData.publicUrl);
  }

  return imageUrls;
}

// 📌 게시글 작성
export async function createPost({ title, content, recipe_id, images, user_id }: {
  title: string;
  content: string;
  recipe_id?: string;
  images: string[];
  user_id: string;
}) {
  const imageUrls = images.length > 0 ? await uploadImages(images) : [];

  const { data, error } = await supabase
    .from('user_posts')
    .insert({
      title,
      content,
      recipe_id,
      user_id,
      image_urls: imageUrls,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 📌 게시글 목록 조회
export async function getPosts() {
  try {
    const { data, error } = await supabase
      .from('user_posts')
      .select('post_id, title, content, image_urls, created_at, updated_at, user_profiles ( id, display_name, avatar_url ), user_post_likes ( id ), user_post_comments ( id )')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getPosts Supabase 쿼리 오류:', error);
      // 오류가 발생해도 앱이 멈추지 않도록 빈 배열을 반환합니다.
      return []; 
    }

    return data.map(post => ({
      ...post,
      like_count: post.user_post_likes.length,
      comment_count: post.user_post_comments.length,
    }));
  } catch (err) {
    console.error('getPosts 함수에서 예상치 못한 오류 발생:', err);
    return [];
  }
}

// 📌 게시글 수정
export async function updatePost(postId: string, { title, content, image_urls }: {
  title?: string;
  content?: string;
  image_urls?: string[];
}) {
  const { data, error } = await supabase
    .from('user_posts')
    .update({
      title,
      content,
      image_urls,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 📌 게시글 삭제
export async function deletePost(postId: string) {
  const { error } = await supabase
    .from('user_posts')
    .delete()
    .eq('id', postId);

  if (error) throw error;
  return true;
}

// 게시글 1개 조회
export async function getPostById(id: string) {
  const { data, error } = await supabase
    .from('user_posts')
.select('post_id, title, content, image_urls, created_at, user_profiles ( id, display_name, avatar_url )')
    .eq('post_id', id)
    .single();

  if (error) throw error;
  return data;
}
