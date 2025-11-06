# 📱 Cookit Mobile App

<div align="center">

**React Native + Expo 기반의 AI 요리 레시피 모바일 애플리케이션**

Cookit 프로젝트의 모바일 앱으로, AI 레시피 분석, 개인화 추천, 냉장고 관리, 커뮤니티 기능을 제공합니다.

[빠른 시작](#-빠른-시작) • [주요 기능](#-주요-기능) • [프로젝트 구조](#-프로젝트-구조) • [문제 해결](#-문제-해결)

</div>

---

## 📋 목차

1. [프로젝트 개요](#-프로젝트-개요)
2. [기술 스택](#-기술-스택)
3. [빠른 시작](#-빠른-시작)
4. [환경 변수 설정](#-환경-변수-설정)
5. [프로젝트 구조](#-프로젝트-구조)
6. [주요 기능](#-주요-기능)
7. [개발 가이드](#-개발-가이드)
8. [문제 해결](#-문제-해결)

---

## 🎯 프로젝트 개요

Cookit Mobile App은 AI 기반 요리 레시피 추천 및 관리 플랫폼의 모바일 클라이언트입니다. 주요 특징:

- 🤖 **AI 레시피 분석**: YouTube 영상 URL만 입력하면 자동으로 레시피 추출
- 🎯 **개인화 추천**: 사용자 선호도, 요리 레벨, 냉장고 재료 기반 맞춤형 추천
- 🥘 **스마트 냉장고**: 영수증 OCR로 재료 자동 등록 및 유통기한 알림
- 🎤 **음성 제어**: 요리 중 음성 명령으로 조리 단계 제어
- 👥 **커뮤니티**: 레시피 공유 및 요리 경험 기록
- 📊 **요리 기록**: 완성한 요리, 별점, 평점 관리

---

## 🛠 기술 스택

### 핵심 프레임워크
- **React Native**: 0.81.4
- **Expo SDK**: ~54.0.0
- **React**: 19.1.0
- **TypeScript**: ~5.8.3

### 네비게이션 & 상태 관리
- **React Navigation**: 7.x (Native Stack, Bottom Tabs)
- **React Context API**: 전역 상태 관리
- **AsyncStorage**: 로컬 데이터 저장

### 백엔드 & 데이터베이스
- **Supabase**: 인증, 데이터베이스, 스토리지
- **Axios**: HTTP 클라이언트

### 음성 제어
- **Picovoice Porcupine**: Wake Word 감지
- **Picovoice Rhino**: 음성 명령 인식

### 알림
- **Expo Notifications**: 푸시 알림 및 로컬 알림

### 미디어 & 이미지
- **Expo Image Picker**: 이미지 선택
- **React Native Video**: 비디오 재생
- **Expo AV**: 오디오/비디오 재생

### UI/UX
- **Expo Vector Icons**: 아이콘
- **React Native Reanimated**: 애니메이션
- **React Native Gesture Handler**: 제스처 처리
- **React Native Safe Area Context**: Safe Area 처리

---

## 🚀 빠른 시작

### 사전 요구사항

- **Node.js**: 18.x 이상
- **npm** 또는 **yarn**
- **Expo CLI**: `npm install -g expo-cli` (선택사항)
- **Expo Go 앱**: iOS/Android 기기에 설치 (실제 기기 테스트용)
- **Supabase 계정**: [supabase.com](https://supabase.com)
- **Picovoice Access Key**: [console.picovoice.ai](https://console.picovoice.ai) (음성 제어 사용 시)

### 1️⃣ 저장소 클론 및 이동

```bash
git clone <repository-url>
cd Cookit/CookitMobile
```

### 2️⃣ 의존성 설치

```bash
npm install
```

### 3️⃣ 환경 변수 설정

```bash
# .env.example을 .env로 복사
cp .env.example .env  # Linux/Mac
copy .env.example .env  # Windows
```

`.env` 파일을 열어 실제 값으로 수정하세요. 자세한 내용은 [환경 변수 설정](#-환경-변수-설정) 섹션을 참고하세요.

### 4️⃣ 앱 실행

```bash
# Expo 개발 서버 시작
npm start
# 또는
npx expo start
```

실행 후:
- **`a` 키**: Android 에뮬레이터에서 실행
- **`i` 키**: iOS 시뮬레이터에서 실행
- **`w` 키**: 웹 브라우저에서 실행
- **QR 코드 스캔**: Expo Go 앱에서 실제 기기에서 실행

---

## ⚙️ 환경 변수 설정

### .env 파일 구조

`.env.example` 파일을 참고하여 `.env` 파일을 생성하세요:

```env
# ==========================================
# Supabase 설정 (EXPO_PUBLIC_ 접두사 필수!)
# ==========================================
# Supabase 프로젝트 대시보드 > Settings > API에서 확인
EXPO_PUBLIC_SUPABASE_URL=''
EXPO_PUBLIC_SUPABASE_ANON_KEY=''

# ==========================================
# 개발 서버 설정
# ==========================================
# 로컬 개발: http://<당신의_PC_IP_주소>:3000/api
# ⚠️ 중요: 이더넷(유선) 연결 시 IP와 와이파이 연결 시 IP가 다를 수 있으니 확인 필요
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_API_BASE_URL=''

# ==========================================
# 개발/프로덕션 환경 구분
# ==========================================
EXPO_PUBLIC_ENV=development

# ==========================================
# 앱 버전 (선택사항)
# ==========================================
EXPO_PUBLIC_APP_VERSION=1.0.0

# ==========================================
# Picovoice Access Key (음성 제어용)
# ==========================================
# Picovoice Console (https://console.picovoice.ai/)에서 발급
EXPO_PUBLIC_PICOVOICE_ACCESS_KEY=''
```

### 환경 변수 설명

#### Supabase 설정
1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택 → **Settings** → **API**
3. 다음 값들을 복사:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** 키 → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

#### API URL 설정
- **로컬 개발**: `http://localhost:3000/api` (에뮬레이터/시뮬레이터)
- **실제 기기**: `http://<PC_IP_주소>:3000/api` (예: `http://192.168.1.100:3000/api`)
- ⚠️ **중요**: 이더넷(유선) 연결과 Wi-Fi 연결의 IP 주소가 다를 수 있습니다. 연결 방식을 변경하면 `.env` 파일의 IP 주소도 함께 변경해야 합니다.

#### Picovoice Access Key (선택사항)
음성 제어 기능을 사용하지 않는다면 이 변수는 비워둬도 됩니다.

1. [Picovoice Console](https://console.picovoice.ai/) 접속
2. 계정 생성 또는 로그인
3. **Access Key** 생성
4. 생성된 키를 `EXPO_PUBLIC_PICOVOICE_ACCESS_KEY`에 입력

---

## 📁 프로젝트 구조

```
CookitMobile/
├── App.js                    # 앱 진입점 (알림 초기화, 네비게이션 ref)
├── app.config.js             # Expo 설정 (앱 이름, 아이콘, 권한 등)
├── babel.config.js           # Babel 설정 (Path Aliases)
├── tsconfig.json             # TypeScript 설정
├── package.json              # 의존성 및 스크립트
│
├── features/                 # 기능별 모듈 (기능 모듈화)
│   ├── auth/                 # 인증 모듈
│   │   ├── components/       # AuthNavigator, AuthScreen, GoogleSignInButton
│   │   ├── contexts/         # AuthContext (useAuth Hook)
│   │   └── index.ts           # 모듈 export
│   │
│   ├── recipe/               # 레시피 모듈
│   │   ├── components/       # RecipeCard, YouTubePlayer, YouTubeAnalysisModal
│   │   ├── contexts/         # AnalysisContext (AI 분석 상태)
│   │   ├── screens/          # HomeMain, RecipeMain, Summary, RecipeList, Search
│   │   ├── services/         # recipeService, recipeLikesApi
│   │   └── index.ts
│   │
│   ├── refrigerator/         # 냉장고 관리 모듈
│   │   ├── screens/          # Ingredients, ReceiptMain, SetupIngredients
│   │   ├── services/         # receiptItemsApi
│   │   └── index.ts
│   │
│   ├── community/            # 커뮤니티 모듈
│   │   ├── screens/          # CommunityMain, CommunityDetail, CommunityCreate
│   │   ├── services/        # postsApi, commentsApi, postLikesApi
│   │   └── index.ts
│   │
│   ├── profile/              # 프로필 모듈
│   │   ├── screens/         # ProfileMain, ProfileEdit, SettingsStack
│   │   │   └── Profile/     # ProfileHistory, ProfileLikes, ProfileWeekRecipes 등
│   │   ├── services/        # userApi
│   │   └── index.ts
│   │
│   └── navigation/           # 네비게이션 모듈
│       ├── HomeTab.tsx       # 하단 탭 네비게이터 (Home, Refrigerator, Community, Profile)
│       └── index.ts
│
├── shared/                   # 공유 리소스
│   ├── components/          # 재사용 컴포넌트
│   │   ├── WheelDatePicker.js    # 날짜 선택 휠
│   │   ├── SearchInput.js        # 검색 입력
│   │   ├── Sort.js               # 정렬 컴포넌트
│   │   └── AnalysisFloatingBar.tsx  # AI 분석 플로팅 바
│   ├── services/            # 공통 서비스
│   │   └── notificationService.js  # 알림 서비스 (유통기한 알림 등)
│   ├── lib/                 # 라이브러리 설정
│   │   └── supabase.ts      # Supabase 클라이언트
│   └── types/               # TypeScript 타입 정의
│
├── assets/                  # 정적 리소스
│   ├── app_logo.png         # 앱 로고
│   ├── icon.png             # 앱 아이콘
│   └── splash.png           # 스플래시 화면
│
├── docs/                    # 문서
│   ├── FCM_TEST_GUIDE.md
│   ├── PICOVOICE_SETUP.md
│   └── ...
│
└── .env.example             # 환경 변수 템플릿
```

### Path Aliases

프로젝트는 Babel의 `babel-plugin-module-resolver`를 사용하여 Path Aliases를 설정했습니다:

- `@features/*` → `features/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `assets/*`

예시:
```javascript
import { useAuth } from '@features/auth';
import notificationService from '@shared/services/notificationService';
import logo from '@assets/app_logo.png';
```

---

## ✨ 주요 기능

### 1. 인증 (Authentication)

#### Google OAuth 로그인
- Supabase Auth를 통한 Google OAuth 인증
- 자동 회원가입 및 로그인
- 세션 관리

#### 초기 설정 (Onboarding)
1. **닉네임 설정**: 사용자 닉네임 입력
2. **프로필 설정**: 프로필 사진, 요리 레벨 선택
3. **선호도 설정**: 선호/비선호 재료 선택
4. **냉장고 초기 설정**: 첫 재료 추가

### 2. 레시피 (Recipe)

#### 홈 화면
- **개인화 추천**: 사용자 맞춤형 레시피 추천
- **인기 레시피**: 조회수 및 좋아요 기반
- **"또 만들고 싶어요"**: 완성한 요리 기반 유사 레시피 추천
- **카테고리별 추천**: 한식, 중식, 양식 등

#### 레시피 상세
- **레시피 정보**: 제목, 설명, 난이도, 소요 시간
- **재료 목록**: 필요한 재료 및 수량
- **조리 단계**: 단계별 상세 설명
- **YouTube 영상 재생**: 구간 반복 재생 지원
- **음성 제어**: Wake Word 후 음성 명령으로 단계 제어
  - "다음": 다음 단계로 이동
  - "이전": 이전 단계로 이동
  - "반복": 현재 단계 반복
  - "일시정지": 영상 일시정지

#### 레시피 요약
- 모달 형식으로 레시피 요약 정보 표시
- 재료, 조리 시간, 난이도 등 한눈에 확인

#### AI 분석
- YouTube URL 입력으로 레시피 자동 분석
- 분석 진행 상황 실시간 확인
- 분석 완료 후 자동으로 레시피 추가

#### 검색
- 레시피 제목, 재료, 설명 검색
- 카테고리, 난이도 필터링
- 정렬 옵션 (인기순, 최신순 등)

### 3. 냉장고 관리 (Refrigerator)

#### 재료 목록
- 3열 그리드 레이아웃
- 재료명, 수량, 유통기한, 보관 방법 표시
- 유통기한 임박 재료 강조 표시

#### 재료 추가/수정
- 수동 입력: 재료명, 수량, 유통기한, 보관 방법
- 날짜 선택: 휠 형식 날짜 선택기
- 빠른 날짜 선택: +15일, +30일, +60일, +90일 버튼
- 수량 조절: +/- 버튼으로 쉽게 조절

#### 영수증 OCR
- 영수증 사진 촬영
- OCR로 재료 자동 인식
- 인식된 재료 확인 및 수정 후 냉장고에 추가

#### 유통기한 알림
- 재료 유통기한 당일 오전 9시 자동 알림
- 알림 클릭 시 냉장고 화면으로 이동

### 4. 커뮤니티 (Community)

#### 게시글 목록
- 공개 게시글만 표시
- 썸네일, 제목, 좋아요 수, 댓글 수 표시
- 이미지 없는 게시글도 플레이스홀더로 표시

#### 게시글 작성
- 레시피 연결 필수
- 이미지 최대 4장 업로드
- 제목, 내용 작성
- 공개/비공개 설정

#### 게시글 상세
- 게시글 내용, 이미지, 작성자 정보
- 좋아요 및 댓글 기능
- 연결된 레시피로 이동

### 5. 프로필 (Profile)

#### 프로필 메인
- 사용자 정보 (닉네임, 프로필 사진)
- 요리 통계 (완성한 요리 수, 좋아요한 레시피 수)
- 최근 본 레시피
- 이번 주 완성한 요리 (별점/평점)

#### 요리 기록
- **요리 게시글**: 내가 작성한 모든 게시글
- **별점 및 평점**: 내가 평가한 레시피 목록

#### 설정
- 프로필 편집
- 알림 설정
- 좋아요한 레시피
- 로그아웃

---

## 💻 개발 가이드

### 개발 서버 실행

```bash
# 개발 서버 시작
npm start

# 특정 플랫폼에서 실행
npm run android    # Android
npm run ios        # iOS
npm run web        # 웹
```

### 네트워크 설정 (실제 기기 테스트)

모바일 앱이 서버에 접근하려면:

1. **PC와 모바일 기기가 같은 네트워크에 연결** (Wi-Fi 또는 이더넷)
2. **PC의 로컬 IP 주소 확인:**
   ```bash
   # Windows
   ipconfig
   # 이더넷 어댑터 또는 무선 LAN 어댑터의 IPv4 주소 확인
   
   # Mac/Linux
   ifconfig
   ```
3. **`.env` 파일의 `EXPO_PUBLIC_API_URL`을 PC IP로 설정:**
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
   ```
4. **서버의 `ALLOWED_ORIGINS`에 모바일 Origin 추가** (Server/.env)
5. **앱 재시작** (환경 변수 변경 후)

### 코드 스타일

- **JavaScript/TypeScript**: ES6+ 문법 사용
- **컴포넌트**: 함수형 컴포넌트 + Hooks
- **네이밍**: 
  - 컴포넌트: PascalCase (예: `RecipeCard`)
  - 함수/변수: camelCase (예: `handleSubmit`)
  - 상수: UPPER_SNAKE_CASE (예: `MAX_IMAGE_COUNT`)

### 주요 패턴

#### Path Aliases 사용
```javascript
// ❌ 나쁜 예
import RecipeCard from '../../../features/recipe/components/RecipeCard';

// ✅ 좋은 예
import RecipeCard from '@features/recipe/components/RecipeCard';
```

#### Context 사용
```javascript
// Auth Context 사용
import { useAuth } from '@features/auth';

function MyComponent() {
  const { user, loading } = useAuth();
  // ...
}
```

#### API 호출
```javascript
import { getRecipes } from '@features/recipe/services/recipeService';

const fetchRecipes = async () => {
  try {
    const recipes = await getRecipes({ page: 1, limit: 20 });
    setRecipes(recipes);
  } catch (error) {
    console.error('레시피 로딩 실패:', error);
  }
};
```

---

## 🔧 문제 해결

### 일반적인 문제

#### 1. 앱이 서버에 연결되지 않음

**증상**: API 호출 실패, 네트워크 오류

**해결책:**
- PC와 모바일 기기가 같은 Wi-Fi에 연결되어 있는지 확인
- `.env` 파일의 `EXPO_PUBLIC_API_URL`이 올바른 IP 주소인지 확인
- 서버가 실행 중인지 확인 (`http://localhost:3000` 접속 테스트)
- 방화벽이 포트 3000을 차단하지 않는지 확인
- 서버의 `ALLOWED_ORIGINS`에 모바일 Origin이 포함되어 있는지 확인

#### 2. Supabase 연결 오류

**증상**: 인증 실패, 데이터 조회 실패

**해결책:**
- `.env` 파일의 Supabase URL과 키가 올바른지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- RLS (Row Level Security) 정책이 올바르게 설정되어 있는지 확인

#### 3. 알림이 작동하지 않음

**증상**: 유통기한 알림이 오지 않음

**해결책:**
- 실제 기기에서 테스트 (에뮬레이터/시뮬레이터에서는 제한적)
- 앱 설정에서 알림 권한이 허용되어 있는지 확인
- `expo-notifications` 패키지가 올바르게 설치되어 있는지 확인

#### 4. 음성 제어가 작동하지 않음

**증상**: Wake Word 인식 안 됨, 음성 명령 인식 안 됨

**해결책:**
- `EXPO_PUBLIC_PICOVOICE_ACCESS_KEY`가 올바르게 설정되었는지 확인
- 마이크 권한이 허용되어 있는지 확인
- 실제 기기에서 테스트 (에뮬레이터에서는 제한적)
- Picovoice Console에서 Access Key가 활성화되어 있는지 확인

#### 5. 이미지가 로드되지 않음

**증상**: 이미지가 표시되지 않음

**해결책:**
- 이미지 URL이 올바른지 확인
- Supabase Storage의 공개 설정 확인
- 네트워크 연결 확인

#### 6. 환경 변수가 적용되지 않음

**증상**: `.env` 파일을 수정했는데 변경사항이 반영되지 않음

**해결책:**
- Expo 개발 서버 재시작 (`Ctrl+C` 후 `npm start`)
- 앱 재시작 (Expo Go에서 앱 종료 후 다시 실행)
- `.env` 파일의 변수명이 `EXPO_PUBLIC_` 접두사로 시작하는지 확인

### 로그 확인

**Expo 개발 서버 로그:**
- 터미널에 직접 출력
- Metro Bundler 로그 확인

**앱 로그:**
- Expo Go 앱: 개발 서버 터미널에서 확인
- 개발 빌드: `npx react-native log-android` / `npx react-native log-ios`

---

## 🔐 보안 주의사항

### ⚠️ 중요 보안 규칙

1. **`.env` 파일은 절대 Git에 커밋하지 마세요**
   - `.env.example`만 커밋
   - `.gitignore`에 `.env` 포함 확인

2. **민감한 정보 보호**
   - API 키는 환경 변수로만 관리
   - 로그에 민감한 정보 출력 금지

3. **Supabase 키 관리**
   - 클라이언트에는 `ANON_KEY`만 사용
   - `SERVICE_KEY`는 절대 클라이언트에 노출하지 마세요

---

## 📚 추가 문서

- **[루트 README.md](../README.md)**: 전체 프로젝트 개요
- **[Server README.md](../Server/README.md)**: 백엔드 서버 문서
- **[FCM_TEST_GUIDE.md](./docs/FCM_TEST_GUIDE.md)**: 푸시 알림 테스트 가이드
- **[PICOVOICE_SETUP.md](./docs/PICOVOICE_SETUP.md)**: 음성 제어 설정 가이드
- **[README_Network_Setup.md](./docs/README_Network_Setup.md)**: 네트워크 설정 가이드

---

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해주세요.

---

<div align="center">

**Made with ❤️ by Cookit Team**

</div>
