/**
 * 개선된 AI 파이프라인 - Supabase 레시피 테이블 구조에 맞는 JSON 생성
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { supabaseService } = require('./supabaseService');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Supabase 레시피 테이블 구조에 맞는 프롬프트 생성
 */
function generateStructuredPrompt(videoUrl, combinedText) {
  return `당신은 전문 요리 분석가입니다. 다음 텍스트를 분석하여 정확한 JSON 형식의 레시피를 생성해주세요.

🔗 영상 URL: ${videoUrl}

다음 JSON 스키마에 정확히 맞춰서 레시피를 생성해주세요:

\`\`\`json
{
  "title": "레시피 제목 (한국어)",
  "description": "레시피에 대한 간단한 설명",
  "category": "한식|중식|양식|일식|분식|디저트|음료 중 하나 (내부적으로 category_id로 변환됨)",
  "cook_time": 30,     // 조리시간 (분 단위, 숫자)
  "prep_time": 10,     // 준비시간 (분 단위, 숫자)
  "servings": 2,       // 인분 수 (숫자)
  "difficulty_level": "easy|medium|hard 중 하나",
  "ingredients": [     // JSONB 배열
    {
      "name": "재료명",
      "quantity": "2개",
      "unit": "개",
      "order": 1
    }
  ],
  "instructions": [    // JSONB 배열
    {
      "step": 1,
      "title": "단계 제목",
      "instruction": "상세한 조리 방법",
      "time": 5,         // 해당 단계 소요시간 (분, 선택)
      "temperature": 180, // 온도 (℃, 선택)
      "tips": "조리 팁 (선택)",
      "start_time": "00:00:10",  // 영상에서 시작 시간 (HH:MM:SS 형식, 타임스탬프 정보 참고)
      "end_time": "00:02:30"     // 영상에서 종료 시간 (HH:MM:SS 형식, 타임스탬프 정보 참고)
    }
  ],
  "nutrition_info": {  // JSONB 객체 (선택)
    "calories": 350,
    "carbs": "45g",
    "protein": "15g", 
    "fat": "8g",
    "serving_size": "1인분"
  },
  "tags": ["태그1", "태그2", "AI-Generated"],
  "source_url": "${videoUrl}",
  "video_url": "${videoUrl}",
  "ai_generated": true,
  "is_public": true,
  "image_urls": []
}
\`\`\`

중요한 규칙:
1. **반드시 JSON 형태로만 응답**하세요. 다른 텍스트는 포함하지 마세요.
2. **모든 필수 필드**를 포함해야 합니다.
3. **cook_time, prep_time, servings는 반드시 숫자**로 입력하세요.
4. **ingredients와 instructions는 배열**이며, 순서대로 정렬하세요.
5. **category**는 제공된 옵션 중에서만 선택하세요.
6. **difficulty_level**는 "easy", "medium", "hard" 중에서만 선택하세요.
7. **한국어로 작성**하고, 실제 요리가 가능한 구체적인 내용으로 작성하세요.
8. **start_time과 end_time**: 텍스트에 포함된 타임스탬프 정보([HH:MM:SS] 형식)를 참고하여 각 조리 단계가 영상에서 시작하고 끝나는 시간을 정확히 지정하세요.

분석할 텍스트:
---
${combinedText}
---

위 텍스트를 바탕으로 정확한 JSON 레시피를 생성해주세요:`;
}

/**
 * 개선된 YouTube 영상 분석 파이프라인
 */
async function processYouTubeVideo(videoUrl) {
  const startTime = Date.now();
  let videoId = null;
  
  try {
    console.log(`🎬 YouTube 영상 분석 시작: ${videoUrl}`);
    
    // 1. Video ID 추출
    videoId = extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error('유효한 YouTube URL이 아닙니다.');
    }
    
    console.log(`📝 Video ID: ${videoId}`);
    
    // 2. 기존 OCR + 텍스트 추출 파이프라인 실행
    const servicesDir = path.join(__dirname);
    const originalCwd = process.cwd();
    
    try {
      process.chdir(servicesDir);
      
      // OCR 분석 실행
      console.log('🔍 [1/4] OCR 분석 실행 중...');
      execSync(`node ocr_analyze.js "${videoUrl}"`, { stdio: 'inherit' });
      
      // 텍스트 통합
      console.log('📋 [2/4] 텍스트 통합 중...');
      execSync(`node generate_combined_text.js ${videoId}`, { stdio: 'inherit' });
      
      // 통합된 텍스트 읽기
      const combinedTextPath = path.join(servicesDir, 'combined_sub', `${videoId}.txt`);
      if (!fs.existsSync(combinedTextPath)) {
        throw new Error('통합 텍스트 파일을 찾을 수 없습니다.');
      }
      
      const combinedText = fs.readFileSync(combinedTextPath, 'utf-8');
      console.log(`📄 텍스트 길이: ${combinedText.length}자`);
      
      // 3. 구조화된 프롬프트로 Gemini API 호출
      console.log('🤖 [3/4] Gemini API로 구조화된 레시피 생성 중...');
      const structuredRecipe = await generateStructuredRecipeWithGemini(videoUrl, combinedText);
      
      // 4. Supabase DB에 저장
      console.log('💾 [4/4] Supabase DB에 저장 중...');
      const savedRecipe = await saveRecipeToSupabase(structuredRecipe, videoUrl, {
        videoId,
        processingTime: Date.now() - startTime,
        textSources: {
          ocr: `OCR_sub/${videoId}.txt`,
          combined: `combined_sub/${videoId}.txt`
        }
      });
      
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);
      
      console.log(`✅ 전체 파이프라인 완료! (${duration}초 소요)`);
      console.log(`📋 레시피 ID: ${savedRecipe.recipe_id}`);
      console.log(`📝 제목: ${savedRecipe.title}`);
      
      return {
        success: true,
        recipe_id: savedRecipe.recipe_id,
        title: savedRecipe.title,
        video_id: videoId,
        processing_time: duration,
        source_url: videoUrl
      };
      
    } finally {
      process.chdir(originalCwd);
    }
    
  } catch (error) {
    console.error('❌ 파이프라인 오류:', error);
    throw error;
  }
}

/**
 * Gemini API로 구조화된 레시피 생성
 */
async function generateStructuredRecipeWithGemini(videoUrl, combinedText) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
      // 최신 Gemini 모델 사용 (2025년 9월 기준)
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',  // 안정적이고 빠른 최신 모델
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      });
    
    const prompt = generateStructuredPrompt(videoUrl, combinedText);
    
    console.log('🚀 Gemini API 요청...');
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();
    
    console.log('📄 Gemini 응답 길이:', response.length);
    
    // JSON 추출 및 파싱
    let recipeJson;
    try {
      // JSON 코드 블록에서 추출
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        recipeJson = JSON.parse(jsonMatch[1]);
      } else {
        // 직접 JSON 파싱 시도
        const startIndex = response.indexOf('{');
        const endIndex = response.lastIndexOf('}') + 1;
        if (startIndex !== -1 && endIndex > startIndex) {
          recipeJson = JSON.parse(response.substring(startIndex, endIndex));
        } else {
          throw new Error('JSON 형식을 찾을 수 없습니다.');
        }
      }
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      console.error('원본 응답:', response);
      throw new Error('Gemini 응답을 JSON으로 파싱할 수 없습니다.');
    }
    
    // 필수 필드 검증 및 기본값 설정
    const validatedRecipe = validateAndNormalizeRecipe(recipeJson);
    
    console.log('✅ 구조화된 레시피 생성 완료');
    console.log(`📝 제목: ${validatedRecipe.title}`);
    console.log(`🍳 카테고리: ${recipeJson.category} → category_id: null`);
    console.log(`🔧 난이도: ${recipeJson.difficulty_level} → ${validatedRecipe.difficulty_level}`);
    console.log(`⏱️ 조리시간: ${validatedRecipe.cook_time}분`);
    console.log(`🥘 재료 수: ${validatedRecipe.ingredients.length}개`);
    console.log(`📋 조리단계: ${validatedRecipe.instructions.length}단계`);
    
    return validatedRecipe;
    
  } catch (error) {
    console.error('Gemini API 오류:', error);
    throw error;
  }
}

/**
 * 레시피 데이터 검증 및 정규화
 */
function validateAndNormalizeRecipe(recipe) {
  // 기본값 설정 (category를 category_id로 변경)
  const normalized = {
    title: recipe.title || 'AI 생성 레시피',
    description: recipe.description || 'AI가 분석한 요리 레시피입니다.',
    category_id: null, // 일단 null로 설정 (카테고리 UUID 매핑 필요)
    cook_time: parseInt(recipe.cook_time) || 30,
    prep_time: parseInt(recipe.prep_time) || 10,
    servings: parseInt(recipe.servings) || 2,
    difficulty_level: validateDifficulty(recipe.difficulty_level) || '보통',
    ingredients: normalizeIngredients(recipe.ingredients || []),
    instructions: normalizeInstructions(recipe.instructions || []),
    nutrition_info: recipe.nutrition_info || null,
    tags: [...(recipe.tags || []), 'AI-Generated'].filter(Boolean),
    source_url: recipe.source_url || null,
    video_url: recipe.video_url || null,
    ai_generated: true,
    is_public: true,
    image_urls: recipe.image_urls || []
  };
  
  return normalized;
}

/**
 * 카테고리 검증
 */
function validateCategory(category) {
  const validCategories = ['한식', '중식', '양식', '일식', '분식', '디저트', '음료'];
  return validCategories.includes(category) ? category : '한식';
}

/**
 * 난이도 검증 (영어로 변환)
 */
function validateDifficulty(difficulty) {
  const difficultyMap = {
    '쉬움': 'easy',
    '보통': 'medium', 
    '어려움': 'hard',
    'easy': 'easy',
    'medium': 'medium',
    'hard': 'hard'
  };
  
  return difficultyMap[difficulty] || 'medium';
}

/**
 * 재료 데이터 정규화
 */
function normalizeIngredients(ingredients) {
  return ingredients.map((ingredient, index) => ({
    name: ingredient.name || '재료',
    quantity: ingredient.quantity || '',
    unit: ingredient.unit || '',
    order: ingredient.order || index + 1
  }));
}

/**
 * 조리단계 데이터 정규화 (타임스탬프 포함)
 */
function normalizeInstructions(instructions) {
  return instructions.map((instruction, index) => ({
    step: instruction.step || index + 1,
    title: instruction.title || `단계 ${index + 1}`,
    instruction: instruction.instruction || '',
    time: instruction.time ? parseInt(instruction.time) : null,
    temperature: instruction.temperature ? parseInt(instruction.temperature) : null,
    tips: instruction.tips || null,
    start_time: instruction.start_time || null,  // 영상 시작 시간 (HH:MM:SS)
    end_time: instruction.end_time || null       // 영상 종료 시간 (HH:MM:SS)
  }));
}

/**
 * Supabase DB에 레시피 저장
 */
async function saveRecipeToSupabase(recipeData, sourceUrl, metadata) {
  try {
    // AI 분석 메타데이터 추가
    const enrichedData = {
      ...recipeData,
      ai_analysis_data: {
        video_id: metadata.videoId,
        processing_time: metadata.processingTime,
        text_sources: metadata.textSources,
        model_used: 'gemini-2.5-flash',
        created_at: new Date().toISOString()
      },
      ai_prompt: `YouTube 영상 분석을 통한 레시피 생성 (${metadata.videoId})`,
      user_id: null, // AI 생성이므로 null
      source_url: sourceUrl
    };
    
    const savedRecipe = await supabaseService.saveRecipe(enrichedData);
    console.log('✅ Supabase 저장 완료:', savedRecipe.recipe_id);
    
    return savedRecipe;
    
  } catch (error) {
    console.error('Supabase 저장 오류:', error);
    throw error;
  }
}

/**
 * YouTube URL에서 video ID 추출
 */
function extractVideoId(url) {
  let videoId;
  
  if (url.includes('youtube.com/watch')) {
    const match = url.match(/[?&]v=([^&]+)/);
    videoId = match ? match[1] : null;
  } else if (url.includes('youtube.com/shorts/')) {
    // YouTube Shorts URL 처리
    const match = url.match(/\/shorts\/([^?]+)/);
    videoId = match ? match[1] : null;
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0];
  } else {
    videoId = null;
  }
  
  return videoId;
}

module.exports = {
  processYouTubeVideo,
  generateStructuredRecipeWithGemini,
  validateAndNormalizeRecipe
};
