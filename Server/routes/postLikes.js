import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient.js';

const router = express.Router();

/**
 * 인증 미들웨어
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: '인증 토큰이 필요합니다.' 
      });
    }

    const token = authHeader.split('Bearer ')[1];
    
    const authClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    
    const { data: { user }, error } = await authClient.auth.getUser(token);

    if (error || !user) {
      console.error('토큰 검증 오류:', error);
      return res.status(401).json({ 
        success: false, 
        error: '유효하지 않은 인증 토큰입니다.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('인증 오류:', error);
    res.status(401).json({ 
      success: false, 
      error: '인증 처리 중 오류가 발생했습니다.' 
    });
  }
};

/**
 * @route POST /api/post-likes/:postId
 * @desc 게시글 좋아요 토글 (추가/제거)
 */
router.post('/:postId', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    // 기존 좋아요 확인
    const { data: existingLike, error: checkError } = await supabase
      .from('user_post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingLike) {
      // 좋아요 제거
      const { error: deleteError } = await supabase
        .from('user_post_likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) throw deleteError;

      // 좋아요 수 조회
      const { count, error: countError } = await supabase
        .from('user_post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (countError) throw countError;

      return res.json({
        success: true,
        liked: false,
        message: '좋아요가 취소되었습니다.',
        likeCount: count || 0
      });
    } else {
      // 좋아요 추가
      const { error: insertError } = await supabase
        .from('user_post_likes')
        .insert({
          post_id: postId,
          user_id: userId
        });

      if (insertError) throw insertError;

      // 좋아요 수 조회
      const { count, error: countError } = await supabase
        .from('user_post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (countError) throw countError;

      return res.json({
        success: true,
        liked: true,
        message: '좋아요가 추가되었습니다.',
        likeCount: count || 0
      });
    }

  } catch (error) {
    console.error('게시글 좋아요 처리 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '게시글 좋아요 처리 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route GET /api/post-likes/:postId
 * @desc 특정 게시글의 좋아요 상태 확인
 */
router.get('/:postId', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    const { data, error } = await supabase
      .from('user_post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json({
      success: true,
      liked: !!data
    });

  } catch (error) {
    console.error('좋아요 상태 확인 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '좋아요 상태 확인 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route GET /api/post-likes/:postId/count
 * @desc 특정 게시글의 총 좋아요 수 조회
 */
router.get('/:postId/count', async (req, res) => {
  try {
    const { postId } = req.params;

    const { count, error } = await supabase
      .from('user_post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) throw error;

    res.json({
      success: true,
      count: count || 0
    });

  } catch (error) {
    console.error('좋아요 수 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '좋아요 수 조회 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route GET /api/post-likes/user/liked
 * @desc 현재 사용자가 좋아요한 게시글 목록
 */
router.get('/user/liked', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('user_post_likes')
      .select(`
        id,
        created_at,
        user_posts (
          post_id,
          title,
          content,
          image_urls,
          created_at,
          user_profiles:user_id (
            display_name,
            avatar_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      likes: data || []
    });

  } catch (error) {
    console.error('좋아요한 게시글 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '좋아요한 게시글 조회 중 오류가 발생했습니다.' 
    });
  }
});

export default router;

