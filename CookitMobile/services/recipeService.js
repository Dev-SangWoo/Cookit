// 레시피 관련 API 서비스
import { supabase } from '../lib/supabase';
import Constants from 'expo-constants';

// 서버 API 기본 URL (.env에서 가져오기)
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl ;
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
   * 레시피 좋아요 추가/제거 (RecipeRating에서 사용하는 방식과 동일)
   */
  async saveRecipe(recipeId, type = 'favorited', options = {}) {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
      
      // RecipeRating에서 사용하는 /api/recipe-likes/:recipeId 엔드포인트 사용
      const response = await fetch(`${baseUrl}/recipe-likes/${recipeId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ liked: true })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '좋아요 추가 실패');
      }

      console.log(`✅ 레시피 ${recipeId} 좋아요 추가 완료`);
      return data;
    } catch (error) {
      console.error('좋아요 추가 오류:', error);
      throw error;
    }
  }

  /**
   * 레시피 좋아요 제거 (RecipeRating에서 사용하는 방식과 동일)
   */
  async removeRecipe(recipeId, type = 'favorited') {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
      
      // RecipeRating에서 사용하는 /api/recipe-likes/:recipeId 엔드포인트 사용
      const response = await fetch(`${baseUrl}/recipe-likes/${recipeId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ liked: false })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '좋아요 제거 실패');
      }

      console.log(`✅ 레시피 ${recipeId} 좋아요 제거 완료`);
      return data;
    } catch (error) {
      console.error('좋아요 제거 오류:', error);
      throw error;
    }
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
   * 비디오 분석 상태 조회 (폴링용)
   */
  async getAnalysisStatus(videoId) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/status/${videoId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('분석 상태 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 개인화 추천 레시피 조회
   * 사용자 프로필의 favorite_cuisines, dietary_restrictions 기반
   */
  async getRecommendedRecipes() {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        console.warn('⚠️ 인증 토큰이 없습니다. 개인화 추천을 사용할 수 없습니다.');
        // 토큰이 없으면 일반 레시피 목록 반환
        return this.getPublicRecipes({ limit: 20 });
      }

      const response = await fetch(`${API_BASE_URL}/recommendations/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '추천 레시피 조회 실패');
      }

      return {
        success: true,
        recipes: data.recommendations,
        total: data.total,
        user: data.user,
        favorite_cuisines: data.favorite_cuisines,
        dietary_restrictions: data.dietary_restrictions,
      };
    } catch (error) {
      console.error('추천 레시피 조회 오류:', error);
      // 오류 시 일반 레시피 목록으로 대체
      return this.getPublicRecipes({ limit: 20 });
    }
  }

  /**
   * 인기 레시피 조회 (조회수 기반)
   */
  async getPopularRecipes(limit = 10) {
    try {
      const token = await this.getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // 인증 토큰이 있으면 좋아요 상태 포함
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/recommendations/popular?limit=${limit}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '인기 레시피 조회 실패');
      }

      return {
        success: true,
        recipes: data.recipes,
        total: data.total,
      };
    } catch (error) {
      console.error('인기 레시피 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 레시피 조회수 증가
   * @param {string} recipeId - 레시피 ID
   */
  async incrementViewCount(recipeId) {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.success) {
        console.warn('⚠️ 조회수 증가 실패:', data.error);
        return { success: false };
      }

      console.log(`👁️ 조회수 증가 완료: ${recipeId} (${data.view_count}회)`);
      return {
        success: true,
        view_count: data.view_count,
      };
    } catch (error) {
      console.error('조회수 증가 오류:', error);
      // 조회수 증가 실패는 치명적이지 않으므로 경고만 출력
      return { success: false };
    }
  }

  /**
   * 난이도 기반 추천 레시피 조회
   * 사용자의 cooking_level에 맞는 난이도의 레시피 추천
   */
  async getRecipesByDifficulty(limit = 10) {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        console.warn('⚠️ 인증 토큰이 없습니다. 난이도 기반 추천을 사용할 수 없습니다.');
        return this.getPublicRecipes({ limit });
      }

      const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
      const response = await fetch(`${baseUrl}/recommendations/by-difficulty?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '난이도 기반 추천 실패');
      }

      return {
        success: true,
        recipes: data.recipes,
        total: data.total,
        cooking_level: data.cooking_level,
        target_difficulty: data.target_difficulty,
      };
    } catch (error) {
      console.error('난이도 기반 추천 오류:', error);
      return this.getPublicRecipes({ limit });
    }
  }

  /**
   * 완성한 요리 기반 추천 레시피 조회
   * 사용자가 이전에 완성한 요리와 유사한 카테고리의 레시피 추천
   */
  async getSimilarToCookedRecipes(limit = 10) {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        console.warn('⚠️ 인증 토큰이 없습니다. 유사 레시피 추천을 사용할 수 없습니다.');
        return this.getPublicRecipes({ limit });
      }

      const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
      const response = await fetch(`${baseUrl}/recommendations/similar-to-cooked?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '유사 레시피 추천 실패');
      }

      return {
        success: true,
        recipes: data.recipes,
        total: data.total,
        cooked_count: data.cooked_count,
        message: data.message,
      };
    } catch (error) {
      console.error('유사 레시피 추천 오류:', error);
      return this.getPublicRecipes({ limit });
    }
  }
}

export default new RecipeService();
