import { supabase } from '../lib/supabase';

// 📌 댓글 불러오기
export async function getComments(postId: string) {
  const { data, error } = await supabase
    .from('user_post_comments')
    .select(`
      id, content, created_at,
      user_profiles (
        id,
        display_name,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

// 📌 댓글 작성
export async function createComment(postId: string, content: string, userId: string) {
  const { data, error } = await supabase
    .from('user_post_comments')
    .insert({
      post_id: postId,
      content,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 📌 댓글 삭제
export async function deleteComment(commentId: string) {
  const { error } = await supabase
    .from('user_post_comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
  return true;
}
