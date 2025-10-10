// API 테스트 스크립트
const API_BASE_URL = 'http://172.20.1.231:3000/api';

async function testRecipesAPI() {
  try {
    console.log('🧪 레시피 API 테스트 시작...');
    
    // 1. 레시피 목록 조회
    console.log('\n1️⃣ 레시피 목록 조회 테스트');
    const response = await fetch(`${API_BASE_URL}/recipes`);
    const data = await response.json();
    
    console.log('✅ 응답 상태:', response.status);
    console.log('✅ 성공 여부:', data.success);
    console.log('✅ 레시피 개수:', data.recipes?.length || 0);
    
    if (data.recipes && data.recipes.length > 0) {
      const firstRecipe = data.recipes[0];
      console.log('✅ 첫 번째 레시피:');
      console.log('   - 제목:', firstRecipe.title);
      console.log('   - 설명:', firstRecipe.description);
      console.log('   - 조리시간:', firstRecipe.cook_time);
      console.log('   - 난이도:', firstRecipe.difficulty_level);
      console.log('   - AI 생성:', firstRecipe.ai_generated);
    }
    
    // 2. 레시피 상세 조회 (첫 번째 레시피)
    if (data.recipes && data.recipes.length > 0) {
      console.log('\n2️⃣ 레시피 상세 조회 테스트');
      const recipeId = data.recipes[0].recipe_id;
      const detailResponse = await fetch(`${API_BASE_URL}/recipes/${recipeId}`);
      const detailData = await detailResponse.json();
      
      console.log('✅ 상세 조회 성공:', detailData.success);
      if (detailData.recipe) {
        console.log('✅ 레시피 상세 정보:');
        console.log('   - 재료 개수:', detailData.recipe.ingredients?.length || 0);
        console.log('   - 조리 단계:', detailData.recipe.instructions?.length || 0);
      }
    }
    
    console.log('\n🎉 API 테스트 완료!');
    
  } catch (error) {
    console.error('❌ API 테스트 실패:', error.message);
  }
}

// 테스트 실행
testRecipesAPI();
