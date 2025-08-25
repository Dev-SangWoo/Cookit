// 레시피 관련 API 서비스
import { supabase } from '../lib/supabase';

// 서버 API 기본 URL (localhost)
const API_BASE_URL = 'http://localhost:3000/api';

class RecipeService {
  
  /**
   * 인증 토큰 가져오기
   */
  async getAuthToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  }

  /**
   * 공개 레시피 목록 조회 (서버의 실제 엔드포인트 사용)
   */
  async getPublicRecipes(params = {}) {
    const { page = 1, limit = 10, ai_only = false } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (ai_only) {
      queryParams.append('ai_only', 'true');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/recipes?${queryParams}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || '레시피 조회 실패');
      }
      
      return data;
    } catch (error) {
      console.error('공개 레시피 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 내 레시피 목록 조회 (임시로 공개 레시피와 동일하게 처리)
   */
  async getMyRecipes(params = {}) {
    // 현재는 인증이 구현되지 않았으므로 공개 레시피를 반환
    return this.getPublicRecipes(params);
  }

  /**
   * 레시피 상세 정보 조회 (서버의 실제 엔드포인트 사용)
   */
  async getRecipeDetail(recipeId) {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || '레시피 상세 조회 실패');
      }
      
      return data.recipe;
    } catch (error) {
      console.error('레시피 상세 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 레시피 저장/즐겨찾기 (임시 구현)
   */
  async saveRecipe(recipeId, type = 'saved', options = {}) {
    // 현재는 임시로 성공 응답만 반환
    console.log(`레시피 ${recipeId}를 ${type}으로 저장 요청`);
    return {
      success: true,
      message: '레시피가 저장되었습니다.',
      type,
      recipe_id: recipeId
    };
  }

  /**
   * 저장된 레시피 삭제 (임시 구현)
   */
  async removeRecipe(recipeId, type = 'saved') {
    // 현재는 임시로 성공 응답만 반환
    console.log(`레시피 ${recipeId}를 ${type}에서 삭제 요청`);
    return {
      success: true,
      message: '레시피가 삭제되었습니다.',
      type,
      recipe_id: recipeId
    };
  }

  /**
   * YouTube 영상 분석 요청
   */
  async analyzeYouTubeVideo(url) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/analyze-youtube`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'YouTube 분석 실패');
      }
      
      return data;
    } catch (error) {
      console.error('YouTube 분석 오류:', error);
      throw error;
    }
  }
}

export default new RecipeService();
