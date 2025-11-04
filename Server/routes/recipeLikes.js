import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient.js';

const router = express.Router();

/**
 * 사용자 프로필 확인/생성 헬퍼 함수
 */
async function ensureUserProfile(userId, user) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (!profile) {
    const { error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email: user?.email,
        display_name: user?.user_metadata?.name || 
                     user?.user_metadata?.full_name || 
                     user?.email?.split('@')[0] || 
                     'User',
      });

    if (error) {
      console.error('User profile creation failed:', error);
      throw error;
    }
  }
}

/**
 * 인증 미들웨어
 * Authorization 헤더에서 JWT 토큰 확인
 * SERVICE_ROLE_KEY를 사용하므로 별도의 Supabase 클라이언트로 토큰 검증
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
    
    // ANON_KEY를 사용한 별도 클라이언트로 토큰 검증
    // (SERVICE_ROLE_KEY로는 getUser가 제대로 작동하지 않을 수 있음)
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
 * @route POST /api/recipe-likes/:recipeId
 * @desc 레시피 좋아요 추가/취소
 * @body { liked: boolean } - true면 좋아요 추가, false면 취소
 */
router.post('/:recipeId', requireAuth, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { liked } = req.body; // 클라이언트에서 원하는 상태
    const userId = req.user.id;

    if (!recipeId) {
      return res.status(400).json({ 
        success: false, 
        error: 'recipeId가 필요합니다.' 
      });
    }

    if (typeof liked !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        error: 'liked 파라미터(boolean)가 필요합니다.' 
      });
    }

    // 사용자 프로필 확인/생성
    await ensureUserProfile(userId, req.user);

    // 기존 좋아요 확인
    const { data: existingLike, error: checkError } = await supabase
      .from('recipe_likes')
      .select('id')
      .eq('recipe_id', recipeId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      throw checkError;
    }

    const alreadyLiked = !!existingLike;

    // 이미 원하는 상태와 동일하면 그대로 반환
    if (liked === alreadyLiked) {
      return res.json({
        success: true,
        liked: alreadyLiked,
        message: alreadyLiked ? '이미 좋아요가 추가되어 있습니다.' : '좋아요가 없습니다.',
      });
    }

    if (liked) {
      // 좋아요 추가
      const { data, error: insertError } = await supabase
        .from('recipe_likes')
        .insert({
          recipe_id: recipeId,
          user_id: userId,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // recipe_stats의 favorite_count 증가
      try {
        // recipe_stats 레코드 확인
        const { data: existingStats } = await supabase
          .from('recipe_stats')
          .select('*')
          .eq('recipe_id', recipeId)
          .maybeSingle();

        if (existingStats) {
          // 기존 레코드가 있으면 favorite_count 증가
          await supabase
            .from('recipe_stats')
            .update({ 
              favorite_count: (existingStats.favorite_count || 0) + 1,
              updated_at: new Date().toISOString()
            })
            .eq('recipe_id', recipeId);
        } else {
          // 없으면 새로 생성
          await supabase
            .from('recipe_stats')
            .insert({
              recipe_id: recipeId,
              favorite_count: 1,
              view_count: 0,
              cook_count: 0,
              average_rating: 0.0,
            });
        }
      } catch (statsError) {
        console.warn('⚠️ favorite_count 업데이트 실패:', statsError);
        // 통계 업데이트 실패해도 좋아요는 성공으로 처리
      }

      return res.json({
        success: true,
        liked: true,
        message: '좋아요가 추가되었습니다.',
        data,
      });
    } else {
      // 좋아요 취소
      const { error: deleteError } = await supabase
        .from('recipe_likes')
        .delete()
        .eq('recipe_id', recipeId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // recipe_stats의 favorite_count 감소
      try {
        const { data: existingStats } = await supabase
          .from('recipe_stats')
          .select('*')
          .eq('recipe_id', recipeId)
          .maybeSingle();

        if (existingStats && existingStats.favorite_count > 0) {
          await supabase
            .from('recipe_stats')
            .update({ 
              favorite_count: Math.max(0, (existingStats.favorite_count || 0) - 1),
              updated_at: new Date().toISOString()
            })
            .eq('recipe_id', recipeId);
        }
      } catch (statsError) {
        console.warn('⚠️ favorite_count 업데이트 실패:', statsError);
        // 통계 업데이트 실패해도 좋아요 취소는 성공으로 처리
      }

      return res.json({
        success: true,
        liked: false,
        message: '좋아요가 취소되었습니다.',
      });
    }
  } catch (error) {
    console.error('좋아요 처리 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '좋아요 처리 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route GET /api/recipe-likes/:recipeId
 * @desc 레시피 좋아요 상태 확인
 */
router.get('/:recipeId', requireAuth, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    const { data: like, error } = await supabase
      .from('recipe_likes')
      .select('id')
      .eq('recipe_id', recipeId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json({
      success: true,
      liked: !!like,
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
 * @route GET /api/recipe-likes/:recipeId/count
 * @desc 레시피 좋아요 개수 조회 (인증 불필요)
 */
router.get('/:recipeId/count', async (req, res) => {
  try {
    const { recipeId } = req.params;

    const { count, error } = await supabase
      .from('recipe_likes')
      .select('*', { count: 'exact', head: true })
      .eq('recipe_id', recipeId);

    if (error) throw error;

    res.json({
      success: true,
      count: count || 0,
    });
  } catch (error) {
    console.error('좋아요 개수 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '좋아요 개수 조회 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route GET /api/recipe-likes/user/liked
 * @desc 현재 사용자가 좋아요한 레시피 목록
 */
router.get('/user/liked', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('recipe_likes')
      .select(`
        id,
        created_at,
        recipes (
          id,
          title,
          image_urls
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
    console.error('좋아요한 레시피 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '좋아요한 레시피 조회 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route DELETE /api/recipe-likes/user/liked/:likeId
 * @desc 좋아요 삭제 (좋아요 ID로)
 */
router.delete('/user/liked/:likeId', requireAuth, async (req, res) => {
  try {
    const { likeId } = req.params;
    const userId = req.user.id;

    // 소유권 확인
    const { data: existingLike, error: checkError } = await supabase
      .from('recipe_likes')
      .select('user_id')
      .eq('id', likeId)
      .single();

    if (checkError || !existingLike) {
      return res.status(404).json({ 
        success: false, 
        error: '좋아요를 찾을 수 없습니다.' 
      });
    }

    if (existingLike.user_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: '삭제 권한이 없습니다.' 
      });
    }

    const { error } = await supabase
      .from('recipe_likes')
      .delete()
      .eq('id', likeId);

    if (error) throw error;

    res.json({
      success: true,
      message: '좋아요가 취소되었습니다.'
    });

  } catch (error) {
    console.error('좋아요 삭제 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '좋아요 삭제 중 오류가 발생했습니다.' 
    });
  }
});

export default router;

