// ===============================
// file: Server/routes/recommendations.js
// ===============================

import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config(); // ✅ 환경 변수 로드
const router = express.Router();

console.log("🔑 SUPABASE_SERVICE_KEY:", process.env.SUPABASE_SERVICE_KEY ? "✅ 존재함" : "❌ 없음");

// ✅ Supabase Admin Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * @route GET /api/recommendations/user/:user_id
 * @desc 유저의 선호 요리를 기반으로 레시피 추천
 */
router.get("/user/:user_id", async (req, res) => {
  const userId = req.params.user_id;
  console.log("👤 요청된 userId:", userId);

  try {
    // 1️⃣ 유저 프로필 가져오기
    const { data: userProfile, error: userError } = await supabase
      .from("user_profiles")
      .select("id, display_name, favorite_cuisines, dietary_restrictions")
      .eq("id", userId)
      .maybeSingle(); // ✅ .single() → .maybeSingle()

    console.log("👤 userProfile 결과:", userProfile);
    console.log("❗ userError:", userError);

    if (userError || !userProfile) {
      return res.status(404).json({
        success: false,
        message: "유저 프로필을 찾을 수 없습니다.",
      });
    }

    const { favorite_cuisines = [], dietary_restrictions = [] } = userProfile;

    if (favorite_cuisines.length === 0) {
      return res.json({
        success: true,
        message: "선호 요리 정보가 없습니다.",
        recommendations: [],
      });
    }

    // 2️⃣ favorite_cuisines → recipe_categories.id 매핑
    const { data: categories, error: catError } = await supabase
      .from("recipe_categories")
      .select("id, name")
      .in("name", favorite_cuisines);

    if (catError) throw catError;

    const categoryIds = categories.map(c => c.id);

    // 3️⃣ recipes 중 category_id 일치 + dietary_restrictions 미포함 필터링
    const { data: recipes, error: recipeError } = await supabase
      .from("recipes")
      .select("*")
      .in("category_id", categoryIds);

    if (recipeError) throw recipeError;

    // 4️⃣ dietary_restrictions 필터 적용
    const filteredRecipes = recipes.filter(recipe => {
      const ingredientsText = JSON.stringify(recipe.ingredients || []).toLowerCase();
      return !dietary_restrictions.some(item =>
        ingredientsText.includes(item.toLowerCase())
      );
    });

    res.json({
      success: true,
      user: userProfile.display_name || userId, // ✅ nickname → display_name
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

export default router;
