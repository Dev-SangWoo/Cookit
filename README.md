# 🍳 CookIt - 스마트 요리 플랫폼

요리 영상을 AI로 분석하여 레시피를 자동 생성하는 종합 플랫폼입니다.

## 📁 프로젝트 구조

```
Cookit/
├── 📱 CookitMobile/     # React Native 모바일 앱
├── 🖥️ Server/          # Node.js 백엔드 서버  
├── 🤖 AI-Functions/     # AI 분석 기능들
│   ├── OCR 자막 분석
│   ├── Whisper 음성 인식
│   ├── Gemini AI 요약
│   └── 영상 처리 파이프라인
└── 📄 README.md
```

## 🚀 시작하기

### 📱 모바일 앱 개발
```bash
cd CookitMobile
npm install
cp .env.example .env  # 환경변수 설정 필요
npx expo start
```

### 🖥️ 서버 개발
```bash
cd Server
npm install
npm start
```

### 🤖 AI 기능 사용
```bash
cd AI-Functions
npm install
# 각 JS 파일 실행하여 AI 기능 테스트
```

## 🎯 주요 기능

### 📱 모바일 앱 (CookitMobile)
- **사용자 인증** (Supabase Auth)
- **레시피 탐색 및 저장**
- **요리 과정 가이드**
- **개인화된 추천**

### 🤖 AI 분석 기능 (AI-Functions)
- **OCR 자막 분석** - 영상 내 텍스트 추출
- **Whisper 음성 인식** - 음성을 텍스트로 변환
- **Gemini AI 요약** - 레시피 자동 생성
- **통합 파이프라인** - 전체 분석 프로세스 자동화

### 🖥️ 백엔드 서버 (Server)
- **API 엔드포인트**
- **데이터베이스 연동**
- **인증 관리**

## 🛠️ 기술 스택

### Frontend
- **React Native** + **Expo**
- **TypeScript**
- **Supabase** (인증/데이터베이스)

### Backend
- **Node.js** + **Express**
- **Supabase** (PostgreSQL)

### AI/ML
- **Tesseract.js** (OCR)
- **Whisper API** (음성 인식)
- **Google Gemini** (AI 요약)
- **Python** + **JavaScript**

## 🤝 협업 가이드

### 환경 설정
1. 각 폴더의 `.env.example`을 `.env`로 복사
2. 필요한 API 키들을 설정:
   - Supabase 프로젝트 설정
   - Google Gemini API 키
   - 기타 서비스 API 키들

### 브랜치 전략
- `main`: 배포 가능한 안정 버전
- `feature/*`: 새로운 기능 개발
- `fix/*`: 버그 수정

### 커밋 컨벤션
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 스타일 변경
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 기타 작업
```

## 📝 개발 일정

- [x] 프로젝트 구조 설정
- [x] AI 기능 개발 (OCR, Whisper, Gemini)
- [x] 모바일 앱 기본 구조
- [ ] 사용자 인터페이스 개발
- [ ] API 연동
- [ ] 테스트 및 최적화
- [ ] 배포

## 📞 문의

프로젝트 관련 문의사항은 팀 내부 채널을 이용해주세요.

---

**CookIt Team** 🍳✨