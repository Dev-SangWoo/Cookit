import express from 'express';
import supabaseService from '../services/supabaseService.js';

const router = express.Router();

/**
 * @route POST /api/recipes/from-ai
 * @desc AI 분석 결과를 Supabase DB에 저장
 * @body {Object} aiResult - AI 분석 결과
 * @body {string} sourceUrl - 원본 YouTube URL
 */
router.post('/from-ai', async (req, res) => {
  try {
    const { aiResult, sourceUrl, processingMetadata } = req.body;
    
    if (!aiResult || !aiResult.recipe) {
      return res.status(400).json({
        success: false,
        error: 'AI 분석 결과가 필요합니다.'
      });
    }

    const recipe = aiResult.recipe;
    console.log(`📝 레시피 DB 저장 시작: ${recipe.title}`);
    
    // 재료를 JSONB 형식으로 변환
    const ingredients = recipe.ingredients?.map((ing, index) => ({
      name: ing.name || ing.ingredient || ing,
      quantity: ing.amount || ing.quantity || '',
      unit: ing.unit || '',
      order: index + 1
    })) || [];

    // 조리 단계를 JSONB 형식으로 변환 (타임스탬프 포함)
    const instructions = recipe.steps?.map((step, index) => ({
      step: index + 1,
      title: step.title || `단계 ${index + 1}`,
      instruction: step.actions?.[0]?.action || step.action || step.instruction || step.content || step,
      start_time: step.start_time || null,  // HH:MM:SS 형식
      end_time: step.end_time || null,      // HH:MM:SS 형식
      time: step.actions?.[0]?.time || step.time || null,
      temperature: step.temperature || null,
      tips: step.actions?.[0]?.tip || step.tip || step.tips || null,
      ingredients: step.actions?.[0]?.ingredients || [],
      tools: step.actions?.[0]?.tools || []
    })) || [];

    // 영양 정보 처리
    const nutritionInfo = recipe.nutrition ? {
      calories: recipe.nutrition.calories || null,
      carbs: recipe.nutrition.carbs || null,
      protein: recipe.nutrition.protein || null,
      fat: recipe.nutrition.fat || null,
      serving_size: recipe.nutrition.serving_size || '1인분'
    } : null;

    // 태그 배열 생성
    const tags = [
      ...(recipe.tags || []),
      'AI-Generated',
      'YouTube',
      ...(recipe.difficulty ? [recipe.difficulty] : [])
    ];

    // AI 분석 메타데이터
    const aiAnalysisData = {
      video_id: processingMetadata?.videoId || null,
      processing_time: processingMetadata?.processingTime || null,
      text_sources: processingMetadata?.textSources || {},
      raw_ai_response: recipe.rawResponse || null,
      confidence: recipe.confidence || null
    };

    // SupabaseService를 사용하여 레시피 저장
    const recipeData = {
      title: recipe.title || 'AI 생성 레시피',
      description: recipe.description || 'AI가 분석한 요리 레시피입니다.',
      ingredients: ingredients,
      instructions: instructions,
      prep_time: recipe.prep_time || null,
      cook_time: recipe.cook_time || recipe.cookingTime || null,
      servings: recipe.servings || null,
      difficulty_level: recipe.difficulty?.toLowerCase() || 'medium',
      tags: tags,
      nutrition_info: nutritionInfo,
      source_url: sourceUrl || null,
      ai_generated: true,
      ai_analysis_data: aiAnalysisData
    };

    const savedRecipe = await supabaseService.saveRecipe(recipeData);

    console.log('✅ 레시피 DB 저장 성공!');
    
    res.json({
      success: true,
      message: '레시피가 성공적으로 저장되었습니다.',
      recipe_id: savedRecipe.id,
      title: savedRecipe.title,
      created_at: savedRecipe.created_at
    });

  } catch (error) {
    console.error('❌ 레시피 저장 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
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
      ai_only: ai_only === 'true'
    });
    
    res.json({
      success: true,
      recipes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: recipes.length
      }
    });

  } catch (error) {
    console.error('레시피 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
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
        error: '레시피를 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      recipe
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
      recipe: updatedRecipe
    });

  } catch (error) {
    console.error('레시피 수정 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
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
      message: '레시피가 성공적으로 삭제되었습니다.'
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
 * @route POST /api/recipes/:id/view
 * @desc 레시피 조회수 증가
 * @description 레시피를 조회할 때마다 호출하여 조회수를 증가시킵니다.
 *              recipe_stats 테이블이 없으면 자동으로 생성합니다.
 */
router.post('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1️⃣ 레시피 존재 여부 확인
    const recipe = await supabaseService.getRecipeById(id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: '레시피를 찾을 수 없습니다.'
      });
    }

    // 2️⃣ recipe_stats 레코드 확인
    // ANON_KEY 사용 (RLS 정책으로 권한 제어)
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const { data: existingStats, error: statsCheckError } = await supabase
      .from('recipe_stats')
      .select('*')
      .eq('recipe_id', id)
      .maybeSingle();

    if (statsCheckError && statsCheckError.code !== 'PGRST116') {
      console.error('❌ recipe_stats 조회 오류:', statsCheckError);
      throw statsCheckError;
    }

    // 3️⃣ recipe_stats가 없으면 생성
    if (!existingStats) {
      console.log(`📊 recipe_stats 초기 생성: ${id}`);
      const { data: newStats, error: insertError } = await supabase
        .from('recipe_stats')
        .insert({
          recipe_id: id,
          view_count: 1,
          favorite_count: 0,
          cook_count: 0,
          average_rating: 0.0,
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ recipe_stats 생성 오류:', insertError);
        throw insertError;
      }

      console.log(`✅ recipe_stats 초기 생성 완료: ${id}, view_count: 1`);

      return res.json({
        success: true,
        message: '조회수가 기록되었습니다 (초기 생성).',
        view_count: 1,
      });
    }

    // 4️⃣ 조회수 증가
    const newViewCount = (existingStats.view_count || 0) + 1;
    const { data: updatedStats, error: updateError } = await supabase
      .from('recipe_stats')
      .update({ 
        view_count: newViewCount,
        updated_at: new Date().toISOString(),
      })
      .eq('recipe_id', id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ recipe_stats 업데이트 오류:', updateError);
      throw updateError;
    }

    console.log(`✅ recipe_stats 조회수 증가 완료: ${id}, ${existingStats.view_count} → ${newViewCount}`);

    console.log(`👁️ 조회수 증가: ${recipe.title} (${updatedStats.view_count}회)`);

    res.json({
      success: true,
      message: '조회수가 증가되었습니다.',
      view_count: updatedStats.view_count,
    });

  } catch (error) {
    console.error('❌ 조회수 증가 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message || '조회수 증가 중 오류가 발생했습니다.',
    });
  }
});

export default router;
