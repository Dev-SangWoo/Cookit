# 🍳 Cookit 프로젝트

Cookit은 AI 기반 요리 레시피 추천 및 커뮤니티 플랫폼입니다.

## 📁 프로젝트 구조

```
Cookit/
├── CookitMobile/          # React Native 모바일 앱
├── Server/               # Node.js 백엔드 서버
├── docs/                 # 프로젝트 문서 모음
└── README.md            # 이 파일
```

## 🚀 각 프로젝트 실행 방법

### 📱 CookitMobile (모바일 앱)

```bash
# CookitMobile 폴더로 이동
cd CookitMobile

# 의존성 설치
npm install

# 개발 서버 시작
npm start
# 또는
npx expo start

# 플랫폼별 실행
npm run android    # Android 에뮬레이터
npm run ios        # iOS 시뮬레이터
npm run web        # 웹 브라우저
```

**주요 기능:**
- Google OAuth 인증
- 레시피 검색 및 저장
- AI 기반 레시피 분석
- 커뮤니티 기능
- 사용자 프로필 관리

### 🖥️ Server (백엔드 서버)

```bash
# Server 폴더로 이동
cd Server

# 의존성 설치
npm install

# 서버 시작
npm start
```

**주요 기능:**
- REST API 엔드포인트
- AI 파이프라인 (YouTube → OCR → Whisper → Gemini)
- Supabase 데이터베이스 연동
- 영수증 OCR 처리
- 레시피 관리 API

### 🧾 Recipt+OCR (영수증 처리)

```bash
# Recipt+OCR 폴더로 이동
cd Recipt+OCR

# 의존성 설치
npm install

# OCR 처리 실행
npm start
```

**주요 기능:**
- Tesseract.js 기반 OCR
- 영수증 텍스트 추출
- Supabase 데이터 저장

## 🔧 개발 환경 설정

### 1. 환경 변수 설정

각 프로젝트에서 `.env` 파일을 생성하고 필요한 환경 변수를 설정하세요:

**CookitMobile/.env:**
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Server/.env:**
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
GEMINI_API_KEY=your_gemini_api_key
```

### 2. 데이터베이스 설정

Supabase 프로젝트를 생성하고 필요한 테이블들을 설정하세요. 자세한 내용은 `Setup_Guide_Recipe_DB.md`를 참고하세요.

## 📚 문서

주요 문서는 `docs/` 폴더에 정리되어 있습니다:

- `docs/PROJECT_STRUCTURE.md` - 프로젝트 구조 상세 설명
- `docs/IMPLEMENTATION_REPORT.md` - 구현 결과 보고서
- `docs/DEVELOPMENT_ENVIRONMENT.md` - 개발 환경 설정 가이드
- `docs/Setup_Guide_Recipe_DB.md` - 데이터베이스 설정 가이드
- `docs/Cookit_Data_Dictionary.md` - 데이터베이스 자료사전
- `CookitMobile/README.md` - 모바일 앱 상세 문서
- `Server/README.md` - 서버 상세 문서

더 많은 문서는 `docs/` 폴더를 참고하세요.

## 🎯 개발 워크플로우

1. **백엔드 개발**: `Server/` 폴더에서 API 개발
2. **모바일 앱 개발**: `CookitMobile/` 폴더에서 React Native 앱 개발
3. **OCR 기능**: `Recipt+OCR/` 폴더에서 영수증 처리 기능 개발

각 프로젝트는 독립적으로 개발하고 테스트할 수 있습니다.

## 📞 문의

프로젝트 관련 문의사항이 있으시면 개발팀에 연락해주세요.