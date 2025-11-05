# Cookit 개발 환경 및 패키지 목록

## 📋 목차
1. [개발 환경](#개발-환경)
2. [프론트엔드 패키지 (CookitMobile)](#프론트엔드-패키지-cookitmobile)
3. [백엔드 패키지 (Server)](#백엔드-패키지-server)
4. [개발 도구](#개발-도구)

---

## 개발 환경

### 프론트엔드 (CookitMobile)
- **프레임워크**: React Native 0.81.4
- **런타임**: Expo SDK 54.0.0
- **언어**: JavaScript / TypeScript 5.8.3
- **빌드 도구**: Expo CLI, EAS Build
- **패키지 관리자**: npm
- **네비게이션**: React Navigation 7.x
- **상태 관리**: React Context API

### 백엔드 (Server)
- **런타임**: Node.js
- **프레임워크**: Express 4.21.2
- **언어**: JavaScript (ES Modules)
- **패키지 관리자**: npm
- **개발 서버**: nodemon 3.1.9

### 데이터베이스
- **서비스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth
- **스토리지**: Supabase Storage

### 외부 서비스
- **AI 서비스**: Google Gemini API
- **음성 인식**: Picovoice (Porcupine + Rhino)
- **YouTube**: YouTube Data API
- **OCR**: Tesseract.js
- **이미지 처리**: Sharp

---

## 프론트엔드 패키지 (CookitMobile)

### 📦 핵심 프레임워크

#### `react` (19.1.0)
- **기능**: React 라이브러리
- **용도**: UI 컴포넌트 개발의 핵심

#### `react-native` (0.81.4)
- **기능**: React Native 프레임워크
- **용도**: 크로스 플랫폼 모바일 앱 개발

#### `expo` (~54.0.0)
- **기능**: Expo SDK
- **용도**: React Native 개발 도구 및 네이티브 모듈 관리

---

### 🎨 UI 및 네비게이션

#### `@react-navigation/native` (^7.1.14)
- **기능**: React Navigation 핵심 라이브러리
- **용도**: 네비게이션 시스템 기본 기능

#### `@react-navigation/native-stack` (^7.3.21)
- **기능**: 네이티브 스택 네비게이터
- **용도**: 화면 스택 네비게이션 (Summary → RecipeMain 등)

#### `@react-navigation/bottom-tabs` (^7.4.5)
- **기능**: 하단 탭 네비게이터
- **용도**: 홈, 냉장고, 커뮤니티, 프로필 탭 구현

#### `@react-navigation/elements` (^2.3.8)
- **기능**: 네비게이션 UI 요소
- **용도**: 헤더, 탭 바 커스터마이징

#### `react-native-safe-area-context` (^5.4.0)
- **기능**: Safe Area 처리
- **용도**: 노치, 상태바 등 안전 영역 처리

#### `react-native-screens` (~4.16.0)
- **기능**: 네이티브 화면 최적화
- **용도**: 네비게이션 성능 향상

#### `react-native-gesture-handler` (~2.28.0)
- **기능**: 제스처 처리
- **용도**: 스와이프, 드래그 등 제스처 인식

#### `react-native-reanimated` (~4.1.1)
- **기능**: 고성능 애니메이션
- **용도**: 부드러운 UI 애니메이션

#### `react-native-modal` (^14.0.0-rc.1)
- **기능**: 모달 컴포넌트
- **용도**: 팝업, 다이얼로그 표시

#### `react-native-modern-datepicker` (^1.0.0-beta.91)
- **기능**: 날짜 선택기
- **용도**: 날짜 선택 UI (유통기한 등)

#### `@expo/vector-icons` (^15.0.2)
- **기능**: 아이콘 라이브러리
- **용도**: Ionicons, MaterialIcons 등 아이콘 사용

#### `expo-blur` (~15.0.7)
- **기능**: 블러 효과
- **용도**: 배경 블러 처리

#### `expo-image` (~3.0.9)
- **기능**: 최적화된 이미지 컴포넌트
- **용도**: 이미지 로딩 및 캐싱

---

### 🔐 인증 및 보안

#### `@supabase/supabase-js` (^2.53.0)
- **기능**: Supabase 클라이언트
- **용도**: 데이터베이스, 인증, 스토리지 접근

#### `expo-auth-session` (~7.0.8)
- **기능**: OAuth 인증 세션 관리
- **용도**: Google 로그인 구현

#### `expo-secure-store` (~15.0.7)
- **기능**: 보안 저장소
- **용도**: 토큰, 민감 정보 안전 저장

#### `expo-crypto` (~15.0.7)
- **기능**: 암호화 기능
- **용도**: 해시, 암호화 처리

---

### 🎤 음성 인식

#### `@picovoice/porcupine-react-native` (^3.0.5)
- **기능**: Wake Word 감지
- **용도**: "헤이 쿠킷" 같은 웨이크 워드 인식

#### `@picovoice/rhino-react-native` (^3.0.5)
- **기능**: Intent 인식 (의도 파악)
- **용도**: "다음 단계", "이전 단계" 등 음성 명령 인식

#### `@picovoice/react-native-voice-processor` (^1.2.3)
- **기능**: 음성 처리 엔진
- **용도**: 오디오 스트림 처리

---

### 💾 데이터 저장 및 상태

#### `@react-native-async-storage/async-storage` (^2.2.0)
- **기능**: 비동기 로컬 저장소
- **용도**: 설정, 검색 기록 등 로컬 데이터 저장

#### `react-native-get-random-values` (^2.0.0)
- **기능**: 랜덤 값 생성
- **용도**: UUID 생성 등

---

### 📡 네트워크 및 API

#### `axios` (^1.7.7)
- **기능**: HTTP 클라이언트
- **용도**: 백엔드 API 호출

#### `react-native-url-polyfill` (^2.0.0)
- **기능**: URL Polyfill
- **용도**: URL 처리 호환성

---

### 📹 미디어

#### `expo-av` (~16.0.7)
- **기능**: 오디오/비디오 재생
- **용도**: 오디오 재생 (현재는 사용 안 함)

#### `react-native-video` (^6.16.1)
- **기능**: 비디오 플레이어
- **용도**: 비디오 재생 (현재는 WebView 사용)

#### `react-native-webview` (13.15.0)
- **기능**: WebView 컴포넌트
- **용도**: YouTube 영상 임베딩

#### `expo-image-picker` (^17.0.8)
- **기능**: 이미지 선택기
- **용도**: 갤러리/카메라에서 이미지 선택

---

### 🔔 알림

#### `expo-notifications` (^0.32.12)
- **기능**: 푸시 알림
- **용도**: 유통기한 알림, 요리 완료 알림 등

---

### 🛠️ 개발 도구

#### `expo-dev-client` (~6.0.16)
- **기능**: 개발 클라이언트
- **용도**: 개발 중 네이티브 모듈 테스트

#### `expo-constants` (~18.0.10)
- **기능**: 앱 상수 정보
- **용도**: 환경 변수, 앱 정보 접근

#### `expo-device` (~8.0.9)
- **기능**: 디바이스 정보
- **용도**: 디바이스 타입, OS 버전 확인

#### `expo-linking` (~8.0.8)
- **기능**: 딥 링크 처리
- **용도**: URL 스킴 처리

#### `expo-status-bar` (~3.0.8)
- **기능**: 상태바 제어
- **용도**: 상태바 스타일 설정

#### `expo-system-ui` (~6.0.7)
- **기능**: 시스템 UI 제어
- **용도**: 시스템 UI 설정

#### `expo-splash-screen` (~31.0.10)
- **기능**: 스플래시 화면
- **용도**: 앱 시작 스플래시 화면

#### `expo-haptics` (~15.0.7)
- **기능**: 햅틱 피드백
- **용도**: 진동 피드백

#### `expo-font` (~14.0.9)
- **기능**: 커스텀 폰트
- **용도**: 폰트 로딩

---

### 🔧 빌드 및 설정

#### `react-native-dotenv` (^3.4.11)
- **기능**: 환경 변수 관리
- **용도**: `.env` 파일에서 환경 변수 로드

#### `dotenv` (^17.2.1)
- **기능**: 환경 변수 파서
- **용도**: 환경 변수 로드

#### `babel-plugin-module-resolver` (^5.0.2)
- **기능**: 모듈 경로 별칭
- **용도**: `@features`, `@shared`, `@assets` 경로 별칭

#### `react-native-worklets` (0.5.1)
- **기능**: Worklets 지원
- **용도**: 고성능 애니메이션을 위한 워크렛

---

### 🌐 웹 지원

#### `react-native-web` (^0.21.0)
- **기능**: React Native 웹 호환성
- **용도**: 웹 플랫폼 지원

---

### 📦 개발 의존성 (devDependencies)

#### `@babel/core` (^7.25.2)
- **기능**: Babel 코어
- **용도**: JavaScript 트랜스파일러

#### `@types/react` (^19.1.0)
- **기능**: React TypeScript 타입 정의
- **용도**: TypeScript 타입 체크

#### `typescript` (~5.8.3)
- **기능**: TypeScript 컴파일러
- **용도**: TypeScript 지원

#### `eslint` (^9.25.0)
- **기능**: 코드 린터
- **용도**: 코드 품질 검사

#### `eslint-config-expo` (~9.2.0)
- **기능**: Expo ESLint 설정
- **용도**: Expo 프로젝트용 ESLint 규칙

#### `metro` (^0.82.5)
- **기능**: Metro 번들러
- **용도**: React Native 번들링

---

## 백엔드 패키지 (Server)

### 📦 핵심 프레임워크

#### `express` (^4.21.2)
- **기능**: Node.js 웹 프레임워크
- **용도**: RESTful API 서버 구축

---

### 🔐 보안 및 미들웨어

#### `helmet` (^8.0.0)
- **기능**: 보안 헤더 설정
- **용도**: HTTP 보안 헤더 자동 설정

#### `cors` (^2.8.5)
- **기능**: CORS 처리
- **용도**: 크로스 오리진 요청 허용

#### `morgan` (^1.10.0)
- **기능**: HTTP 요청 로거
- **용도**: API 요청 로깅

---

### 💾 데이터베이스 및 스토리지

#### `@supabase/supabase-js` (^2.55.0)
- **기능**: Supabase 클라이언트
- **용도**: 데이터베이스 쿼리, 스토리지 접근

---

### 🤖 AI 및 분석

#### `@google/generative-ai` (^0.24.1)
- **기능**: Google Gemini API 클라이언트
- **용도**: YouTube 영상 분석, 레시피 생성

---

### 🖼️ 이미지 및 OCR

#### `tesseract.js` (^6.0.1)
- **기능**: OCR (광학 문자 인식)
- **용도**: 영수증 텍스트 추출

#### `sharp` (^0.34.3)
- **기능**: 고성능 이미지 처리
- **용도**: 이미지 리사이징, 최적화

#### `multer` (^2.0.2)
- **기능**: 파일 업로드 미들웨어
- **용도**: 이미지 파일 업로드 처리

---

### 📡 네트워크

#### `axios` (^1.13.1)
- **기능**: HTTP 클라이언트
- **용도**: YouTube API, 외부 API 호출

---

### 🔧 설정

#### `dotenv` (^16.4.7)
- **기능**: 환경 변수 관리
- **용도**: `.env` 파일에서 환경 변수 로드

---

### 📦 개발 의존성 (devDependencies)

#### `nodemon` (^3.1.9)
- **기능**: 개발 서버 자동 재시작
- **용도**: 코드 변경 시 서버 자동 재시작

---

## 개발 도구

### 프론트엔드

#### Babel 설정
- **파일**: `babel.config.js`
- **플러그인**:
  - `babel-preset-expo`: Expo 프리셋
  - `react-native-worklets/plugin`: Worklets 지원
  - `module:react-native-dotenv`: 환경 변수 로드
  - `module-resolver`: 경로 별칭 (`@features`, `@shared`, `@assets`)

#### TypeScript 설정
- **파일**: `tsconfig.json`
- **경로 별칭**:
  - `@features/*` → `features/*`
  - `@shared/*` → `shared/*`
  - `@assets/*` → `assets/*`

#### Expo 설정
- **파일**: `app.config.js`
- **주요 설정**:
  - 앱 이름: CookIt
  - 패키지명: com.cookit.mobile
  - 권한: 마이크, 알림
  - 스플래시 화면 설정
  - 알림 플러그인 설정

### 백엔드

#### 서버 설정
- **파일**: `app.js`
- **포트**: 3000 (기본값)
- **미들웨어**: CORS, Helmet, Morgan, JSON 파서

---

## 패키지 설치 방법

### 프론트엔드
```bash
cd CookitMobile
npm install
```

### 백엔드
```bash
cd Server
npm install
```

---

## 환경 변수 설정

### 프론트엔드 (`.env`)
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_API_BASE_URL=your_backend_url
```

### 백엔드 (`.env`)
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
YOUTUBE_API_KEY=your_youtube_api_key
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000
```

---

## 주요 기능별 패키지 매핑

### 인증
- `@supabase/supabase-js` - 인증 처리
- `expo-auth-session` - OAuth 인증

### 음성 제어
- `@picovoice/porcupine-react-native` - Wake Word
- `@picovoice/rhino-react-native` - Intent 인식

### 네비게이션
- `@react-navigation/native` - 네비게이션 핵심
- `@react-navigation/native-stack` - 스택 네비게이션
- `@react-navigation/bottom-tabs` - 탭 네비게이션

### 데이터베이스
- `@supabase/supabase-js` - 데이터베이스 클라이언트

### 알림
- `expo-notifications` - 푸시 알림

### 이미지 처리
- `expo-image-picker` - 이미지 선택
- `sharp` (백엔드) - 이미지 처리

### OCR
- `tesseract.js` (백엔드) - 영수증 OCR

### AI 분석
- `@google/generative-ai` (백엔드) - Gemini API

---

*최종 업데이트: 2024년*

