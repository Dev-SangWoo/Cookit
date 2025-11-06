# 🍳 Cookit 프로젝트 문서

이 문서는 Cookit 프로젝트의 모든 주요 정보를 통합한 문서입니다.

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [프로젝트 구조](#프로젝트-구조)
3. [주요 기능](#주요-기능)
4. [데이터베이스 구조](#데이터베이스-구조)
5. [개발 환경 설정](#개발-환경-설정)
6. [API 문서](#api-문서)
7. [문제 해결 가이드](#문제-해결-가이드)

---

## 프로젝트 개요

**Cookit**은 AI 기반 요리 레시피 추천 및 관리 모바일 애플리케이션입니다.

### 기술 스택
- **프론트엔드**: React Native (Expo), TypeScript/JavaScript
- **백엔드**: Node.js (Express)
- **데이터베이스**: Supabase (PostgreSQL)
- **AI 서비스**: Google Gemini API
- **인증**: Supabase Auth (Google OAuth)
- **스토리지**: Supabase Storage
- **음성 인식**: Picovoice (Porcupine, Rhino)

### 주요 기능
- YouTube 영상 분석하여 레시피 자동 추출
- 사용자 맞춤형 레시피 추천
- 냉장고 재료 관리 및 유통기한 알림
- 커뮤니티 기능을 통한 레시피 공유
- 음성 제어를 통한 조리 과정 안내

---

## 프로젝트 구조

자세한 내용은 `PROJECT_STRUCTURE.md`를 참고하세요.

---

## 주요 기능

### 1. 레시피 추천 시스템
- 사용자 선호도 기반 추천
- 난이도 기반 추천
- 인기 레시피 추천
- "또 만들고 싶어요" 추천 (완성한 요리 기반)

### 2. 냉장고 관리
- 영수증 OCR을 통한 재료 자동 추가
- 유통기한 알림 (당일 오전 9시)
- 보관 방법별 분류 (냉장/냉동/실온)

### 3. 커뮤니티
- 게시글 작성 및 공유
- 좋아요 및 댓글 기능
- 공개/비공개 설정

### 4. 음성 제어
- Wake Word 감지 (Porcupine)
- 음성 명령 인식 (Rhino)
- 요리 단계 제어

---

## 데이터베이스 구조

자세한 내용은 다음 문서들을 참고하세요:
- `DB.TXT` - 데이터베이스 스키마
- `Cookit_Data_Dictionary.md` - 데이터 사전
- `DB_Analysis.md` - 데이터베이스 분석

---

## 개발 환경 설정

### 1. 환경 변수 설정

**CookitMobile/.env:**
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

**Server/.env:**
```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Firebase 설정
- `CookitMobile/google-services.json` 파일 필요 (Firebase Console에서 다운로드)

### 3. 의존성 설치
```bash
# CookitMobile
cd CookitMobile
npm install

# Server
cd Server
npm install
```

---

## API 문서

주요 API 엔드포인트:
- `GET /api/recipes` - 레시피 목록 조회
- `GET /api/recipes/:id` - 레시피 상세 조회
- `GET /api/recommendations/user` - 사용자 맞춤 추천
- `GET /api/user-posts` - 게시글 목록 조회
- `POST /api/user-posts` - 게시글 작성

자세한 내용은 `Server/README.md`를 참고하세요.

---

## 문제 해결 가이드

자세한 문제 해결 내용은 `IMPLEMENTATION_PROBLEM_SOLVING.md`를 참고하세요.

주요 해결 사항:
- AI 영상 분석 처리 시간 최적화
- Gemini AI 응답 JSON 파싱 개선
- 레시피 추천 시스템 Fallback 로직
- YouTube 플레이어 구간 반복 기능 안정화
- 음성 인식 시스템 Manager 정리 개선

---

## 참고 문서

- `PROJECT_STRUCTURE.md` - 프로젝트 구조 상세 분석
- `DEVELOPMENT_ENVIRONMENT.md` - 개발 환경 설정 가이드
- `Server/README.md` - 서버 API 문서
- `CookitMobile/README.md` - 모바일 앱 문서

---

*이 문서는 프로젝트의 주요 문서들을 통합한 것입니다. 더 자세한 내용은 각 섹션에서 참조하는 개별 문서를 확인하세요.*

