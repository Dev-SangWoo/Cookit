// ===============================
// 개인화 레시피 추천 API
// ===============================

import express from "express";
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
    const { createClient } = await import('@supabase/supabase-js');
    
    const authClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    
    const { data: { user }, error } = await authClient.auth.getUser(token);

    if (error || !user) {
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
 * @route GET /api/recommendations/user
 * @desc 현재 유저의 선호 요리를 기반으로 레시피 추천
 */
router.get("/user", requireAuth, async (req, res) => {
  const userId = req.user.id;
  console.log("👤 추천 요청 userId:", userId);

  try {
    // 1️⃣ 유저 프로필 가져오기
    const { data: userProfile, error: userError } = await supabase
      .from("user_profiles")
      .select("id, display_name, favorite_cuisines, dietary_restrictions")
      .eq("id", userId)
      .maybeSingle();

    console.log("👤 userProfile:", userProfile);

    if (userError || !userProfile) {
      return res.status(404).json({
        success: false,
        message: "유저 프로필을 찾을 수 없습니다.",
      });
    }

    const { favorite_cuisines = [], dietary_restrictions = [] } = userProfile;

    // 선호 요리 정보가 없으면 최신 레시피 반환
    if (favorite_cuisines.length === 0) {
      console.log("⚠️ 선호 요리 정보 없음 - 최신 레시피 반환");
      const { data: recentRecipes, error: recentError } = await supabase
        .from("recipes")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentError) throw recentError;

      return res.json({
        success: true,
        message: "선호 요리 정보가 없어 최신 레시피를 반환합니다.",
        total: recentRecipes.length,
        recommendations: recentRecipes,
      });
    }

    // 2️⃣ favorite_cuisines → recipe_categories.id 매핑
    const { data: categories, error: catError } = await supabase
      .from("recipe_categories")
      .select("id, name")
      .in("name", favorite_cuisines);

    if (catError) throw catError;

    const categoryIds = categories.map(c => c.id);
    console.log("📂 매핑된 카테고리 IDs:", categoryIds);

    // 3️⃣ recipes 중 category_id 일치하는 레시피 가져오기
    let query = supabase
      .from("recipes")
      .select("*");

    if (categoryIds.length > 0) {
      query = query.in("category_id", categoryIds);
    }

    const { data: recipes, error: recipeError } = await query.order('created_at', { ascending: false }).limit(50);

    if (recipeError) throw recipeError;

    // 4️⃣ dietary_restrictions 필터 적용
    const filteredRecipes = recipes.filter(recipe => {
      const ingredientsText = JSON.stringify(recipe.ingredients || []).toLowerCase();
      return !dietary_restrictions.some(item =>
        ingredientsText.includes(item.toLowerCase())
      );
    });

    console.log(`✅ 추천 레시피: ${filteredRecipes.length}개 (필터 전: ${recipes.length}개)`);

    res.json({
      success: true,
      user: userProfile.display_name || userId,
      favorite_cuisines,
      dietary_restrictions,
      total: filteredRecipes.length,
      recommendations: filteredRecipes,
    });
  } catch (error) {
    console.error("❌ 추천 생성 오류:", error);
    res.status(500).json({
      success: false,
      message: "추천 생성 실패",
      error: error.message,
    });
  }
});

/**
 * @route GET /api/recommendations/popular
 * @desc 인기 레시피 (조회수 기반)
 */
router.get("/popular", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // recipe_stats와 조인하여 조회수 기준 정렬
    const { data, error } = await supabase
      .from("recipes")
      .select(`
        *,
        recipe_stats (
          view_count,
          favorite_count,
          cook_count
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // recipe_stats가 있는 경우 view_count로 정렬
    const sortedRecipes = data.sort((a, b) => {
      const aViews = a.recipe_stats?.[0]?.view_count || 0;
      const bViews = b.recipe_stats?.[0]?.view_count || 0;
      return bViews - aViews;
    });

    res.json({
      success: true,
      total: sortedRecipes.length,
      recipes: sortedRecipes,
    });
  } catch (error) {
    console.error("❌ 인기 레시피 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "인기 레시피 조회 실패",
      error: error.message,
    });
  }
});

/**
 * @route GET /api/recommendations/by-difficulty
 * @desc 사용자의 요리 실력에 맞는 난이도 추천
 */
router.get("/by-difficulty", requireAuth, async (req, res) => {
  const userId = req.user.id;
  
  try {
    const limit = parseInt(req.query.limit) || 10;

    // 1️⃣ 사용자 프로필에서 cooking_level 가져오기
    const { data: userProfile, error: userError } = await supabase
      .from("user_profiles")
      .select("cooking_level")
      .eq("id", userId)
      .maybeSingle();

    if (userError) throw userError;

    let targetDifficulty;
    
    // 2️⃣ cooking_level에 따른 난이도 매핑
    if (!userProfile || !userProfile.cooking_level) {
      // 정보 없으면 easy 추천
      targetDifficulty = 'easy';
      console.log("⚠️ cooking_level 정보 없음 - 기본값 'easy' 사용");
    } else {
      const cookingLevel = userProfile.cooking_level;
      
      // beginner → easy, intermediate → medium, advanced → hard
      const difficultyMap = {
        'beginner': 'easy',
        'intermediate': 'medium',
        'advanced': 'hard'
      };
      
      targetDifficulty = difficultyMap[cookingLevel] || 'easy';
      console.log(`👨‍🍳 사용자 레벨: ${cookingLevel} → 난이도: ${targetDifficulty}`);
    }

    // 3️⃣ 해당 난이도의 레시피 조회
    const { data: recipes, error: recipeError } = await supabase
      .from("recipes")
      .select("*")
      .eq("difficulty_level", targetDifficulty)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (recipeError) throw recipeError;

    console.log(`✅ 난이도 기반 추천: ${recipes.length}개 (${targetDifficulty})`);

    res.json({
      success: true,
      cooking_level: userProfile?.cooking_level || 'beginner',
      target_difficulty: targetDifficulty,
      total: recipes.length,
      recipes: recipes,
    });
  } catch (error) {
    console.error("❌ 난이도 기반 추천 오류:", error);
    res.status(500).json({
      success: false,
      message: "난이도 기반 추천 실패",
      error: error.message,
    });
  }
});

/**
 * @route GET /api/recommendations/similar-to-cooked
 * @desc 사용자가 완성한 요리와 유사한 레시피 추천
 */
router.get("/similar-to-cooked", requireAuth, async (req, res) => {
  const userId = req.user.id;
  
  try {
    const limit = parseInt(req.query.limit) || 10;

    // 1️⃣ 사용자가 완성한 요리의 레시피 ID 조회 (user_posts에서)
    const { data: userPosts, error: postsError } = await supabase
      .from("user_posts")
      .select("recipe_id")
      .eq("user_id", userId)
      .not("recipe_id", "is", null) // recipe_id가 있는 것만
      .order('created_at', { ascending: false })
      .limit(20); // 최근 20개만

    if (postsError) throw postsError;

    if (!userPosts || userPosts.length === 0) {
      console.log("⚠️ 완성한 요리가 없음 - 최신 레시피 반환");
      
      // 완성한 요리가 없으면 최신 레시피 반환
      const { data: recentRecipes, error: recentError } = await supabase
        .from("recipes")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(limit);

      if (recentError) throw recentError;

      return res.json({
        success: true,
        message: "완성한 요리가 없어 최신 레시피를 반환합니다.",
        total: recentRecipes.length,
        recipes: recentRecipes,
      });
    }

    // 2️⃣ 완성한 레시피들의 카테고리 조회
    const cookedRecipeIds = [...new Set(userPosts.map(p => p.recipe_id))]; // 중복 제거
    
    const { data: cookedRecipes, error: cookedError } = await supabase
      .from("recipes")
      .select("id, category_id")
      .in("id", cookedRecipeIds);

    if (cookedError) throw cookedError;

    // 3️⃣ 카테고리 ID 추출 (가장 많이 만든 카테고리 우선)
    const categoryCount = {};
    cookedRecipes.forEach(recipe => {
      if (recipe.category_id) {
        categoryCount[recipe.category_id] = (categoryCount[recipe.category_id] || 0) + 1;
      }
    });

    // 카테고리별 빈도수로 정렬
    const sortedCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .map(([categoryId]) => categoryId);

    console.log("📊 완성한 요리 카테고리:", sortedCategories);

    // 4️⃣ 같은 카테고리의 레시피 추천 (단, 이미 만든 것 제외)
    const { data: similarRecipes, error: similarError } = await supabase
      .from("recipes")
      .select("*")
      .in("category_id", sortedCategories)
      .not("id", "in", `(${cookedRecipeIds.join(",")})`) // 이미 만든 것 제외
      .order('created_at', { ascending: false })
      .limit(limit);

    if (similarError) throw similarError;

    console.log(`✅ 유사 레시피 추천: ${similarRecipes.length}개`);

    res.json({
      success: true,
      cooked_count: cookedRecipeIds.length,
      total: similarRecipes.length,
      recipes: similarRecipes,
    });
  } catch (error) {
    console.error("❌ 유사 레시피 추천 오류:", error);
    res.status(500).json({
      success: false,
      message: "유사 레시피 추천 실패",
      error: error.message,
    });
  }
});

export default router;

