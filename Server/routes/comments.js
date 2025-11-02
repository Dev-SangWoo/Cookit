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

// ==================== 게시글 댓글 ====================

/**
 * @route GET /api/comments/posts/:postId
 * @desc 특정 게시글의 댓글 목록 조회
 */
router.get('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    const { data, error } = await supabase
      .from('user_post_comments')
      .select(`
        *,
        user_profiles:user_id (
          display_name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      comments: data || []
    });

  } catch (error) {
    console.error('댓글 목록 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '댓글 목록 조회 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route POST /api/comments/posts/:postId
 * @desc 게시글에 댓글 작성
 */
router.post('/posts/:postId', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: '댓글 내용은 필수입니다.' 
      });
    }

    const { data, error } = await supabase
      .from('user_post_comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content: content.trim()
      })
      .select(`
        *,
        user_profiles:user_id (
          display_name,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: '댓글이 작성되었습니다.',
      comment: data
    });

  } catch (error) {
    console.error('댓글 작성 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '댓글 작성 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route DELETE /api/comments/posts/:commentId
 * @desc 게시글 댓글 삭제
 */
router.delete('/posts/:commentId', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { commentId } = req.params;

    // 소유권 확인
    const { data: existingComment, error: checkError } = await supabase
      .from('user_post_comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (checkError || !existingComment) {
      return res.status(404).json({ 
        success: false, 
        error: '댓글을 찾을 수 없습니다.' 
      });
    }

    if (existingComment.user_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: '삭제 권한이 없습니다.' 
      });
    }

    const { error } = await supabase
      .from('user_post_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    res.json({
      success: true,
      message: '댓글이 삭제되었습니다.'
    });

  } catch (error) {
    console.error('댓글 삭제 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '댓글 삭제 중 오류가 발생했습니다.' 
    });
  }
});

// ==================== 레시피 댓글 ====================

// content 필드 파싱 헬퍼 함수
const parseContent = (content) => {
  if (!content) return { rating: null, comment: null };
  
  // "평점: {rating}\n{comment}" 형식 파싱
  const ratingMatch = content.match(/평점:\s*(\d+)/);
  const rating = ratingMatch ? parseInt(ratingMatch[1]) : null;
  
  // 평점 줄을 제거한 나머지가 댓글
  const commentMatch = content.replace(/평점:\s*\d+\s*\n?/, '').trim();
  const comment = commentMatch || null;
  
  return { rating, comment };
};

/**
 * @route GET /api/comments/recipes/:recipeId
 * @desc 특정 레시피의 댓글 목록 조회
 */
router.get('/recipes/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;

    const { data, error } = await supabase
      .from('recipe_comments')
      .select(`
        *,
        user_profiles:user_id (
          display_name,
          avatar_url
        )
      `)
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // content 필드를 파싱하여 rating과 comment 추가
    const parsedComments = (data || []).map(item => {
      const parsed = parseContent(item.content);
      return {
        ...item,
        rating: parsed.rating,
        comment: parsed.comment
      };
    });

    res.json({
      success: true,
      comments: parsedComments
    });

  } catch (error) {
    console.error('레시피 댓글 목록 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '레시피 댓글 목록 조회 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route POST /api/comments/recipes/:recipeId
 * @desc 레시피에 댓글(평점) 작성/수정 (UPSERT)
 */
router.post('/recipes/:recipeId', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipeId } = req.params;
    const { rating, comment } = req.body;

    if (rating === undefined || rating === null) {
      return res.status(400).json({ 
        success: false, 
        error: '평점은 필수입니다.' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        error: '평점은 1에서 5 사이여야 합니다.' 
      });
    }

    // content 필드에 평점과 댓글을 함께 저장
    // 형식: "평점: {rating}\n{comment}" 또는 평점만 있는 경우 "평점: {rating}"
    let contentValue = `평점: ${rating}`;
    if (comment && comment.trim()) {
      contentValue += `\n${comment.trim()}`;
    }

    const { data, error } = await supabase
      .from('recipe_comments')
      .upsert({
        recipe_id: recipeId,
        user_id: userId,
        content: contentValue
      }, {
        onConflict: 'recipe_id,user_id'
      })
      .select(`
        *,
        user_profiles:user_id (
          display_name,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;

    // content에서 rating과 comment 추출하여 응답에 포함
    const parsedContent = parseContent(data.content);
    const responseData = {
      ...data,
      rating: parsedContent.rating,
      comment: parsedContent.comment
    };

    res.status(201).json({
      success: true,
      message: '평점이 저장되었습니다.',
      comment: responseData
    });

  } catch (error) {
    console.error('레시피 댓글 작성 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '레시피 댓글 작성 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route GET /api/comments/recipes/:recipeId/my
 * @desc 현재 사용자의 레시피 댓글 조회
 */
router.get('/recipes/:recipeId/my', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipeId } = req.params;

    const { data, error } = await supabase
      .from('recipe_comments')
      .select('*')
      .eq('recipe_id', recipeId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.json({
          success: true,
          comment: null
        });
      }
      throw error;
    }

    // content 필드를 파싱하여 rating과 comment 추가
    const parsed = parseContent(data.content);
    const responseData = {
      ...data,
      rating: parsed.rating,
      comment: parsed.comment
    };

    res.json({
      success: true,
      comment: responseData
    });

  } catch (error) {
    console.error('내 레시피 댓글 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '내 레시피 댓글 조회 중 오류가 발생했습니다.' 
    });
  }
});

export default router;

