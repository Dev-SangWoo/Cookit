const express = require('express');
const { mcp_supabase_execute_sql } = require('../services/supabaseService');

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
    
    // Supabase에 레시피 저장
    const insertQuery = `
      INSERT INTO recipes (
        title,
        description,
        ingredients,
        instructions,
        prep_time,
        cook_time,
        servings,
        difficulty_level,
        tags,
        nutrition_info,
        source_url,
        ai_generated,
        ai_analysis_data
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      ) RETURNING id, title, created_at;
    `;

    // 재료를 JSONB 형식으로 변환
    const ingredients = recipe.ingredients?.map((ing, index) => ({
      name: ing.name || ing.ingredient || ing,
      quantity: ing.amount || ing.quantity || '',
      unit: ing.unit || '',
      order: index + 1
    })) || [];

    // 조리 단계를 JSONB 형식으로 변환
    const instructions = recipe.steps?.map((step, index) => ({
      step: index + 1,
      title: step.title || `단계 ${index + 1}`,
      instruction: step.action || step.instruction || step.content || step,
      time: step.time || null,
      temperature: step.temperature || null,
      tips: step.tip || step.tips || null
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

    const result = await mcp_supabase_execute_sql('ujqdizvpkrjunyrcpvtf', insertQuery, [
      recipe.title || 'AI 생성 레시피',
      recipe.description || 'AI가 분석한 요리 레시피입니다.',
      JSON.stringify(ingredients),
      JSON.stringify(instructions),
      recipe.prep_time || null,
      recipe.cook_time || recipe.cookingTime || null,
      recipe.servings || null,
      recipe.difficulty?.toLowerCase() || 'medium',
      tags,
      nutritionInfo ? JSON.stringify(nutritionInfo) : null,
      sourceUrl || null,
      true, // ai_generated
      JSON.stringify(aiAnalysisData)
    ]);

    console.log('✅ 레시피 DB 저장 성공!');
    
    res.json({
      success: true,
      message: '레시피가 성공적으로 저장되었습니다.',
      recipe_id: result[0]?.id,
      title: result[0]?.title,
      created_at: result[0]?.created_at
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
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    if (ai_only === 'true') {
      whereClause = 'WHERE ai_generated = true';
    }
    
    const query = `
      SELECT 
        id,
        title,
        description,
        jsonb_array_length(ingredients) as ingredient_count,
        jsonb_array_length(instructions) as step_count,
        servings,
        difficulty_level,
        tags,
        source_url,
        ai_generated,
        created_at
      FROM recipes 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2;
    `;

    const recipes = await mcp_supabase_execute_sql('ujqdizvpkrjunyrcpvtf', query, [limit, offset]);
    
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
    
    const query = `
      SELECT 
        id,
        title,
        description,
        ingredients,
        instructions,
        prep_time,
        cook_time,
        servings,
        difficulty_level,
        tags,
        nutrition_info,
        source_url,
        ai_generated,
        ai_analysis_data,
        created_at,
        updated_at
      FROM recipes 
      WHERE id = $1;
    `;

    const result = await mcp_supabase_execute_sql('ujqdizvpkrjunyrcpvtf', query, [id]);
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: '레시피를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      recipe: result[0]
    });

  } catch (error) {
    console.error('레시피 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;