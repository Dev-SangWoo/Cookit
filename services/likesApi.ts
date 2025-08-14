import { supabase } from '../lib/supabase';

// 📌 좋아요 토글
export async function toggleLike(postId: string, userId: string) {
  const { data: existing, error: fetchError } = await supabase
    .from('user_post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle(); // 기존 좋아요 여부 확인

  if (fetchError) throw fetchError;

  if (existing) {
    // 좋아요 취소
    const { error: deleteError } = await supabase
      .from('user_post_likes')
      .delete()
      .eq('id', existing.id);
    if (deleteError) throw deleteError;
    return { liked: false };
  } else {
    // 좋아요 추가
    const { error: insertError } = await supabase
      .from('user_post_likes')
      .insert({ post_id: postId, user_id: userId });
    if (insertError) throw insertError;
    return { liked: true };
  }
}
