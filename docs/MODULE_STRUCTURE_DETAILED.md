# 모듈 구조 상세 설명

## 📋 목차
1. [Auth 모듈 (인증)](#1-auth-모듈-인증)
2. [Recipe 모듈 (레시피)](#2-recipe-모듈-레시피) ⚠️ 가장 큰 모듈
3. [Profile 모듈 (프로필)](#3-profile-모듈-프로필)
4. [Community 모듈 (커뮤니티)](#4-community-모듈-커뮤니티)
5. [Refrigerator 모듈 (냉장고)](#5-refrigerator-모듈-냉장고)
6. [Navigation 모듈 (네비게이션)](#6-navigation-모듈-네비게이션)
7. [현재 구조의 문제점 및 개선 방안](#7-현재-구조의-문제점-및-개선-방안)

---

## 1. Auth 모듈 (인증)

### 1.1 역할
- 사용자 인증 및 인가 관리
- Google OAuth 로그인 처리
- 세션 관리 및 토큰 관리
- 인증 상태 제공 (Context API)

### 1.2 파일 구조
```
features/auth/
├── components/
│   ├── AuthNavigator.js      # 인증 상태에 따른 네비게이션 분기
│   ├── AuthScreen.tsx        # Google 로그인 화면
│   └── GoogleSignInButton.tsx # Google 로그인 버튼 컴포넌트
├── contexts/
│   └── AuthContext.tsx        # 인증 상태 관리 Context
└── index.ts                   # 모듈 export
```

### 1.3 주요 기능

#### 1.3.1 Google 로그인
- **파일**: `AuthScreen.tsx`, `GoogleSignInButton.tsx`
- **기능**:
  - `expo-auth-session`을 사용한 Google OAuth
  - Supabase Auth와 통합
  - 로그인 성공 시 세션 저장
- **의존성**:
  - `@supabase/supabase-js`
  - `expo-auth-session`
  - `expo-secure-store` (토큰 저장)

#### 1.3.2 세션 관리
- **파일**: `AuthContext.tsx`
- **기능**:
  - 세션 상태 관리 (`user`, `loading`, `session`)
  - 앱 시작 시 세션 복원
  - 앱 상태 변경 시 세션 갱신
  - Refresh Token 오류 처리
- **제공하는 Hook**: `useAuth()`
  ```typescript
  const { user, loading, signOut, isSetupComplete } = useAuth();
  ```

#### 1.3.3 인증 네비게이션
- **파일**: `AuthNavigator.js`
- **기능**:
  - 로그인 상태에 따른 화면 분기
  - Setup 완료 여부 확인
  - 모든 앱 화면 등록 및 관리
- **의존성**:
  - `@react-navigation/native`
  - `@features/profile` (Setup 화면)
  - `@features/navigation` (HomeTab)

### 1.4 의존성
- **외부 서비스**: Supabase Auth, Google OAuth
- **다른 모듈**: 
  - `@features/profile` (Setup 화면)
  - `@features/navigation` (HomeTab)
- **Shared**: `@shared/lib/supabase`

### 1.5 특징
- ✅ 단일 책임 원칙 준수 (인증만 담당)
- ✅ 재사용 가능한 Context API
- ✅ 타입 안정성 (TypeScript)

---

## 2. Recipe 모듈 (레시피) ⚠️ 가장 큰 모듈

### 2.1 역할
레시피 관련 모든 기능을 담당하는 거대 모듈입니다. 현재 **너무 많은 책임**을 가지고 있어 모듈 분리가 필요합니다.

### 2.2 파일 구조
```
features/recipe/
├── components/
│   ├── RecipeCard.js              # 레시피 카드 컴포넌트
│   ├── RecipeSelectModal.tsx       # 레시피 선택 모달
│   ├── YouTubeAnalysisModal.js    # YouTube 분석 모달
│   └── YouTubePlayer.js            # YouTube 플레이어 컴포넌트
├── contexts/
│   └── AnalysisContext.tsx        # AI 분석 상태 관리
├── screens/
│   ├── HomeMain.js                # 홈 화면 (추천 시스템)
│   ├── Summary.js                 # 레시피 요약 화면
│   ├── RecipeList.js              # 레시피 목록 화면
│   ├── AIAnalyze.js               # AI 영상 분석 화면
│   ├── AnalysisHistory.tsx        # 분석 이력 화면
│   ├── Recipe/
│   │   ├── RecipeStack.js         # 레시피 네비게이션 스택
│   │   ├── RecipeMain.js         # 레시피 상세 + 음성 제어
│   │   ├── RecipeRating.js       # 레시피 평가
│   │   ├── RecipeRecord.js       # 레시피 기록
│   │   ├── RecipeCancelModal.js  # 레시피 취소 모달
│   │   └── RecipeSummaryModal.js # 레시피 요약 모달
│   └── Search/
│       ├── SearchStack.js        # 검색 네비게이션 스택
│       ├── SearchMain.js         # 검색 메인 화면
│       ├── SearchList.js         # 검색 결과 목록
│       └── SearchSummary.js      # 검색 결과 상세
├── services/
│   ├── recipeService.js          # 레시피 API 서비스
│   └── recipeLikesApi.ts         # 레시피 좋아요 API
└── index.ts                      # 모듈 export
```

### 2.3 주요 기능 분류

#### 2.3.1 홈 화면 및 추천 시스템
- **파일**: `HomeMain.js`
- **기능**:
  - 개인화 추천 (`/api/recommendations/user`)
  - 난이도별 추천 (`/api/recommendations/by-difficulty`)
  - 인기 레시피 (`/api/recommendations/popular`)
  - 유사 레시피 추천 (`/api/recommendations/similar-to-cooked`)
  - Pull-to-refresh
  - 조회수 및 좋아요 실시간 업데이트
- **의존성**:
  - `@shared/lib/supabase`
  - `@features/recipe/services/recipeService`
  - `@features/recipe/components/RecipeCard`

#### 2.3.2 레시피 조회 및 조리
- **파일**: `Summary.js`, `RecipeMain.js`, `RecipeStack.js`
- **기능**:
  - 레시피 요약 화면 (Summary)
  - 레시피 상세 화면 (RecipeMain)
  - 단계별 조리 가이드
  - YouTube 영상 재생
  - 음성 제어 (Porcupine + Rhino)
  - 구간 반복 재생
  - 조리 타이머
  - 레시피 평가/기록
- **의존성**:
  - `@features/recipe/components/YouTubePlayer`
  - `@picovoice/porcupine-react-native`
  - `@picovoice/rhino-react-native`
  - `@shared/lib/supabase`

#### 2.3.3 AI 영상 분석
- **파일**: `AIAnalyze.js`, `AnalysisHistory.tsx`, `YouTubeAnalysisModal.js`
- **기능**:
  - YouTube URL 입력 및 분석 요청
  - 분석 상태 확인 (진행 중/완료)
  - 분석 이력 조회
  - 분석 결과 모달 표시
- **의존성**:
  - `@features/recipe/contexts/AnalysisContext`
  - 백엔드 API: `/api/ai/analyze`, `/api/ai/status/:id`
  - `@features/recipe/components/YouTubeAnalysisModal`

#### 2.3.4 검색 기능
- **파일**: `SearchMain.js`, `SearchList.js`, `SearchSummary.js`, `SearchStack.js`
- **기능**:
  - 레시피 검색 (제목, 재료, 태그)
  - 검색 결과 목록
  - 검색 결과 상세 화면
  - 필터링 (카테고리, 난이도)
- **의존성**:
  - `@shared/lib/supabase`
  - `@features/recipe/components/RecipeCard`

#### 2.3.5 YouTube 플레이어
- **파일**: `YouTubePlayer.js`
- **기능**:
  - YouTube 영상 임베드
  - 구간 반복 재생
  - 시작 시간 설정
  - 자동 재생 제어
- **의존성**:
  - `react-native-webview`
  - YouTube iframe API

#### 2.3.6 레시피 목록
- **파일**: `RecipeList.js`
- **기능**:
  - 카테고리별 레시피 목록
  - 레시피 필터링
- **의존성**:
  - `@features/recipe/components/RecipeCard`
  - `@shared/lib/supabase`

### 2.4 의존성
- **외부 서비스**: 
  - Supabase (DB)
  - YouTube Data API
  - Picovoice (음성 인식)
  - 백엔드 API (AI 분석)
- **다른 모듈**: 
  - `@features/profile` (사용자 정보)
  - `@features/community` (레시피 연결)
- **Shared**: 
  - `@shared/lib/supabase`
  - `@shared/components` (공통 컴포넌트)

### 2.5 문제점 ⚠️
1. **너무 많은 책임**
   - 레시피 조회/추천
   - AI 영상 분석
   - 검색
   - 음성 제어
   - YouTube 플레이어
   → 하나의 모듈이 5가지 주요 기능 담당

2. **파일 수가 많음**
   - 총 20개 이상의 파일
   - `screens/` 하위에 3개의 서브 디렉토리

3. **의존성 복잡**
   - 여러 외부 서비스와 연동
   - 다른 모듈과 강한 결합

4. **테스트 어려움**
   - 모듈이 커서 단위 테스트 작성이 어려움
   - 기능 간 의존성이 복잡

### 2.6 개선 방안
- **제안**: `recipe` 모듈을 다음처럼 분리
  - `recipe-core`: 레시피 조회/추천/조회
  - `ai-analysis`: AI 영상 분석
  - `search`: 검색 기능
  - `voice-control`: 음성 제어 (또는 `recipe-core`에 포함)
  - `youtube-player`: YouTube 플레이어 (shared로 이동 가능)

---

## 3. Profile 모듈 (프로필)

### 3.1 역할
- 사용자 프로필 관리
- 사용자 설정 관리
- 초기 설정 (Setup) 프로세스

### 3.2 파일 구조
```
features/profile/
├── components/
│   └── (비어있음 - 향후 추가 가능)
├── screens/
│   ├── Profile/
│   │   ├── ProfileMain.js          # 프로필 메인 화면
│   │   ├── ProfileEdit.js          # 프로필 수정
│   │   ├── ProfileAlarm.js         # 알림 설정
│   │   ├── ProfileHistory.js       # 최근 본 레시피
│   │   ├── ProfileLikes.js         # 좋아요한 레시피
│   │   ├── ProfileRecentViewed.js  # 최근 조회한 레시피
│   │   ├── ProfileWeekRecipes.js   # 주간 레시피
│   │   ├── ProfileSettingModal.js  # 설정 모달
│   │   ├── ProfileLogoutModal.js   # 로그아웃 모달
│   │   └── SettingsStack.js        # 설정 스택 (알림 등)
│   ├── SetupNickname.js            # 초기 설정: 닉네임
│   ├── SetupProfile.js             # 초기 설정: 프로필
│   ├── SetupPreference.js          # 초기 설정: 선호도
│   └── SetupPreferenceModal.js    # 선호도 설정 모달
├── services/
│   └── userApi.ts                  # 사용자 API 서비스
└── index.ts                        # 모듈 export
```

### 3.3 주요 기능

#### 3.3.1 프로필 관리
- **파일**: `ProfileMain.js`, `ProfileEdit.js`
- **기능**:
  - 프로필 정보 표시
  - 프로필 수정 (닉네임, 프로필 사진, 요리 레벨)
  - 통계 정보 (완성한 레시피 수, 좋아요 수 등)
- **의존성**:
  - `@features/profile/services/userApi`
  - `@shared/lib/supabase`
  - `expo-image-picker` (프로필 사진)

#### 3.3.2 사용자 활동 조회
- **파일**: `ProfileHistory.js`, `ProfileLikes.js`, `ProfileRecentViewed.js`, `ProfileWeekRecipes.js`
- **기능**:
  - 최근 본 레시피
  - 좋아요한 레시피
  - 주간 레시피
- **의존성**:
  - `@shared/lib/supabase`
  - `@features/recipe/components/RecipeCard`

#### 3.3.3 설정 관리
- **파일**: `SettingsStack.js`, `ProfileAlarm.js`
- **기능**:
  - 알림 설정
  - 앱 설정
- **의존성**:
  - `expo-notifications`

#### 3.3.4 초기 설정 (Setup)
- **파일**: `SetupNickname.js`, `SetupProfile.js`, `SetupPreference.js`
- **기능**:
  - 첫 로그인 시 사용자 정보 설정
  - 닉네임 입력
  - 프로필 정보 입력
  - 선호 요리 설정
- **의존성**:
  - `@features/auth` (인증 상태)
  - `@features/profile/services/userApi`

### 3.4 의존성
- **외부 서비스**: Supabase (DB)
- **다른 모듈**: 
  - `@features/auth` (인증 상태)
  - `@features/recipe` (레시피 카드)
- **Shared**: `@shared/lib/supabase`

### 3.5 특징
- ✅ 사용자 관련 기능을 한 곳에 모음
- ✅ Setup 프로세스 포함
- ⚠️ Settings 모듈이 통합됨 (원래는 별도 모듈이었음)

---

## 4. Community 모듈 (커뮤니티)

### 4.1 역할
- 사용자 게시글 관리
- 댓글 관리
- 좋아요 기능

### 4.2 파일 구조
```
features/community/
├── components/
│   └── (비어있음 - 향후 추가 가능)
├── screens/
│   └── community/
│       ├── CommunityStack.tsx      # 커뮤니티 네비게이션 스택
│       ├── CommunityMain.tsx        # 커뮤니티 메인 (목록)
│       ├── CommunityCreate.tsx      # 게시글 작성
│       └── CommunityDetail.tsx      # 게시글 상세
├── services/
│   ├── postsApi.ts                 # 게시글 API
│   ├── postLikesApi.ts            # 게시글 좋아요 API
│   └── commentsApi.ts             # 댓글 API
└── index.ts                        # 모듈 export
```

### 4.3 주요 기능

#### 4.3.1 게시글 관리
- **파일**: `CommunityMain.tsx`, `CommunityCreate.tsx`, `CommunityDetail.tsx`
- **기능**:
  - 게시글 목록 조회
  - 게시글 작성 (레시피 연결 필수)
  - 게시글 상세 조회
  - 게시글 수정/삭제
- **의존성**:
  - `@features/community/services/postsApi`
  - `@features/recipe/components/RecipeSelectModal` (레시피 선택)
  - `expo-image-picker` (이미지 업로드)

#### 4.3.2 댓글 관리
- **파일**: `CommunityDetail.tsx`
- **기능**:
  - 댓글 작성
  - 댓글 조회
  - 댓글 수정/삭제
- **의존성**:
  - `@features/community/services/commentsApi`

#### 4.3.3 좋아요 기능
- **파일**: `CommunityMain.tsx`, `CommunityDetail.tsx`
- **기능**:
  - 게시글 좋아요/취소
  - 좋아요 수 실시간 업데이트
- **의존성**:
  - `@features/community/services/postLikesApi`

### 4.4 의존성
- **외부 서비스**: Supabase (DB)
- **다른 모듈**: 
  - `@features/recipe` (레시피 선택 모달)
  - `@features/profile` (사용자 정보)
- **Shared**: `@shared/lib/supabase`

### 4.5 특징
- ✅ 단순한 구조 (게시글/댓글/좋아요)
- ✅ API 서비스 분리
- ⚠️ 컴포넌트가 없음 (향후 공통 컴포넌트 추가 가능)

---

## 5. Refrigerator 모듈 (냉장고)

### 5.1 역할
- 냉장고 재료 관리
- 영수증 OCR 인식

### 5.2 파일 구조
```
features/refrigerator/
├── components/
│   └── (비어있음 - 향후 추가 가능)
├── screens/
│   ├── Ingredients.js              # 냉장고 재료 목록
│   ├── SetupIngredients.js        # 초기 설정: 재료
│   ├── SetupIngredientsModal.js   # 재료 설정 모달
│   └── Receipt/
│       ├── ReceiptStack.js        # 영수증 네비게이션 스택
│       └── ReceiptMain.js        # 영수증 OCR 인식 화면
├── services/
│   └── receiptItemsApi.ts        # 영수증 재료 API
└── index.ts                       # 모듈 export
```

### 5.3 주요 기능

#### 5.3.1 재료 관리
- **파일**: `Ingredients.js`, `SetupIngredients.js`
- **기능**:
  - 재료 목록 조회 (3열 그리드)
  - 재료 추가/수정/삭제
  - 유통기한 관리
  - 재료 카테고리별 필터링
- **의존성**:
  - `@shared/lib/supabase`
  - `react-native-modern-datepicker` (유통기한 선택)

#### 5.3.2 영수증 OCR 인식
- **파일**: `ReceiptMain.js`
- **기능**:
  - 카메라/갤러리에서 영수증 이미지 선택
  - 백엔드 API로 OCR 처리
  - 인식된 재료 목록 표시
  - 재료 자동 추가
- **의존성**:
  - `expo-image-picker`
  - 백엔드 API: `/api/receipt/ocr`
  - `@features/refrigerator/services/receiptItemsApi`

### 5.4 의존성
- **외부 서비스**: 
  - Supabase (DB)
  - 백엔드 API (OCR)
- **다른 모듈**: 없음 (독립적)
- **Shared**: `@shared/lib/supabase`

### 5.5 특징
- ✅ 단순한 구조
- ✅ 독립적인 모듈 (다른 모듈과 약한 결합)
- ⚠️ 컴포넌트가 없음

---

## 6. Navigation 모듈 (네비게이션)

### 6.1 역할
- 하단 탭 네비게이션 구성
- 전체 앱 네비게이션 구조 관리

### 6.2 파일 구조
```
features/navigation/
├── HomeTab.tsx                    # 하단 탭 네비게이터
└── index.ts                       # 모듈 export
```

### 6.3 주요 기능

#### 6.3.1 하단 탭 네비게이션
- **파일**: `HomeTab.tsx`
- **기능**:
  - 홈 탭 (`HomeMain`)
  - 냉장고 탭 (`Ingredients`)
  - 커뮤니티 탭 (`CommunityStack`)
  - 프로필 탭 (`ProfileMain`)
  - 탭 아이콘 설정
- **의존성**:
  - `@react-navigation/bottom-tabs`
  - `@expo/vector-icons`
  - `@features/recipe/screens/HomeMain`
  - `@features/refrigerator/screens/Ingredients`
  - `@features/community/screens/community/CommunityStack`
  - `@features/profile/screens/Profile/ProfileMain`

### 6.4 의존성
- **외부 서비스**: 없음
- **다른 모듈**: 
  - `@features/recipe`
  - `@features/refrigerator`
  - `@features/community`
  - `@features/profile`
- **Shared**: 없음

### 6.5 특징
- ✅ 단순한 구조
- ✅ 네비게이션만 담당
- ⚠️ 모든 모듈에 의존 (의존성 많음)

---

## 7. 현재 구조의 문제점 및 개선 방안

### 7.1 주요 문제점

#### 7.1.1 Recipe 모듈이 너무 큼
- **문제**: 
  - 레시피 조회/추천
  - AI 영상 분석
  - 검색
  - 음성 제어
  - YouTube 플레이어
  → 하나의 모듈이 5가지 주요 기능 담당
- **영향**:
  - 코드 가독성 저하
  - 테스트 어려움
  - 유지보수 어려움
  - 기능 추가 시 모듈이 더 커짐

#### 7.1.2 모듈 간 의존성 복잡
- **문제**: 
  - `navigation` 모듈이 모든 모듈에 의존
  - `recipe` 모듈이 여러 외부 서비스에 의존
- **영향**:
  - 모듈 간 결합도 높음
  - 리팩토링 어려움

#### 7.1.3 컴포넌트 부족
- **문제**: 
  - `community`, `refrigerator` 모듈에 컴포넌트가 없음
  - 공통 컴포넌트가 `shared`에 없음
- **영향**:
  - 코드 중복 가능성
  - 재사용성 저하

### 7.2 개선 방안

#### 7.2.1 Recipe 모듈 분리
```
features/
├── recipe-core/          # 레시피 조회/추천/상세
│   ├── screens/
│   │   ├── HomeMain.js
│   │   ├── Summary.js
│   │   ├── RecipeList.js
│   │   └── Recipe/
│   ├── components/
│   │   └── RecipeCard.js
│   └── services/
│
├── ai-analysis/          # AI 영상 분석
│   ├── screens/
│   │   ├── AIAnalyze.js
│   │   └── AnalysisHistory.tsx
│   ├── components/
│   │   └── YouTubeAnalysisModal.js
│   └── contexts/
│       └── AnalysisContext.tsx
│
├── search/               # 검색 기능
│   ├── screens/
│   │   ├── SearchMain.js
│   │   ├── SearchList.js
│   │   └── SearchSummary.js
│   └── services/
│
└── shared/
    └── components/
        └── YouTubePlayer.js  # 공통 컴포넌트로 이동
```

#### 7.2.2 공통 컴포넌트 추가
```
shared/
└── components/
    ├── YouTubePlayer.js        # YouTube 플레이어
    ├── RecipeCard.js           # 레시피 카드 (공통)
    ├── LoadingSpinner.js       # 로딩 스피너
    └── ErrorMessage.js         # 에러 메시지
```

#### 7.2.3 모듈 간 의존성 최소화
- **전략**: 
  - 인터페이스 기반 의존성
  - Context API를 통한 느슨한 결합
  - 공통 서비스는 `shared`에 배치

### 7.3 권장 모듈 구조 (개선 후)

```
features/
├── auth/                 # 인증 (변경 없음)
├── recipe-core/          # 레시피 핵심 기능
├── ai-analysis/          # AI 분석 (분리)
├── search/               # 검색 (분리)
├── profile/              # 프로필 (변경 없음)
├── community/            # 커뮤니티 (변경 없음)
├── refrigerator/         # 냉장고 (변경 없음)
└── navigation/           # 네비게이션 (변경 없음)

shared/
├── components/           # 공통 컴포넌트
├── lib/                  # 공통 라이브러리
├── services/             # 공통 서비스
└── types/                # 공통 타입
```

### 7.4 마이그레이션 계획

1. **1단계**: `YouTubePlayer`를 `shared/components`로 이동
2. **2단계**: `ai-analysis` 모듈 분리
3. **3단계**: `search` 모듈 분리
4. **4단계**: 공통 컴포넌트 추가
5. **5단계**: 의존성 정리 및 최적화

---

## 결론

현재 모듈 구조는 **기능별로 잘 분리**되어 있지만, **Recipe 모듈이 너무 크고 많은 책임**을 가지고 있습니다. 이를 분리하면:

- ✅ 코드 가독성 향상
- ✅ 테스트 용이성 향상
- ✅ 유지보수 용이성 향상
- ✅ 기능 확장 용이성 향상

을 얻을 수 있습니다.

---

*최종 업데이트: 2024년*

