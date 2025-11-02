// 레시피 관련 API 서비스
import { supabase } from '../lib/supabase';
import Constants from 'expo-constants';

// 서버 API 기본 URL (.env에서 가져오기)
const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ||
  process.env.EXPO_PUBLIC_API_BASE_URL;

// 디버깅: 환경변수 값 확인
console.log('🔍 API_BASE_URL:', API_BASE_URL);
console.log('🔍 Constants.expoConfig?.extra?.apiBaseUrl:', Constants.expoConfig?.extra?.apiBaseUrl);
console.log('🔍 process.env.EXPO_PUBLIC_API_BASE_URL:', process.env.EXPO_PUBLIC_API_BASE_URL);

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

  /**
   * 🔸 [추가됨] 추천 레시피 가져오기 (개인화 추천)
   */
  async getRecommendedRecipes(userId) {
    try {
      if (!userId) {
        console.warn('⚠️ userId가 없습니다. 기본 추천을 반환합니다.');
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/recommendations/user/${userId}`);
      const data = await response.json();

      if (!data.success) {
        console.warn('⚠️ 추천 레시피 API 응답 실패:', data.message);
        return [];
      }

      console.log(`✅ 추천 레시피 ${data.recommendations?.length || 0}개 로드됨`);
      return data.recommendations || [];
    } catch (error) {
      console.error('추천 레시피 가져오기 실패:', error);
      return [];
    }
  }

  /**
   * 🔸 [추가됨] 레시피 조회수 증가
   */
  async incrementViewCount(recipeId) {
    try {
      if (!recipeId) {
        console.warn('⚠️ recipeId가 없습니다. 조회수 증가 요청을 건너뜁니다.');
        return;
      }

      const url = `${API_BASE_URL}/recipes/${recipeId}/view`;
      console.log('📡 조회수 증가 요청 URL:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('❌ 서버 응답 오류:', text);
        return;
      }

      const result = await response.json();
      console.log('✅ 조회수 증가 성공:', result);
      return result;
    } catch (error) {
      console.warn('⚠️ 조회수 증가 실패 (RecipeSummary):', error.message);
    }
  }
}

export default new RecipeService();
