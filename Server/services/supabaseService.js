/**
 * Supabase 연동 서비스
 * 일반 Supabase 클라이언트를 통한 데이터베이스 작업
 */

const { supabase } = require('./supabaseClient');

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
      return { ...data, recipe_id: data.id };
    } catch (error) {
      console.error('SupabaseService.saveRecipe 오류:', error);
      throw error;
    }
  }

  /**
   * 레시피 목록 조회
   * @param {Object} options - 조회 옵션
   * @returns {Promise<Array>} 레시피 목록
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
          source_url,
          ai_generated,
          created_at
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // AI 생성 레시피만 필터링
      if (ai_only) {
        query = query.eq('ai_generated', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('레시피 조회 오류:', error);
        throw new Error(`레시피 조회 실패: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('SupabaseService.getRecipes 오류:', error);
      throw error;
    }
  }

  /**
   * 레시피 상세 조회
   * @param {string} recipeId - 레시피 ID
   * @returns {Promise<Object>} 레시피 상세 정보
   */
  async getRecipeById(recipeId) {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('recipe_id', recipeId)
        .single();

      if (error) {
        console.error('레시피 상세 조회 오류:', error);
        throw new Error(`레시피 조회 실패: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('SupabaseService.getRecipeById 오류:', error);
      throw error;
    }
  }

  /**
   * 레시피 업데이트
   * @param {string} recipeId - 레시피 ID
   * @param {Object} updateData - 업데이트할 데이터
   * @returns {Promise<Object>} 업데이트된 레시피
   */
  async updateRecipe(recipeId, updateData) {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .update(updateData)
        .eq('recipe_id', recipeId)
        .select()
        .single();

      if (error) {
        console.error('레시피 업데이트 오류:', error);
        throw new Error(`레시피 업데이트 실패: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('SupabaseService.updateRecipe 오류:', error);
      throw error;
    }
  }

  /**
   * 레시피 삭제
   * @param {string} recipeId - 레시피 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async deleteRecipe(recipeId) {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('recipe_id', recipeId);

      if (error) {
        console.error('레시피 삭제 오류:', error);
        throw new Error(`레시피 삭제 실패: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('SupabaseService.deleteRecipe 오류:', error);
      throw error;
    }
  }
}

// 서비스 인스턴스 생성
const supabaseService = new SupabaseService();

module.exports = {
  supabaseService,
  SupabaseService
};