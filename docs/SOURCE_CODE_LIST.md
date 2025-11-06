# 프로그램 코드 구성 (소스 코드 목록)

## 📋 목차
1. [프론트엔드 (CookitMobile)](#프론트엔드-cookitmobile)
2. [백엔드 (Server)](#백엔드-server)
3. [설정 파일](#설정-파일)

---

## 프론트엔드 (CookitMobile)

### 핵심 진입점

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `App.js` | `CookitMobile/App.js` | 앱의 최상위 진입점. AuthProvider, AnalysisProvider 설정 및 전역 알림 처리 | 프로젝트 팀 |
| `app.config.js` | `CookitMobile/app.config.js` | Expo 앱 설정 파일. 앱 이름, 패키지명, 권한, 플러그인 설정 | 프로젝트 팀 |
| `babel.config.js` | `CookitMobile/babel.config.js` | Babel 설정 파일. 모듈 경로 별칭(@features, @shared, @assets) 설정 | 프로젝트 팀 |
| `tsconfig.json` | `CookitMobile/tsconfig.json` | TypeScript 설정 파일. 경로 매핑 및 컴파일 옵션 | 프로젝트 팀 |

---

### Auth 모듈 (인증)

#### 컴포넌트

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `AuthNavigator.js` | `features/auth/components/AuthNavigator.js` | 인증 상태에 따른 네비게이션 분기 처리. 모든 앱 화면 등록 및 라우팅 관리 | 프로젝트 팀 |
| `AuthScreen.tsx` | `features/auth/components/AuthScreen.tsx` | Google 로그인 메인 화면. 핵심 기능 소개 및 로그인 버튼 표시 | 프로젝트 팀 |
| `GoogleSignInButton.tsx` | `features/auth/components/GoogleSignInButton.tsx` | Google OAuth 로그인 버튼 컴포넌트 | 프로젝트 팀 |

#### Context

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `AuthContext.tsx` | `features/auth/contexts/AuthContext.tsx` | 인증 상태 관리 Context. 사용자 세션, 로그인/로그아웃, 토큰 관리 | 프로젝트 팀 |

#### Export

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `index.ts` | `features/auth/index.ts` | Auth 모듈 통합 export | 프로젝트 팀 |

---

### Recipe 모듈 (레시피)

#### 컴포넌트

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `RecipeCard.js` | `features/recipe/components/RecipeCard.js` | 레시피 카드 컴포넌트. 레시피 정보 표시 및 좋아요 기능 | 프로젝트 팀 |
| `YouTubePlayer.js` | `features/recipe/components/YouTubePlayer.js` | YouTube 영상 플레이어 컴포넌트. 구간 반복 기능 포함 | 프로젝트 팀 |
| `YouTubeAnalysisModal.js` | `features/recipe/components/YouTubeAnalysisModal.js` | YouTube 영상 분석 모달. 분석 진행 상태 표시 | 프로젝트 팀 |
| `RecipeSelectModal.tsx` | `features/recipe/components/RecipeSelectModal.tsx` | 레시피 선택 모달 컴포넌트 (커뮤니티 게시글 작성 시 사용) | 프로젝트 팀 |

#### Context

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `AnalysisContext.tsx` | `features/recipe/contexts/AnalysisContext.tsx` | AI 분석 상태 관리 Context. 분석 진행 상태 및 결과 관리 | 프로젝트 팀 |

#### 화면 (Screens)

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `HomeMain.js` | `features/recipe/screens/HomeMain.js` | 홈 화면. 개인화 추천, 난이도별 추천, 인기 레시피, 유사 레시피 표시 | 프로젝트 팀 |
| `Summary.js` | `features/recipe/screens/Summary.js` | 레시피 요약 화면. 레시피 기본 정보 및 조리 단계 미리보기 | 프로젝트 팀 |
| `RecipeList.js` | `features/recipe/screens/RecipeList.js` | 레시피 목록 화면. 카테고리별 레시피 필터링 및 표시 | 프로젝트 팀 |
| `AIAnalyze.js` | `features/recipe/screens/AIAnalyze.js` | AI 영상 분석 화면. YouTube URL 입력 및 분석 요청 | 프로젝트 팀 |
| `AnalysisHistory.tsx` | `features/recipe/screens/AnalysisHistory.tsx` | AI 분석 이력 화면. 분석 완료된 레시피 목록 | 프로젝트 팀 |

#### Recipe 하위 화면

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `RecipeStack.js` | `features/recipe/screens/Recipe/RecipeStack.js` | 레시피 네비게이션 스택 (RecipeMain, RecipeRating, RecipeRecord) | 프로젝트 팀 |
| `RecipeMain.js` | `features/recipe/screens/Recipe/RecipeMain.js` | 레시피 상세 화면. 단계별 조리 가이드, YouTube 플레이어, 음성 제어 기능 | 프로젝트 팀 |
| `RecipeRating.js` | `features/recipe/screens/Recipe/RecipeRating.js` | 레시피 평가 화면. 완성한 요리 평가 및 사진 업로드 | 프로젝트 팀 |
| `RecipeRecord.js` | `features/recipe/screens/Recipe/RecipeRecord.js` | 레시피 기록 화면. 요리 완료 기록 및 통계 | 프로젝트 팀 |
| `RecipeSummaryModal.js` | `features/recipe/screens/Recipe/RecipeSummaryModal.js` | 레시피 요약 모달. 조리 단계 요약 표시 | 프로젝트 팀 |
| `RecipeCancelModal.js` | `features/recipe/screens/Recipe/RecipeCancelModal.js` | 레시피 취소 모달. 조리 중단 확인 | 프로젝트 팀 |

#### Search 하위 화면

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `SearchStack.js` | `features/recipe/screens/Search/SearchStack.js` | 검색 네비게이션 스택 (SearchMain, SearchList, SearchSummary) | 프로젝트 팀 |
| `SearchMain.js` | `features/recipe/screens/Search/SearchMain.js` | 검색 메인 화면. 검색어 입력 및 필터 설정 | 프로젝트 팀 |
| `SearchList.js` | `features/recipe/screens/Search/SearchList.js` | 검색 결과 목록 화면. 검색 결과 표시 및 필터링 | 프로젝트 팀 |
| `SearchSummary.js` | `features/recipe/screens/Search/SearchSummary.js` | 검색 결과 상세 화면. 선택한 레시피 상세 정보 | 프로젝트 팀 |

#### 서비스 (Services)

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `recipeService.js` | `features/recipe/services/recipeService.js` | 레시피 API 서비스. 레시피 조회, 검색, 통계 업데이트 | 프로젝트 팀 |
| `recipeLikesApi.ts` | `features/recipe/services/recipeLikesApi.ts` | 레시피 좋아요 API. 좋아요 추가/삭제, 좋아요 상태 조회 | 프로젝트 팀 |

#### Export

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `index.ts` | `features/recipe/index.ts` | Recipe 모듈 통합 export | 프로젝트 팀 |

---

### Profile 모듈 (프로필)

#### 화면 (Screens)

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `ProfileMain.js` | `features/profile/screens/Profile/ProfileMain.js` | 프로필 메인 화면. 사용자 정보, 통계, 메뉴 카드 | 프로젝트 팀 |
| `ProfileEdit.js` | `features/profile/screens/Profile/ProfileEdit.js` | 프로필 수정 화면. 닉네임, 프로필 사진, 요리 레벨 수정 | 프로젝트 팀 |
| `ProfileAlarm.js` | `features/profile/screens/Profile/ProfileAlarm.js` | 알림 설정 화면. 푸시 알림 설정 관리 | 프로젝트 팀 |
| `ProfileHistory.js` | `features/profile/screens/Profile/ProfileHistory.js` | 최근 본 레시피 화면. 조회한 레시피 목록 | 프로젝트 팀 |
| `ProfileLikes.js` | `features/profile/screens/Profile/ProfileLikes.js` | 좋아요한 레시피 화면. 좋아요한 레시피 목록 | 프로젝트 팀 |
| `ProfileRecentViewed.js` | `features/profile/screens/Profile/ProfileRecentViewed.js` | 최근 조회한 레시피 화면 | 프로젝트 팀 |
| `ProfileWeekRecipes.js` | `features/profile/screens/Profile/ProfileWeekRecipes.js` | 주간 레시피 화면. 이번 주 요리한 레시피 통계 | 프로젝트 팀 |
| `SettingsStack.js` | `features/profile/screens/Profile/SettingsStack.js` | 설정 스택. 알림 설정 등 앱 설정 관리 | 프로젝트 팀 |
| `ProfileSettingModal.js` | `features/profile/screens/Profile/ProfileSettingModal.js` | 프로필 설정 모달 | 프로젝트 팀 |
| `ProfileLogoutModal.js` | `features/profile/screens/Profile/ProfileLogoutModal.js` | 로그아웃 확인 모달 | 프로젝트 팀 |

#### Setup 화면

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `SetupNickname.js` | `features/profile/screens/SetupNickname.js` | 초기 설정: 닉네임 입력 화면 | 프로젝트 팀 |
| `SetupProfile.js` | `features/profile/screens/SetupProfile.js` | 초기 설정: 프로필 정보 입력 화면 | 프로젝트 팀 |
| `SetupPreference.js` | `features/profile/screens/SetupPreference.js` | 초기 설정: 선호 요리 선택 화면 | 프로젝트 팀 |
| `SetupPreferenceModal.js` | `features/profile/screens/SetupPreferenceModal.js` | 선호 요리 선택 모달 | 프로젝트 팀 |

#### 서비스 (Services)

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `userApi.ts` | `features/profile/services/userApi.ts` | 사용자 API 서비스. 프로필 조회/수정, 통계 조회 | 프로젝트 팀 |

#### Export

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `index.ts` | `features/profile/index.ts` | Profile 모듈 통합 export | 프로젝트 팀 |

---

### Community 모듈 (커뮤니티)

#### 화면 (Screens)

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `CommunityStack.tsx` | `features/community/screens/community/CommunityStack.tsx` | 커뮤니티 네비게이션 스택 (CommunityMain, CommunityCreate, CommunityDetail) | 프로젝트 팀 |
| `CommunityMain.tsx` | `features/community/screens/community/CommunityMain.tsx` | 커뮤니티 메인 화면. 게시글 목록 표시 | 프로젝트 팀 |
| `CommunityCreate.tsx` | `features/community/screens/community/CommunityCreate.tsx` | 게시글 작성 화면. 레시피 연결 필수, 이미지 업로드 | 프로젝트 팀 |
| `CommunityDetail.tsx` | `features/community/screens/community/CommunityDetail.tsx` | 게시글 상세 화면. 게시글 내용, 댓글, 좋아요 기능 | 프로젝트 팀 |

#### 서비스 (Services)

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `postsApi.ts` | `features/community/services/postsApi.ts` | 게시글 API 서비스. 게시글 CRUD, 목록 조회 | 프로젝트 팀 |
| `postLikesApi.ts` | `features/community/services/postLikesApi.ts` | 게시글 좋아요 API. 좋아요 추가/삭제 | 프로젝트 팀 |
| `commentsApi.ts` | `features/community/services/commentsApi.ts` | 댓글 API 서비스. 댓글 CRUD | 프로젝트 팀 |

#### Export

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `index.ts` | `features/community/index.ts` | Community 모듈 통합 export | 프로젝트 팀 |

---

### Refrigerator 모듈 (냉장고)

#### 화면 (Screens)

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `Ingredients.js` | `features/refrigerator/screens/Ingredients.js` | 냉장고 재료 목록 화면. 3열 그리드 레이아웃, 재료 관리 | 프로젝트 팀 |
| `SetupIngredients.js` | `features/refrigerator/screens/SetupIngredients.js` | 초기 설정: 재료 입력 화면 | 프로젝트 팀 |
| `SetupIngredientsModal.js` | `features/refrigerator/screens/SetupIngredientsModal.js` | 재료 설정 모달 | 프로젝트 팀 |
| `ReceiptStack.js` | `features/refrigerator/screens/Receipt/ReceiptStack.js` | 영수증 네비게이션 스택 (ReceiptMain) | 프로젝트 팀 |
| `ReceiptMain.js` | `features/refrigerator/screens/Receipt/ReceiptMain.js` | 영수증 OCR 인식 화면. 카메라/갤러리에서 영수증 이미지 선택 및 OCR 처리 | 프로젝트 팀 |

#### 서비스 (Services)

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `receiptItemsApi.ts` | `features/refrigerator/services/receiptItemsApi.ts` | 영수증 재료 API 서비스. OCR 결과 처리 및 재료 추가 | 프로젝트 팀 |

#### Export

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `index.ts` | `features/refrigerator/index.ts` | Refrigerator 모듈 통합 export | 프로젝트 팀 |

---

### Navigation 모듈 (네비게이션)

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `HomeTab.tsx` | `features/navigation/HomeTab.tsx` | 하단 탭 네비게이터. 홈, 냉장고, 커뮤니티, 프로필 탭 구성 | 프로젝트 팀 |
| `index.ts` | `features/navigation/index.ts` | Navigation 모듈 통합 export | 프로젝트 팀 |

---

### Shared 모듈 (공통)

#### 컴포넌트

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `AnalysisFloatingBar.tsx` | `shared/components/AnalysisFloatingBar.tsx` | AI 분석 플로팅 바. 전역 분석 진행 상태 표시 | 프로젝트 팀 |
| `SearchInput.js` | `shared/components/SearchInput.js` | 검색 입력 컴포넌트. 공통 검색 입력 UI | 프로젝트 팀 |
| `Sort.js` | `shared/components/Sort.js` | 정렬 컴포넌트. 목록 정렬 옵션 UI | 프로젝트 팀 |
| `WheelDatePicker.js` | `shared/components/WheelDatePicker.js` | 날짜 선택 휠 컴포넌트. 유통기한 선택 등 | 프로젝트 팀 |

#### 라이브러리

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `supabase.ts` | `shared/lib/supabase.ts` | Supabase 클라이언트 설정. 데이터베이스 연결 및 인증 | 프로젝트 팀 |

#### 서비스

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `notificationService.js` | `shared/services/notificationService.js` | 알림 서비스. 푸시 알림 권한 요청, 토큰 관리, 알림 리스너 | 프로젝트 팀 |

#### 타입 정의

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `auth.ts` | `shared/types/auth.ts` | 인증 관련 TypeScript 타입 정의 | 프로젝트 팀 |
| `env.d.ts` | `shared/types/env.d.ts` | 환경 변수 TypeScript 타입 정의 | 프로젝트 팀 |

---

## 백엔드 (Server)

### 핵심 진입점

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `app.js` | `Server/app.js` | Express 서버 진입점. 미들웨어 설정, 라우터 등록, 서버 시작 | 프로젝트 팀 |

---

### 라우터 (Routes)

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `ai.js` | `Server/routes/ai.js` | AI 분석 API 라우터. YouTube 영상 분석 요청, 분석 상태 조회 | 프로젝트 팀 |
| `auth.js` | `Server/routes/auth.js` | 인증 API 라우터. 사용자 인증 관련 엔드포인트 | 프로젝트 팀 |
| `recipes.js` | `Server/routes/recipes.js` | 레시피 API 라우터. 레시피 CRUD, 조회수 업데이트, AI 분석 결과 저장 | 프로젝트 팀 |
| `recommendations.js` | `Server/routes/recommendations.js` | 추천 시스템 API 라우터. 개인화 추천, 난이도별 추천, 인기 레시피, 유사 레시피 | 프로젝트 팀 |
| `recipeLikes.js` | `Server/routes/recipeLikes.js` | 레시피 좋아요 API 라우터. 좋아요 추가/삭제, 좋아요 수 업데이트 | 프로젝트 팀 |
| `recipeCategories.js` | `Server/routes/recipeCategories.js` | 레시피 카테고리 API 라우터. 카테고리 목록 조회 | 프로젝트 팀 |
| `userPosts.js` | `Server/routes/userPosts.js` | 커뮤니티 게시글 API 라우터. 게시글 CRUD | 프로젝트 팀 |
| `comments.js` | `Server/routes/comments.js` | 댓글 API 라우터. 댓글 CRUD | 프로젝트 팀 |
| `postLikes.js` | `Server/routes/postLikes.js` | 게시글 좋아요 API 라우터. 게시글 좋아요 추가/삭제 | 프로젝트 팀 |
| `users.js` | `Server/routes/users.js` | 사용자 API 라우터. 사용자 프로필 조회/수정, 통계 조회 | 프로젝트 팀 |
| `userRecipes.js` | `Server/routes/userRecipes.js` | 사용자 레시피 API 라우터. 사용자가 완성한 레시피 조회 | 프로젝트 팀 |
| `receiptItems.js` | `Server/routes/receiptItems.js` | 냉장고 재료 API 라우터. 재료 CRUD | 프로젝트 팀 |
| `receiptList.js` | `Server/routes/receiptList.js` | 영수증 목록 API 라우터. 영수증 목록 조회 | 프로젝트 팀 |
| `receiptOcr.js` | `Server/routes/receiptOcr.js` | 영수증 OCR API 라우터. 영수증 이미지 OCR 처리 | 프로젝트 팀 |
| `youtube.js` | `Server/routes/youtube.js` | YouTube API 라우터. YouTube 영상 검색, 인기 영상 조회 | 프로젝트 팀 |

---

### 서비스 (Services)

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `aiPipelineService.js` | `Server/services/aiPipelineService.js` | AI 분석 파이프라인 서비스. YouTube 영상 다운로드, OCR/Whisper/자막 추출, 텍스트 통합 | 프로젝트 팀 |
| `geminiService.js` | `Server/services/geminiService.js` | Gemini AI 서비스. 레시피 생성 프롬프트 생성, JSON 파싱, 레시피 구조화 | 프로젝트 팀 |
| `ocrHandler.js` | `Server/services/ocrHandler.js` | OCR 처리 서비스. Tesseract.js를 사용한 영상 프레임 OCR 처리 | 프로젝트 팀 |
| `supabaseClient.js` | `Server/services/supabaseClient.js` | Supabase 클라이언트 설정. 서버용 Supabase 연결 | 프로젝트 팀 |
| `supabaseService.js` | `Server/services/supabaseService.js` | Supabase 서비스 레이어. 레시피 저장, 조회 등 데이터베이스 작업 | 프로젝트 팀 |

---

### 유틸리티 스크립트

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `run_full_pipeline.cjs` | `Server/run_full_pipeline.cjs` | 전체 AI 분석 파이프라인 실행 스크립트 | 프로젝트 팀 |
| `upload_to_supabase.cjs` | `Server/upload_to_supabase.cjs` | Gemini 분석 결과를 Supabase에 업로드하는 스크립트 | 프로젝트 팀 |
| `generate_combined_text.cjs` | `Server/generate_combined_text.cjs` | 텍스트 통합 스크립트 (OCR, Whisper, 자막) | 프로젝트 팀 |
| `generate_prompt.cjs` | `Server/generate_prompt.cjs` | Gemini 프롬프트 생성 스크립트 | 프로젝트 팀 |
| `generate_parsed_output.cjs` | `Server/generate_parsed_output.cjs` | Gemini 응답 파싱 스크립트 | 프로젝트 팀 |
| `send_to_gemini.cjs` | `Server/send_to_gemini.cjs` | Gemini API 호출 스크립트 | 프로젝트 팀 |
| `ocr_analyze.cjs` | `Server/ocr_analyze.cjs` | OCR 분석 스크립트 | 프로젝트 팀 |
| `test_whisper.py` | `Server/test_whisper.py` | Whisper 음성 인식 테스트 스크립트 | 프로젝트 팀 |

---

## 설정 파일

### 프론트엔드 설정

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `package.json` | `CookitMobile/package.json` | Node.js 패키지 의존성 및 스크립트 정의 | 프로젝트 팀 |
| `eas.json` | `CookitMobile/eas.json` | Expo Application Services 빌드 설정 | 프로젝트 팀 |
| `.env` | `CookitMobile/.env` | 환경 변수 설정 (Supabase URL, API 키 등) | 프로젝트 팀 |

### 백엔드 설정

| 파일명 | 경로 | 설명 | 작성자 |
|--------|------|------|--------|
| `package.json` | `Server/package.json` | Node.js 패키지 의존성 및 스크립트 정의 | 프로젝트 팀 |
| `nodemon.json` | `Server/nodemon.json` | Nodemon 개발 서버 설정 | 프로젝트 팀 |
| `.env` | `Server/.env` | 환경 변수 설정 (Supabase URL, API 키, 서버 포트 등) | 프로젝트 팀 |

---

## 파일 통계

### 프론트엔드
- **총 파일 수**: 약 70개
- **주요 화면**: 30개
- **컴포넌트**: 10개
- **서비스**: 8개
- **Context**: 2개

### 백엔드
- **총 파일 수**: 약 20개
- **라우터**: 15개
- **서비스**: 5개
- **유틸리티 스크립트**: 7개

---

## 주요 파일 라인 수

| 파일명 | 라인 수 | 설명 |
|--------|---------|------|
| `RecipeMain.js` | 약 1,900줄 | 레시피 상세 화면 (가장 큰 파일) |
| `aiPipelineService.js` | 약 470줄 | AI 분석 파이프라인 서비스 |
| `geminiService.js` | 약 240줄 | Gemini AI 서비스 |
| `HomeMain.js` | 약 470줄 | 홈 화면 |
| `recommendations.js` | 약 510줄 | 추천 시스템 API |
| `AuthContext.tsx` | 약 200줄 | 인증 Context |

---

## 코드 작성 규칙

1. **모듈화**: 기능별로 모듈 분리 (`features/` 디렉토리)
2. **공통 코드**: 재사용 가능한 코드는 `shared/` 디렉토리에 배치
3. **타입 안정성**: TypeScript 사용 파일은 `.ts`, `.tsx` 확장자 사용
4. **경로 별칭**: `@features`, `@shared`, `@assets` 경로 별칭 사용
5. **네이밍**: 
   - 컴포넌트: PascalCase (예: `RecipeCard.js`)
   - 서비스: camelCase (예: `recipeService.js`)
   - 화면: PascalCase (예: `HomeMain.js`)

---

*최종 업데이트: 2024년*

