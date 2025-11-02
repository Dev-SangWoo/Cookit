# 🏗️ Cookit 시스템 - 모듈 설계명세서

## 📋 개요
Cookit 시스템은 총 12개의 모듈로 구성되어 있으며, 각 기능별로 프론트엔드와 백엔드 모듈이 1:1로 대응됩니다.

---

## 📱 프론트엔드 모듈 (6개)

### 1. 사용자 관리 프론트엔드 모듈

#### 3.1 모듈 이름
**UserManagementFrontendModule**

#### 3.2 모듈 형
**UI 모듈**

#### 3.3 인터페이스
**입력:**
- 사용자 인증 정보 (이메일, 비밀번호)
- 프로필 데이터 (닉네임, 자기소개, 프로필 이미지)
- 초기 설정 데이터 (요리 실력, 선호도, 알레르기 정보)

**출력:**
- 인증 결과 (성공/실패, 사용자 정보)
- 프로필 업데이트 결과
- 초기 설정 완료 상태

**처리:**
- Google OAuth를 통한 인증 검증
- 사용자 프로필 정보 관리
- 초기 설정 과정 안내 및 데이터 수집

#### 3.4 오류 메시지
**예외 처리:**
- 인증 실패 시 로그인 화면으로 리다이렉트
- 네트워크 오류 시 재시도 옵션 제공
- 중복 닉네임 시 대안 제시
- 초기 설정 미완료 시 Setup 화면으로 이동
- 권한 부족 시 적절한 안내 메시지 표시

#### 3.5 사용하는 파일
**구성 요소:**
- 인증 화면 컴포넌트
- Google 로그인 버튼 컴포넌트
- 인증 상태 관리 컨텍스트
- 프로필 관리 화면
- 초기 설정 화면들 (닉네임, 프로필, 선호도, 재료)

#### 3.6 호출하는 모듈
**의존성 관계:**
- 사용자 관리 백엔드 모듈 (인증 및 프로필 관리 API)
- 데이터베이스 모듈 (사용자 정보 저장/조회)
- Google OAuth 서비스 (외부 인증)

---

### 2. 레시피 관리 프론트엔드 모듈

#### 3.1 모듈 이름
**RecipeManagementFrontendModule**

#### 3.2 모듈 형
**UI 모듈**

#### 3.3 인터페이스
```typescript
interface RecipeManagementFrontend {
  // 레시피 조회
  recipes: {
    getPublicRecipes(params: QueryParams): Promise<Recipe[]>;
    getRecipeById(id: string): Promise<Recipe>;
    getMyRecipes(type: 'saved'|'favorited'|'created'): Promise<Recipe[]>;
  };
  
  // 레시피 관리
  management: {
    saveRecipe(recipeId: string): Promise<void>;
    favoriteRecipe(recipeId: string): Promise<void>;
    rateRecipe(recipeId: string, rating: number): Promise<void>;
  };
  
  // 요리 과정
  cooking: {
    startCooking(recipeId: string): Promise<void>;
    completeStep(stepId: string): Promise<void>;
    finishCooking(recipeId: string): Promise<void>;
  };
}
```

#### 3.4 오류 메시지
```typescript
const RECIPE_FRONTEND_ERRORS = {
  RECIPE_NOT_FOUND: "레시피를 찾을 수 없습니다.",
  SAVE_FAILED: "레시피 저장에 실패했습니다.",
  FAVORITE_FAILED: "즐겨찾기 추가에 실패했습니다.",
  RATING_FAILED: "평점 등록에 실패했습니다.",
  COOKING_START_FAILED: "요리 시작에 실패했습니다.",
  INVALID_RECIPE_DATA: "레시피 데이터가 올바르지 않습니다.",
  PERMISSION_DENIED: "레시피에 접근할 권한이 없습니다."
};
```

#### 3.5 사용하는 파일
```
CookitMobile/
├── screens/Home/HomeMain.js
├── screens/Recipe/RecipeMain.js
├── screens/Recipe/RecipeStack.js
├── screens/Summary.js
├── screens/RecipeList.js
├── services/recipeService.js
└── components/RecipeCard.js
```

#### 3.6 호출하는 모듈
- **레시피 관리 백엔드 모듈** (API 통신)
- **Database Module** (직접 Supabase 연동)

---

### 3. 냉장고 관리 프론트엔드 모듈

#### 3.1 모듈 이름
**RefrigeratorManagementFrontendModule**

#### 3.2 모듈 형
**UI 모듈**

#### 3.3 인터페이스
```typescript
interface RefrigeratorManagementFrontend {
  // 재료 관리
  ingredients: {
    getMyIngredients(): Promise<Ingredient[]>;
    addIngredient(ingredient: Ingredient): Promise<void>;
    updateIngredient(id: string, data: Partial<Ingredient>): Promise<void>;
    deleteIngredient(id: string): Promise<void>;
  };
  
  // OCR 처리
  ocr: {
    processReceipt(image: File): Promise<ReceiptData>;
    extractIngredients(text: string): Promise<Ingredient[]>;
  };
  
  // 유통기한 관리
  expiry: {
    getExpiringIngredients(days: number): Promise<Ingredient[]>;
    setExpiryAlert(ingredientId: string, days: number): Promise<void>;
  };
}
```

#### 3.4 오류 메시지
```typescript
const REFRIGERATOR_FRONTEND_ERRORS = {
  INGREDIENT_NOT_FOUND: "재료를 찾을 수 없습니다.",
  ADD_INGREDIENT_FAILED: "재료 추가에 실패했습니다.",
  UPDATE_INGREDIENT_FAILED: "재료 정보 수정에 실패했습니다.",
  DELETE_INGREDIENT_FAILED: "재료 삭제에 실패했습니다.",
  OCR_PROCESSING_FAILED: "영수증 처리에 실패했습니다.",
  INVALID_IMAGE_FORMAT: "지원하지 않는 이미지 형식입니다.",
  EXPIRY_DATE_INVALID: "유통기한이 올바르지 않습니다."
};
```

#### 3.5 사용하는 파일
```
CookitMobile/
├── screens/Home/Ingredients.js
├── screens/Setup/SetupIngredients.js
├── screens/Setup/SetupIngredientsModal.js
└── Recipt+OCR/ocrHandler.js
```

#### 3.6 호출하는 모듈
- **냉장고 관리 백엔드 모듈** (API 통신)
- **Database Module** (직접 Supabase 연동)

---

### 4. 커뮤니티 관리 프론트엔드 모듈

#### 3.1 모듈 이름
**CommunityManagementFrontendModule**

#### 3.2 모듈 형
**UI 모듈**

#### 3.3 인터페이스
```typescript
interface CommunityManagementFrontend {
  // 게시글 관리
  posts: {
    getPosts(page: number, limit: number): Promise<Post[]>;
    getPostById(id: string): Promise<Post>;
    createPost(data: PostData): Promise<Post>;
    updatePost(id: string, data: Partial<PostData>): Promise<Post>;
    deletePost(id: string): Promise<void>;
  };
  
  // 상호작용
  interactions: {
    likePost(postId: string): Promise<void>;
    unlikePost(postId: string): Promise<void>;
    addComment(postId: string, content: string): Promise<Comment>;
    updateComment(commentId: string, content: string): Promise<Comment>;
    deleteComment(commentId: string): Promise<void>;
  };
  
  // 실시간 업데이트
  realtime: {
    subscribeToPosts(callback: (post: Post) => void): void;
    subscribeToComments(postId: string, callback: (comment: Comment) => void): void;
  };
}
```

#### 3.4 오류 메시지
```typescript
const COMMUNITY_FRONTEND_ERRORS = {
  POST_NOT_FOUND: "게시글을 찾을 수 없습니다.",
  CREATE_POST_FAILED: "게시글 작성에 실패했습니다.",
  UPDATE_POST_FAILED: "게시글 수정에 실패했습니다.",
  DELETE_POST_FAILED: "게시글 삭제에 실패했습니다.",
  LIKE_FAILED: "좋아요 처리에 실패했습니다.",
  COMMENT_FAILED: "댓글 처리에 실패했습니다.",
  INVALID_POST_DATA: "게시글 데이터가 올바르지 않습니다.",
  PERMISSION_DENIED: "게시글에 접근할 권한이 없습니다."
};
```

#### 3.5 사용하는 파일
```
CookitMobile/
├── screens/community/CommunityMain.tsx
├── screens/community/CommunityCreate.tsx
├── screens/community/CommunityDetail.tsx
├── screens/community/CommunityStack.tsx
├── services/postsApi.ts
├── services/commentsApi.ts
└── services/likesApi.ts
```

#### 3.6 호출하는 모듈
- **커뮤니티 관리 백엔드 모듈** (API 통신)
- **Database Module** (직접 Supabase 연동)

---

### 5. AI 영상 분석 프론트엔드 모듈

#### 3.1 모듈 이름
**AIVideoAnalysisFrontendModule**

#### 3.2 모듈 형
**UI 모듈**

#### 3.3 인터페이스
```typescript
interface AIVideoAnalysisFrontend {
  // YouTube 분석
  youtube: {
    analyzeVideo(url: string): Promise<AnalysisResult>;
    getAnalysisStatus(jobId: string): Promise<AnalysisStatus>;
    getAnalysisResult(jobId: string): Promise<RecipeData>;
  };
  
  // 분석 결과
  results: {
    previewRecipe(data: RecipeData): Promise<void>;
    saveRecipe(data: RecipeData): Promise<Recipe>;
    editRecipe(data: RecipeData): Promise<Recipe>;
  };
}
```

#### 3.4 오류 메시지
```typescript
const AI_FRONTEND_ERRORS = {
  INVALID_YOUTUBE_URL: "올바르지 않은 YouTube URL입니다.",
  VIDEO_NOT_FOUND: "영상을 찾을 수 없습니다.",
  ANALYSIS_FAILED: "영상 분석에 실패했습니다.",
  PROCESSING_TIMEOUT: "분석 처리 시간이 초과되었습니다.",
  AI_SERVICE_ERROR: "AI 서비스 오류가 발생했습니다.",
  INSUFFICIENT_QUOTA: "AI 서비스 사용량을 초과했습니다.",
  INVALID_VIDEO_FORMAT: "지원하지 않는 영상 형식입니다.",
  EXTRACTION_FAILED: "영상에서 정보 추출에 실패했습니다."
};
```

#### 3.5 사용하는 파일
```
CookitMobile/
├── screens/AIAnalyze.js
└── components/VideoAnalyzer.js
```

#### 3.6 호출하는 모듈
- **AI 영상 분석 백엔드 모듈** (API 통신)

---

### 6. 검색, 추천 프론트엔드 모듈

#### 3.1 모듈 이름
**SearchRecommendationFrontendModule**

#### 3.2 모듈 형
**UI 모듈**

#### 3.3 인터페이스
```typescript
interface SearchRecommendationFrontend {
  // 검색 기능
  search: {
    searchRecipes(query: string, filters: SearchFilters): Promise<Recipe[]>;
    searchPosts(query: string): Promise<Post[]>;
    getSearchHistory(): Promise<SearchHistory[]>;
    clearSearchHistory(): Promise<void>;
  };
  
  // 추천 기능
  recommendation: {
    getRecommendedRecipes(): Promise<Recipe[]>;
    getHotRecipes(): Promise<Recipe[]>;
    getPersonalizedRecipes(): Promise<Recipe[]>;
    getSimilarRecipes(recipeId: string): Promise<Recipe[]>;
  };
  
  // 필터링
  filtering: {
    filterByCategory(category: string): Promise<Recipe[]>;
    filterByDifficulty(difficulty: string): Promise<Recipe[]>;
    filterByTime(maxTime: number): Promise<Recipe[]>;
    filterByIngredients(ingredients: string[]): Promise<Recipe[]>;
  };
}
```

#### 3.4 오류 메시지
```typescript
const SEARCH_FRONTEND_ERRORS = {
  SEARCH_FAILED: "검색에 실패했습니다.",
  INVALID_SEARCH_QUERY: "검색어가 올바르지 않습니다.",
  NO_RESULTS_FOUND: "검색 결과가 없습니다.",
  RECOMMENDATION_FAILED: "추천 데이터를 가져올 수 없습니다.",
  FILTER_FAILED: "필터링에 실패했습니다.",
  SEARCH_HISTORY_FAILED: "검색 기록 처리에 실패했습니다.",
  INVALID_FILTER_PARAMS: "필터 조건이 올바르지 않습니다.",
  PERSONALIZATION_FAILED: "개인화 추천에 실패했습니다."
};
```

#### 3.5 사용하는 파일
```
CookitMobile/
├── screens/Search/SearchMain.js
├── screens/Search/SearchList.js
├── screens/Search/SearchSummary.js
├── screens/Search/SearchStack.js
├── components/SearchInput.js
└── components/Sort.js
```

#### 3.6 호출하는 모듈
- **검색, 추천 백엔드 모듈** (API 통신)
- **Database Module** (직접 Supabase 연동)

---

## 🖥️ 백엔드 모듈 (6개)

### 1. 사용자 관리 백엔드 모듈

#### 3.1 모듈 이름
**UserManagementBackendModule**

#### 3.2 모듈 형
**기능 모듈**

#### 3.3 인터페이스
```typescript
interface UserManagementBackend {
  // API 엔드포인트
  auth: {
    '/api/auth/login': 'POST';
    '/api/auth/logout': 'POST';
    '/api/auth/verify': 'GET';
  };
  
  // 사용자 관리
  users: {
    '/api/users/profile': 'GET|PUT';
    '/api/users/setup': 'POST';
    '/api/users/preferences': 'GET|PUT';
  };
  
  // 비즈니스 로직
  business: {
    validateUser(userId: string): Promise<boolean>;
    updateUserProfile(userId: string, data: ProfileData): Promise<void>;
    checkSetupComplete(userId: string): Promise<boolean>;
  };
}
```

#### 3.4 오류 메시지
```typescript
const USER_BACKEND_ERRORS = {
  AUTHENTICATION_ERROR: "인증에 실패했습니다.",
  AUTHORIZATION_ERROR: "권한이 없습니다.",
  USER_NOT_FOUND: "사용자를 찾을 수 없습니다.",
  PROFILE_UPDATE_ERROR: "프로필 업데이트에 실패했습니다.",
  SETUP_VALIDATION_ERROR: "초기 설정 검증에 실패했습니다.",
  DATABASE_ERROR: "데이터베이스 오류가 발생했습니다.",
  VALIDATION_ERROR: "입력 데이터가 올바르지 않습니다."
};
```

#### 3.5 사용하는 파일
```
Server/
├── routes/auth.js
├── routes/users.js
└── services/supabaseService.js
```

#### 3.6 호출하는 모듈
- **Database Module** (사용자 데이터 저장/조회)
- **File Storage Module** (프로필 이미지 저장)
- **Google OAuth Service** (외부 인증)

---

### 2. 레시피 관리 백엔드 모듈

#### 3.1 모듈 이름
**RecipeManagementBackendModule**

#### 3.2 모듈 형
**기능 모듈**

#### 3.3 인터페이스
```typescript
interface RecipeManagementBackend {
  // API 엔드포인트
  recipes: {
    '/api/recipes': 'GET|POST';
    '/api/recipes/:id': 'GET|PUT|DELETE';
    '/api/user-recipes/my': 'GET';
    '/api/user-recipes/save': 'POST';
    '/api/user-recipes/favorite': 'POST';
  };
  
  // 비즈니스 로직
  business: {
    validateRecipe(recipeData: RecipeData): Promise<boolean>;
    updateRecipeStats(recipeId: string, action: string): Promise<void>;
    checkUserPermission(userId: string, recipeId: string): Promise<boolean>;
  };
}
```

#### 3.4 오류 메시지
```typescript
const RECIPE_BACKEND_ERRORS = {
  RECIPE_NOT_FOUND: "레시피를 찾을 수 없습니다.",
  RECIPE_CREATION_ERROR: "레시피 생성에 실패했습니다.",
  RECIPE_UPDATE_ERROR: "레시피 수정에 실패했습니다.",
  RECIPE_DELETE_ERROR: "레시피 삭제에 실패했습니다.",
  PERMISSION_DENIED: "레시피에 접근할 권한이 없습니다.",
  INVALID_RECIPE_DATA: "레시피 데이터가 올바르지 않습니다.",
  STATS_UPDATE_ERROR: "레시피 통계 업데이트에 실패했습니다."
};
```

#### 3.5 사용하는 파일
```
Server/
├── routes/recipes.js
├── routes/userRecipes.js
└── services/recipeService.js
```

#### 3.6 호출하는 모듈
- **Database Module** (레시피 데이터 저장/조회)
- **File Storage Module** (레시피 이미지 저장)
- **AI 영상 분석 백엔드 모듈** (AI 생성 레시피)

---

### 3. 냉장고 관리 백엔드 모듈

#### 3.1 모듈 이름
**RefrigeratorManagementBackendModule**

#### 3.2 모듈 형
**기능 모듈**

#### 3.3 인터페이스
```typescript
interface RefrigeratorManagementBackend {
  // API 엔드포인트
  ingredients: {
    '/api/ingredients': 'GET|POST';
    '/api/ingredients/:id': 'PUT|DELETE';
    '/api/ingredients/expiring': 'GET';
  };
  
  // OCR 처리
  ocr: {
    '/api/ocr/receipt': 'POST';
    '/api/ocr/process': 'POST';
  };
  
  // 비즈니스 로직
  business: {
    processReceiptImage(image: File): Promise<ReceiptData>;
    validateIngredient(ingredient: Ingredient): Promise<boolean>;
    checkExpiryAlerts(userId: string): Promise<Ingredient[]>;
  };
}
```

#### 3.4 오류 메시지
```typescript
const REFRIGERATOR_BACKEND_ERRORS = {
  INGREDIENT_NOT_FOUND: "재료를 찾을 수 없습니다.",
  INGREDIENT_CREATION_ERROR: "재료 추가에 실패했습니다.",
  INGREDIENT_UPDATE_ERROR: "재료 수정에 실패했습니다.",
  INGREDIENT_DELETE_ERROR: "재료 삭제에 실패했습니다.",
  OCR_PROCESSING_ERROR: "OCR 처리에 실패했습니다.",
  INVALID_IMAGE_FORMAT: "지원하지 않는 이미지 형식입니다.",
  EXPIRY_VALIDATION_ERROR: "유통기한 검증에 실패했습니다."
};
```

#### 3.5 사용하는 파일
```
Server/
├── services/ocrService.js
├── services/ocrHandler.js
└── routes/ingredients.js
```

#### 3.6 호출하는 모듈
- **Database Module** (재료 데이터 저장/조회)
- **AI 영상 분석 백엔드 모듈** (OCR 처리)
- **File Storage Module** (영수증 이미지 저장)

---

### 4. 커뮤니티 관리 백엔드 모듈

#### 3.1 모듈 이름
**CommunityManagementBackendModule**

#### 3.2 모듈 형
**기능 모듈**

#### 3.3 인터페이스
```typescript
interface CommunityManagementBackend {
  // API 엔드포인트
  posts: {
    '/api/posts': 'GET|POST';
    '/api/posts/:id': 'GET|PUT|DELETE';
    '/api/posts/:id/like': 'POST|DELETE';
    '/api/posts/:id/comments': 'GET|POST';
  };
  
  // 비즈니스 로직
  business: {
    validatePost(postData: PostData): Promise<boolean>;
    updatePostStats(postId: string, action: string): Promise<void>;
    checkUserPermission(userId: string, postId: string): Promise<boolean>;
    moderateContent(content: string): Promise<boolean>;
  };
}
```

#### 3.4 오류 메시지
```typescript
const COMMUNITY_BACKEND_ERRORS = {
  POST_NOT_FOUND: "게시글을 찾을 수 없습니다.",
  POST_CREATION_ERROR: "게시글 작성에 실패했습니다.",
  POST_UPDATE_ERROR: "게시글 수정에 실패했습니다.",
  POST_DELETE_ERROR: "게시글 삭제에 실패했습니다.",
  LIKE_PROCESSING_ERROR: "좋아요 처리에 실패했습니다.",
  COMMENT_PROCESSING_ERROR: "댓글 처리에 실패했습니다.",
  CONTENT_MODERATION_ERROR: "콘텐츠 검토에 실패했습니다.",
  PERMISSION_DENIED: "게시글에 접근할 권한이 없습니다."
};
```

#### 3.5 사용하는 파일
```
Server/
├── routes/posts.js
├── routes/comments.js
└── routes/likes.js
```

#### 3.6 호출하는 모듈
- **Database Module** (게시글 데이터 저장/조회)
- **File Storage Module** (게시글 이미지 저장)
- **사용자 관리 백엔드 모듈** (작성자 정보)

---

### 5. AI 영상 분석 백엔드 모듈

#### 3.1 모듈 이름
**AIVideoAnalysisBackendModule**

#### 3.2 모듈 형
**기능 모듈**

#### 3.3 인터페이스
```typescript
interface AIVideoAnalysisBackend {
  // AI 파이프라인
  pipeline: {
    '/api/ai/analyze-youtube': 'POST';
    '/api/ai/status/:jobId': 'GET';
    '/api/ai/result/:jobId': 'GET';
  };
  
  // 외부 AI 서비스
  services: {
    youtubeProcessor: YouTubeProcessor;
    tesseractOCR: TesseractOCR;
    whisperSTT: WhisperSTT;
    geminiAI: GeminiAI;
  };
  
  // 비즈니스 로직
  business: {
    processYouTubeVideo(url: string): Promise<AnalysisJob>;
    extractVideoFrames(videoUrl: string): Promise<Frame[]>;
    analyzeWithAI(content: string): Promise<RecipeData>;
    validateAnalysisResult(result: RecipeData): Promise<boolean>;
  };
}
```

#### 3.4 오류 메시지
```typescript
const AI_BACKEND_ERRORS = {
  INVALID_YOUTUBE_URL: "올바르지 않은 YouTube URL입니다.",
  VIDEO_NOT_FOUND: "영상을 찾을 수 없습니다.",
  ANALYSIS_FAILED: "영상 분석에 실패했습니다.",
  PROCESSING_TIMEOUT: "분석 처리 시간이 초과되었습니다.",
  AI_SERVICE_ERROR: "AI 서비스 오류가 발생했습니다.",
  INSUFFICIENT_QUOTA: "AI 서비스 사용량을 초과했습니다.",
  INVALID_VIDEO_FORMAT: "지원하지 않는 영상 형식입니다.",
  EXTRACTION_FAILED: "영상에서 정보 추출에 실패했습니다."
};
```

#### 3.5 사용하는 파일
```
Server/
├── routes/ai.js
├── services/aiPipelineService.js
├── services/geminiService.js
├── services/ocrService.js
├── scripts/whisper_processor.py
└── services/combined_sub/ (프레임 데이터)
```

#### 3.6 호출하는 모듈
- **외부 AI 서비스** (Gemini, Tesseract, Whisper)
- **Database Module** (분석 결과 저장)
- **File Storage Module** (프레임 이미지 저장)
- **레시피 관리 백엔드 모듈** (생성된 레시피 저장)

---

### 6. 검색, 추천 백엔드 모듈

#### 3.1 모듈 이름
**SearchRecommendationBackendModule**

#### 3.2 모듈 형
**기능 모듈**

#### 3.3 인터페이스
```typescript
interface SearchRecommendationBackend {
  // API 엔드포인트
  search: {
    '/api/search/recipes': 'GET';
    '/api/search/posts': 'GET';
    '/api/search/history': 'GET|DELETE';
  };
  
  // 추천 엔드포인트
  recommendation: {
    '/api/recommendations/personal': 'GET';
    '/api/recommendations/hot': 'GET';
    '/api/recommendations/similar/:id': 'GET';
  };
  
  // 비즈니스 로직
  business: {
    searchRecipes(query: string, filters: SearchFilters): Promise<Recipe[]>;
    generatePersonalizedRecommendations(userId: string): Promise<Recipe[]>;
    calculateRecipeSimilarity(recipeId: string): Promise<Recipe[]>;
    updateSearchHistory(userId: string, query: string): Promise<void>;
  };
}
```

#### 3.4 오류 메시지
```typescript
const SEARCH_BACKEND_ERRORS = {
  SEARCH_FAILED: "검색에 실패했습니다.",
  INVALID_SEARCH_QUERY: "검색어가 올바르지 않습니다.",
  NO_RESULTS_FOUND: "검색 결과가 없습니다.",
  RECOMMENDATION_FAILED: "추천 데이터를 가져올 수 없습니다.",
  FILTER_FAILED: "필터링에 실패했습니다.",
  SEARCH_HISTORY_FAILED: "검색 기록 처리에 실패했습니다.",
  INVALID_FILTER_PARAMS: "필터 조건이 올바르지 않습니다.",
  PERSONALIZATION_FAILED: "개인화 추천에 실패했습니다."
};
```

#### 3.5 사용하는 파일
```
Server/
├── routes/search.js
├── routes/recommendations.js
└── services/searchService.js
```

#### 3.6 호출하는 모듈
- **Database Module** (검색 데이터 조회)
- **레시피 관리 백엔드 모듈** (레시피 데이터)
- **커뮤니티 관리 백엔드 모듈** (게시글 데이터)
- **사용자 관리 백엔드 모듈** (개인화 추천)

---

## 📊 모듈 간 관계도

```
┌─────────────────────────────────────────────────────────────┐
│                    Cookit 시스템                            │
├─────────────────────────────────────────────────────────────┤
│  📱 프론트엔드 (6개 모듈)                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  사용자관리 프론트 ↔ 사용자관리 백엔드                  │ │
│  │  레시피 프론트 ↔ 레시피 백엔드                          │ │
│  │  냉장고 프론트 ↔ 냉장고 백엔드                          │ │
│  │  커뮤니티 프론트 ↔ 커뮤니티 백엔드                      │ │
│  │  AI 분석 프론트 ↔ AI 분석 백엔드                        │ │
│  │  검색추천 프론트 ↔ 검색추천 백엔드                      │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  🖥️ 백엔드 (6개 모듈)                                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  모든 백엔드 모듈 ↔ Database Module                     │ │
│  │  AI 분석 백엔드 ↔ 외부 AI 서비스                        │ │
│  │  냉장고 백엔드 ↔ OCR 서비스                             │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 요약

- **총 모듈 수**: 12개 (프론트엔드 6개 + 백엔드 6개)
- **기능별 분류**: 6개 기능 × 2개 타입 (프론트/백엔드)
- **모듈 간 통신**: REST API + Supabase 직접 연동
- **외부 의존성**: Google OAuth, AI 서비스, Database
