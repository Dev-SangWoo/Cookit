import express from 'express';
import { supabase } from '../services/supabaseClient.js';

const router = express.Router();

/**
 * @route GET /api/recipe-categories
 * @desc 모든 레시피 카테고리 조회
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('recipe_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      categories: data
    });

  } catch (error) {
    console.error('카테고리 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '카테고리 조회 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route GET /api/recipe-categories/names
 * @desc 카테고리 이름 목록만 조회
 */
router.get('/names', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('recipe_categories')
      .select('name')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    const names = data.map(item => item.name);

    res.json({
      success: true,
      names
    });

  } catch (error) {
    console.error('카테고리 이름 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '카테고리 이름 조회 중 오류가 발생했습니다.' 
    });
  }
});

export default router;

