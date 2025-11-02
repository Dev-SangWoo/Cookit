import express from 'express';
import supabaseService from '../services/supabaseService.js';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// ✅ Supabase Admin Client (Service Key 사용)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // RLS 무시하고 수정 가능
);

/**
 * @route POST /api/recipes/from-ai
 * @desc AI 분석 결과를 Supabase DB에 저장 + recipe_stats 자동 생성 + category_id 자동 매핑
 */
router.post('/from-ai', async (req, res) => {
  try {
    const { aiResult, sourceUrl, processingMetadata } = req.body;

    if (!aiResult || !aiResult.recipe) {
      return res.status(400).json({
        success: false,
        error: 'AI 분석 결과가 필요합니다.',
      });
    }

    const recipe = aiResult.recipe;
    console.log(`📝 레시피 DB 저장 시작: ${recipe.title}`);

    // 🧩 [추가] 카테고리 매핑 시도
    let category_id = null;
    if (recipe.category_name) {
      const { data: categoryRow, error: categoryError } = await supabaseAdmin
        .from('recipe_categories')
        .select('id, name')
        .ilike('name', recipe.category_name)
        .maybeSingle();

      if (categoryError) {
        console.warn(`⚠️ 카테고리 조회 실패: ${categoryError.message}`);
      } else if (categoryRow) {
        category_id = categoryRow.id;
        console.log(`✅ 카테고리 매칭 성공: ${recipe.category_name} (${category_id})`);
      } else {
        console.warn(`⚠️ '${recipe.category_name}'에 해당하는 카테고리가 없어 null 처리됨`);
      }
    } else {
      console.warn('⚠️ AI 결과에 category_name이 포함되지 않음');
    }

    // ✅ 재료를 JSONB 형식으로 변환
    const ingredients =
      recipe.ingredients?.map((ing, index) => ({
        name: ing.name || ing.ingredient || ing,
        quantity: ing.amount || ing.quantity || '',
        unit: ing.unit || '',
        order: index + 1,
      })) || [];

    // ✅ 조리 단계를 JSONB 형식으로 변환
    const instructions =
      recipe.steps?.map((step, index) => ({
        step: index + 1,
        title: step.title || `단계 ${index + 1}`,
        instruction:
          step.actions?.[0]?.action ||
          step.action ||
          step.instruction ||
          step.content ||
          step,
        start_time: step.start_time || null,
        end_time: step.end_time || null,
        time: step.actions?.[0]?.time || step.time || null,
        temperature: step.temperature || null,
        tips:
          step.actions?.[0]?.tip ||
          step.tip ||
          step.tips ||
          null,
        ingredients: step.actions?.[0]?.ingredients || [],
        tools: step.actions?.[0]?.tools || [],
      })) || [];

    // ✅ 영양 정보 처리
    const nutritionInfo = recipe.nutrition
      ? {
          calories: recipe.nutrition.calories || null,
          carbs: recipe.nutrition.carbs || null,
          protein: recipe.nutrition.protein || null,
          fat: recipe.nutrition.fat || null,
          serving_size: recipe.nutrition.serving_size || '1인분',
        }
      : null;

    // ✅ 태그 구성
    const tags = [
      ...(recipe.tags || []),
      'AI-Generated',
      'YouTube',
      ...(recipe.difficulty ? [recipe.difficulty] : []),
    ];

    // ✅ AI 분석 관련 데이터
    const aiAnalysisData = {
      video_id: processingMetadata?.videoId || null,
      processing_time: processingMetadata?.processingTime || null,
      text_sources: processingMetadata?.textSources || {},
      raw_ai_response: recipe.rawResponse || null,
      confidence: recipe.confidence || null,
    };

    // ✅ 레시피 본문 데이터
    const recipeData = {
      title: recipe.title || 'AI 생성 레시피',
      description: recipe.description || 'AI가 분석한 요리 레시피입니다.',
      ingredients,
      instructions,
      prep_time: recipe.prep_time || null,
      cook_time: recipe.cook_time || recipe.cookingTime || null,
      servings: recipe.servings || null,
      difficulty_level: recipe.difficulty?.toLowerCase() || 'medium',
      tags,
      nutrition_info: nutritionInfo,
      source_url: sourceUrl || null,
      ai_generated: true,
      ai_analysis_data: aiAnalysisData,
      category_id, // 🧩 [추가] Supabase category_id 연결
    };

    // ✅ Supabase 저장
    const savedRecipe = await supabaseService.saveRecipe(recipeData);
    console.log('✅ 레시피 DB 저장 성공:', savedRecipe.id);

    // ✅ recipe_stats 자동 생성
    const { error: statError } = await supabaseAdmin
      .from('recipe_stats')
      .insert([{ recipe_id: savedRecipe.id }]);

    if (statError) {
      console.error('⚠️ recipe_stats 생성 오류:', statError.message);
    } else {
      console.log(`📊 recipe_stats 행 생성 완료 (recipe_id: ${savedRecipe.id})`);
    }

    res.json({
      success: true,
      message: '레시피가 성공적으로 저장되었습니다.',
      recipe_id: savedRecipe.id,
      title: savedRecipe.title,
      created_at: savedRecipe.created_at,
      category_id,
    });
  } catch (error) {
    console.error('❌ 레시피 저장 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route PATCH /api/recipes/:id/view
 * @desc 레시피 조회수(view_count) +1 증가
 */
router.patch('/:id/view', async (req, res) => {
  const recipeId = req.params.id;

  try {
    if (!recipeId) {
      return res.status(400).json({ success: false, message: 'recipe_id가 필요합니다.' });
    }

    // ✅ Supabase RPC (SQL 함수 increment_view_count 호출)
    const { error } = await supabaseAdmin.rpc('increment_view_count', {
      recipe_id_param: recipeId,
    });

    if (error) {
      console.error('❌ Supabase RPC 호출 실패:', error.message);
      return res.status(500).json({ success: false, message: '조회수 업데이트 실패', error });
    }

    console.log(`📈 조회수 +1 완료 (recipe_id: ${recipeId})`);
    return res.status(200).json({ success: true, message: '조회수 업데이트 성공' });
  } catch (err) {
    console.error('❌ 서버 오류:', err.message);
    return res.status(500).json({ success: false, message: '서버 내부 오류', error: err.message });
  }
});

/**
 * @route GET /api/recipes
 * @desc 저장된 레시피 목록 조회
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, ai_only = false } = req.query;

    const recipes = await supabaseService.getRecipes({
      page: parseInt(page),
      limit: parseInt(limit),
      ai_only: ai_only === 'true',
    });

    res.json({
      success: true,
      recipes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: recipes.length,
      },
    });
  } catch (error) {
    console.error('레시피 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route GET /api/recipes/:id
 * @desc 레시피 상세 조회
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await supabaseService.getRecipeById(id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: '레시피를 찾을 수 없습니다.',
      });
    }

    res.json({
      success: true,
      recipe,
    });
  } catch (error) {
    console.error('레시피 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route PUT /api/recipes/:id
 * @desc 레시피 수정
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedRecipe = await supabaseService.updateRecipe(id, updateData);

    res.json({
      success: true,
      message: '레시피가 성공적으로 수정되었습니다.',
      recipe: updatedRecipe,
    });
  } catch (error) {
    console.error('레시피 수정 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route DELETE /api/recipes/:id
 * @desc 레시피 삭제
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await supabaseService.deleteRecipe(id);

    res.json({
      success: true,
      message: '레시피가 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('레시피 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
