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
    
    // ANON_KEY를 사용한 별도 클라이언트로 토큰 검증
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
 * @route GET /api/users/profile
 * @desc 현재 사용자 프로필 조회
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false, 
          error: '프로필을 찾을 수 없습니다.' 
        });
      }
      throw error;
    }

    res.json({
      success: true,
      profile: data
    });

  } catch (error) {
    console.error('프로필 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '프로필 조회 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route GET /api/users/:userId/profile
 * @desc 특정 사용자 프로필 조회 (공개 프로필)
 */
router.get('/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, display_name, avatar_url, bio, cooking_level, favorite_cuisines, created_at')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false, 
          error: '프로필을 찾을 수 없습니다.' 
        });
      }
      throw error;
    }

    res.json({
      success: true,
      profile: data
    });

  } catch (error) {
    console.error('프로필 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '프로필 조회 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route PUT /api/users/profile
 * @desc 프로필 업데이트
 */
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      display_name,
      bio,
      avatar_url,
      cooking_level,
      favorite_cuisines,
      dietary_restrictions
    } = req.body;

    // 업데이트 데이터 구성
    const updateData = {};
    if (display_name !== undefined) updateData.display_name = display_name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    if (cooking_level !== undefined) updateData.cooking_level = cooking_level;
    if (favorite_cuisines !== undefined) updateData.favorite_cuisines = favorite_cuisines;
    if (dietary_restrictions !== undefined) updateData.dietary_restrictions = dietary_restrictions;

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('프로필 업데이트 오류:', error);
      throw error;
    }

    res.json({
      success: true,
      message: '프로필이 업데이트되었습니다.',
      profile: data
    });

  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '프로필 업데이트 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route GET /api/users/check-nickname/:nickname
 * @desc 닉네임 중복 확인
 */
router.get('/check-nickname/:nickname', async (req, res) => {
  try {
    const { nickname } = req.params;

    if (!nickname || !nickname.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: '닉네임을 입력해주세요.' 
      });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('display_name', nickname);

    if (error) {
      throw error;
    }

    const isAvailable = !data || data.length === 0;

    res.json({
      success: true,
      available: isAvailable,
      message: isAvailable ? '사용 가능한 닉네임입니다.' : '이미 사용 중인 닉네임입니다.'
    });

  } catch (error) {
    console.error('닉네임 확인 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '닉네임 확인 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route GET /api/users/:userId/posts
 * @desc 사용자의 게시글 조회
 */
router.get('/:userId/posts', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { data, error } = await supabase
      .from('user_posts')
      .select('post_id, title, content, image_urls, created_at, tags')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      posts: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: data.length
      }
    });

  } catch (error) {
    console.error('게시글 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '게시글 조회 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route GET /api/users/my-posts
 * @desc 현재 사용자의 모든 게시글 조회
 */
router.get('/my-posts', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = req.query.page || '1';
    const limit = req.query.limit || '50';

    const { data, error } = await supabase
      .from('user_posts')
      .select(`
        post_id,
        title,
        content,
        image_urls,
        created_at,
        updated_at,
        tags,
        recipe_id,
        user_profiles ( id, display_name, avatar_url )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range((parseInt(page) - 1) * parseInt(limit), parseInt(page) * parseInt(limit) - 1);

    if (error) throw error;

    // 각 게시글에 좋아요 수와 댓글 수 추가
    const postsWithCounts = await Promise.all(data.map(async (post) => {
      const { count: likeCount } = await supabase
        .from('user_post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.post_id);

      const { count: commentCount } = await supabase
        .from('user_post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.post_id);

      return {
        ...post,
        like_count: likeCount || 0,
        comment_count: commentCount || 0,
      };
    }));

    res.json({
      success: true,
      posts: postsWithCounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: postsWithCounts.length
      }
    });

  } catch (error) {
    console.error('내 게시글 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '게시글 조회 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route GET /api/users/stats
 * @desc 현재 사용자의 통계 정보
 */
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 사용자 프로필에서 cooking_level 조회
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('cooking_level')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // 이번 주 시작일 계산 (일요일 기준)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (일요일) ~ 6 (토요일)
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    // 전체 게시글 수 조회
    const { data: allPosts, error: postsError } = await supabase
      .from('user_posts')
      .select('post_id, recipe_id, created_at')
      .eq('user_id', userId);

    if (postsError) throw postsError;

    // 이번 주 요리 완성 수 (recipe_id가 있는 게시글만)
    const weekCompletedRecipes = allPosts?.filter(post => 
      post.recipe_id && new Date(post.created_at) >= weekStart
    ).length || 0;

    // 좋아요한 레시피 수 조회 (count 사용으로 성능 개선)
    const { count: likesCount, error: likesError } = await supabase
      .from('recipe_likes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (likesError) {
      console.error('좋아요 개수 조회 오류:', likesError);
      throw likesError;
    }

    const savedRecipesCount = likesCount || 0;
    console.log(`✅ 사용자 ${userId}의 좋아요한 레시피 수: ${savedRecipesCount}`);

    res.json({
      success: true,
      stats: {
        postsCount: allPosts?.length || 0,
        likesCount: savedRecipesCount,
        weekCompletedRecipes: weekCompletedRecipes,
        savedRecipes: savedRecipesCount,
        cookingLevel: profile?.cooking_level || 'beginner'
      }
    });

  } catch (error) {
    console.error('통계 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '통계 조회 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route GET /api/users/week-recipes
 * @desc 이번 주 완성한 요리 목록
 */
router.get('/week-recipes', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 이번 주 시작일 계산 (일요일 기준)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    // 이번 주 완성한 요리 (recipe_id가 있는 게시글)
    const { data: posts, error } = await supabase
      .from('user_posts')
      .select(`
        post_id,
        title,
        content,
        image_urls,
        created_at,
        recipe_id,
        recipes (
          id,
          title,
          image_urls
        )
      `)
      .eq('user_id', userId)
      .not('recipe_id', 'is', null)
      .gte('created_at', weekStart.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      recipes: posts || []
    });

  } catch (error) {
    console.error('이번 주 요리 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '이번 주 요리 조회 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route GET /api/users/completed-recipes
 * @desc 완료한 모든 레시피 목록 (recipe_id가 있는 게시글 기준)
 */
router.get('/completed-recipes', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 완료한 요리 (recipe_id가 있는 게시글의 고유한 recipe_id)
    const { data: posts, error } = await supabase
      .from('user_posts')
      .select(`
        recipe_id,
        recipes (
          id,
          title,
          description,
          image_urls,
          difficulty_level,
          prep_time,
          cook_time
        )
      `)
      .eq('user_id', userId)
      .not('recipe_id', 'is', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 중복 제거 (같은 recipe_id는 한 번만)
    const uniqueRecipes = new Map();
    posts.forEach(post => {
      if (post.recipe_id && post.recipes && !uniqueRecipes.has(post.recipe_id)) {
        uniqueRecipes.set(post.recipe_id, post.recipes);
      }
    });

    const recipeList = Array.from(uniqueRecipes.values());

    res.json({
      success: true,
      recipes: recipeList
    });

  } catch (error) {
    console.error('완료한 레시피 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '완료한 레시피 조회 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route GET /api/users/my-ratings
 * @desc 현재 사용자가 작성한 레시피 별점/평점 목록
 */
router.get('/my-ratings', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // content 필드 파싱 헬퍼 함수
    const parseContent = (content) => {
      if (!content) return { rating: null, comment: null };
      
      const ratingMatch = content.match(/평점:\s*(\d+)/);
      const rating = ratingMatch ? parseInt(ratingMatch[1]) : null;
      
      const commentMatch = content.replace(/평점:\s*\d+\s*\n?/, '').trim();
      const comment = commentMatch || null;
      
      return { rating, comment };
    };

    const { data, error } = await supabase
      .from('recipe_comments')
      .select(`
        *,
        recipes (
          id,
          title,
          image_urls,
          description
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // content에서 rating과 comment 추출
    const ratings = (data || []).map(item => {
      const parsed = parseContent(item.content);
      return {
        id: item.id,
        recipe_id: item.recipe_id,
        rating: parsed.rating,
        comment: parsed.comment,
        created_at: item.created_at,
        updated_at: item.updated_at,
        recipe: item.recipes
      };
    });

    res.json({
      success: true,
      ratings: ratings
    });

  } catch (error) {
    console.error('별점/평점 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '별점/평점 조회 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route GET /api/users/recent-viewed
 * @desc 최근 조회한 레시피 목록
 */
router.get('/recent-viewed', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    // user_recipe_activities 테이블에서 'viewed' 활동 조회
    const { data: activities, error } = await supabase
      .from('user_recipe_activities')
      .select(`
        id,
        recipe_id,
        created_at,
        recipes (
          id,
          title,
          description,
          image_urls,
          prep_time,
          cook_time,
          difficulty_level
        )
      `)
      .eq('user_id', userId)
      .eq('activity_type', 'viewed')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // 중복 레시피 제거 (가장 최근 조회만 유지)
    const uniqueRecipes = [];
    const seenRecipeIds = new Set();

    for (const activity of activities || []) {
      if (activity.recipes && !seenRecipeIds.has(activity.recipe_id)) {
        uniqueRecipes.push({
          ...activity.recipes,
          last_viewed_at: activity.created_at
        });
        seenRecipeIds.add(activity.recipe_id);
      }
    }

    res.json({
      success: true,
      recipes: uniqueRecipes
    });

  } catch (error) {
    console.error('최근 조회 레시피 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '최근 조회 레시피 조회 중 오류가 발생했습니다.' 
    });
  }
});

export default router;
