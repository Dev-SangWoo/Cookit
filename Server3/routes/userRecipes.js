const express = require('express');
const { supabase } = require('../services/supabaseClient');

const router = express.Router();

/**
 * 사용자 인증 미들웨어
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: '인증 오류: ' + error.message });
  }
};

/**
 * @route GET /api/user-recipes/my
 * @desc 내가 저장한/즐겨찾기한 레시피 목록
 */
router.get('/my', requireAuth, async (req, res) => {
  try {
    const { type = 'all', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    let whereClause = '';
    if (type === 'saved') {
      whereClause = "AND ur.relationship_type = 'saved'";
    } else if (type === 'favorited') {
      whereClause = "AND ur.relationship_type = 'favorited'";
    } else if (type === 'created') {
      whereClause = "AND ur.relationship_type = 'created'";
    }

    const { data: recipes, error } = await supabase
      .from('user_recipes')
      .select(`
        id,
        relationship_type,
        notes,
        rating,
        last_cooked_at,
        created_at,
        recipes!inner (
          recipe_id,
          title,
          description,
          category,
          cooking_time,
          difficulty,
          servings,
          source_url,
          image_url,
          view_count,
          favorite_count,
          ai_generated,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      recipes: recipes.map(item => ({
        ...item.recipes,
        user_relationship: {
          type: item.relationship_type,
          notes: item.notes,
          rating: item.rating,
          last_cooked_at: item.last_cooked_at,
          saved_at: item.created_at
        }
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: recipes.length
      }
    });

  } catch (error) {
    console.error('사용자 레시피 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/user-recipes/save
 * @desc 레시피 저장/즐겨찾기
 */
router.post('/save', requireAuth, async (req, res) => {
  try {
    const { recipe_id, type = 'saved', notes, rating } = req.body;
    const userId = req.user.id;

    if (!recipe_id) {
      return res.status(400).json({
        success: false,
        error: 'recipe_id가 필요합니다.'
      });
    }

    if (!['saved', 'favorited'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'type은 saved 또는 favorited만 가능합니다.'
      });
    }

    // 사용자 프로필 확인/생성
    await ensureUserProfile(userId, req.user);

    // 중복 확인
    const { data: existing } = await supabase
      .from('user_recipes')
      .select('id')
      .eq('user_id', userId)
      .eq('recipe_id', recipe_id)
      .eq('relationship_type', type)
      .single();

    if (existing) {
      return res.status(409).json({
        success: false,
        error: '이미 저장된 레시피입니다.'
      });
    }

    // 레시피 저장
    const { data, error } = await supabase
      .from('user_recipes')
      .insert({
        user_id: userId,
        recipe_id: recipe_id,
        relationship_type: type,
        notes: notes || null,
        rating: rating || null
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // 즐겨찾기 카운트 업데이트
    if (type === 'favorited') {
      await supabase.rpc('increment_favorite_count', { recipe_id });
    }

    // 활동 로그 기록
    await logActivity(userId, recipe_id, 'saved');

    res.json({
      success: true,
      message: `레시피가 ${type === 'saved' ? '저장' : '즐겨찾기에 추가'}되었습니다.`,
      data
    });

  } catch (error) {
    console.error('레시피 저장 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/user-recipes/:recipe_id
 * @desc 저장된 레시피 삭제
 */
router.delete('/:recipe_id', requireAuth, async (req, res) => {
  try {
    const { recipe_id } = req.params;
    const { type = 'saved' } = req.query;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('user_recipes')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', recipe_id)
      .eq('relationship_type', type)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: '저장된 레시피를 찾을 수 없습니다.'
      });
    }

    // 즐겨찾기 카운트 감소
    if (type === 'favorited') {
      await supabase.rpc('decrement_favorite_count', { recipe_id });
    }

    res.json({
      success: true,
      message: '레시피가 삭제되었습니다.'
    });

  } catch (error) {
    console.error('레시피 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/user-recipes/public
 * @desc 공개 레시피 목록 (모든 사용자)
 */
router.get('/public', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      difficulty, 
      sort = 'latest' 
    } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('recipes')
      .select(`
        recipe_id,
        title,
        description,
        category,
        cooking_time,
        difficulty,
        servings,
        source_url,
        image_url,
        view_count,
        favorite_count,
        ai_generated,
        created_at,
        created_by,
        user_profiles!left (
          display_name,
          avatar_url
        )
      `)
      .eq('is_public', true);

    // 필터링
    if (category) {
      query = query.ilike('category', `%${category}%`);
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    // 정렬
    switch (sort) {
      case 'popular':
        query = query.order('favorite_count', { ascending: false });
        break;
      case 'views':
        query = query.order('view_count', { ascending: false });
        break;
      case 'latest':
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data: recipes, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      recipes: recipes.map(recipe => ({
        ...recipe,
        creator: recipe.user_profiles || null
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: recipes.length
      }
    });

  } catch (error) {
    console.error('공개 레시피 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/user-recipes/detail/:recipe_id
 * @desc 레시피 상세 정보 (재료, 단계 포함)
 */
router.get('/detail/:recipe_id', async (req, res) => {
  try {
    const { recipe_id } = req.params;
    const userId = req.user?.id; // 선택적 인증

    // 조회수 증가
    await supabase.rpc('increment_view_count', { recipe_id });

    // 레시피 상세 정보
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select(`
        *,
        user_profiles!left (
          display_name,
          avatar_url
        )
      `)
      .eq('recipe_id', recipe_id)
      .eq('is_public', true)
      .single();

    if (recipeError) {
      throw recipeError;
    }

    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: '레시피를 찾을 수 없습니다.'
      });
    }

    // 재료 정보
    const { data: ingredients } = await supabase
      .from('ingredients')
      .select('*')
      .eq('recipe_id', recipe_id)
      .order('order_index');

    // 조리 단계
    const { data: steps } = await supabase
      .from('recipe_steps')
      .select('*')
      .eq('recipe_id', recipe_id)
      .order('step_number');

    // 사용자 관계 정보 (인증된 경우)
    let userRelationship = null;
    if (userId) {
      const { data: relationship } = await supabase
        .from('user_recipes')
        .select('relationship_type, notes, rating, last_cooked_at')
        .eq('user_id', userId)
        .eq('recipe_id', recipe_id);

      userRelationship = relationship;

      // 활동 로그 기록
      await logActivity(userId, recipe_id, 'viewed');
    }

    res.json({
      success: true,
      recipe: {
        ...recipe,
        creator: recipe.user_profiles || null,
        ingredients: ingredients || [],
        steps: steps || [],
        user_relationship: userRelationship
      }
    });

  } catch (error) {
    console.error('레시피 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 사용자 프로필 확인/생성
 */
async function ensureUserProfile(userId, user) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (!profile) {
    await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email: user.email,
        display_name: user.user_metadata?.name || user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture
      });
  }
}

/**
 * 활동 로그 기록
 */
async function logActivity(userId, recipeId, activityType) {
  try {
    await supabase
      .from('recipe_activity_logs')
      .insert({
        user_id: userId,
        recipe_id: recipeId,
        activity_type: activityType
      });
  } catch (error) {
    console.warn('활동 로그 기록 실패:', error.message);
  }
}

module.exports = router;
