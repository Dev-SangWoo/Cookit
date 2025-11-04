/**
 * Supabase 연동 서비스
 * 일반 Supabase 클라이언트를 통한 데이터베이스 작업
 */

import { supabase } from './supabaseClient.js';

/**
 * 레시피 데이터베이스 작업을 위한 서비스 클래스
 */
class SupabaseService {
  /**
   * 레시피 저장
   * @param {Object} recipeData - 저장할 레시피 데이터
   * @returns {Promise<Object>} 저장된 레시피 정보
   */
  async saveRecipe(recipeData) {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .insert([recipeData])
        .select()
        .single();

      if (error) {
        console.error('레시피 저장 오류:', error);
        throw new Error(`레시피 저장 실패: ${error.message}`);
      }

      console.log('✅ 레시피 저장 성공:', data.id);
      return data;
    } catch (error) {
      console.error('SupabaseService.saveRecipe 오류:', error);
      throw error;
    }
  }

  /**
   * 레시피 목록 조회
   */
  async getRecipes(options = {}) {
    try {
      const { page = 1, limit = 10, ai_only = false } = options;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('recipes')
        .select(`
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
          image_urls,
          source_url,
          ai_generated,
          created_at,
          recipe_stats (
            view_count,
            favorite_count,
            cook_count
          ),
          recipe_categories (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (ai_only) query = query.eq('ai_generated', true);

      const { data, error } = await query;
      if (error) throw new Error(`레시피 조회 실패: ${error.message}`);
      return data || [];
    } catch (error) {
      console.error('SupabaseService.getRecipes 오류:', error);
      throw error;
    }
  }

  /**
   * 레시피 상세 조회
   */
  async getRecipeById(recipeId) {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_stats (
            view_count,
            favorite_count,
            cook_count
          ),
          recipe_categories (
            name
          )
        `)
        .eq('id', recipeId)
        .single();

      if (error) throw new Error(`레시피 조회 실패: ${error.message}`);
      return data;
    } catch (error) {
      console.error('SupabaseService.getRecipeById 오류:', error);
      throw error;
    }
  }

  /**
   * 레시피 업데이트
   */
  async updateRecipe(recipeId, updateData) {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .update(updateData)
        .eq('recipe_id', recipeId)
        .select()
        .single();

      if (error) throw new Error(`레시피 업데이트 실패: ${error.message}`);
      return data;
    } catch (error) {
      console.error('SupabaseService.updateRecipe 오류:', error);
      throw error;
    }
  }

  /**
   * 레시피 삭제
   */
  async deleteRecipe(recipeId) {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('recipe_id', recipeId);

      if (error) throw new Error(`레시피 삭제 실패: ${error.message}`);
      return true;
    } catch (error) {
      console.error('SupabaseService.deleteRecipe 오류:', error);
      throw error;
    }
  }
}

// ✅ ESM export 방식
const supabaseService = new SupabaseService();
export { supabaseService, SupabaseService };
export default supabaseService;
