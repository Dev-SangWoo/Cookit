### 🍳 Cookit: AI 기반 영상 요리 분석 & 레시피 공유 플랫폼

버전: 1.0.0 (Asynchronous)
프로젝트명: Cookit
개발 형태: 졸업 작품 / 팀 프로젝트

---

### 🧭 프로젝트 개요

Cookit은 YouTube 영상 기반으로 AI가 요리 레시피를 자동 분석하고
사용자들이 레시피를 공유하며 소통할 수 있는 AI 기반 요리 플랫폼입니다.

● 🎬 영상 분석: Whisper + Gemini AI를 통해 요리 과정을 텍스트로 추출 및 요약
● 🧾 OCR 분석: 영수증을 스캔해 재료 정보를 자동으로 인식
● 🧠 AI 레시피 생성: 분석된 데이터를 구조화해 단계별 조리 과정을 JSON 형태로 생성
● 📱 모바일 앱 (Expo 기반): AI 분석 결과를 시각적으로 표시하고, 사용자 간 공유 지원
● 🗄️ 백엔드 (Express + Supabase): 데이터 관리, 사용자 인증, 분석 요청 처리

---

### 🧩 프로젝트 구조
```bash
Cookit-version-1.0.0 -Asynchronous (bedongi)/
├── CookitMobile/         # React Native (Expo) 기반 프론트엔드
│   ├── screens/
│   ├── components/
│   ├── lib/
│   ├── .env.example
│   └── README.md
│
├── Server/               # Node.js + Express 기반 백엔드
│   ├── routes/
│   ├── uploads/
│   ├── tessdata/         # (kor/eng traineddata 저장용, gitignore)
│   ├── .env.example
│   └── README.md
│
├── Recipt+OCR/           # OCR 테스트 모듈 및 보조 스크립트
├── Setup_Guide_Recipe_DB.md  # 데이터베이스 설정 가이드
├── IMPLEMENTATION_COMPLETE.md # 구현 완료 기능 목록
├── .gitignore
└── README.md             # (현재 문서)
```

---

### ⚙️ 실행 방법
### 1️⃣ 환경변수 설정
각 폴더 내 .env.example 파일을 참고하여 .env 생성 후 실제 값으로 교체하세요.
(.env는 절대 깃허브에 올리지 않습니다.)
```bash
cp CookitMobile/.env.example CookitMobile/.env
cp Server/.env.example Server/.env
```

---

### 2️⃣ 서버 실행
``` bash
cd Server
npm install
npm start
```
➡️ 서버 주소: http://192.168.x.x:3000

---

### 3️⃣ 프론트 실행 (Expo)
```bash
cd CookitMobile
npm install
npx expo start
```
➡️ 안드로이드 에뮬레이터: a
➡️ Expo Go (모바일): QR코드 스캔

---

### 🧠 주요 기능
구분	기능	설명
🤖 AI 분석	/api/ai/analyze-youtube	YouTube 영상 URL 기반 자동 분석
🔁 Polling	/api/ai/status/:id	분석 진행 상태 주기적 확인
🧾 OCR 인식	/uploads/receipt	영수증 이미지에서 재료명 추출
🧑‍🍳 레시피 관리	Supabase Recipes Table	JSON 기반 레시피 저장 및 불러오기
👥 사용자 인증	Supabase Auth (Google OAuth)	로그인 / 회원가입 / 세션 유지
❤️ 좋아요 / 댓글	user_post_likes, user_post_comments	커뮤니티 기능

---

### 🗄️ 기술 스택
구분	기술
프론트엔드	React Native (Expo SDK 54), Axios, React Navigation
백엔드	Node.js, Express, Supabase SDK
AI 분석	Whisper, Google Gemini API
OCR 인식	Tesseract.js (kor/eng traineddata)
DB / 인증	Supabase (PostgreSQL + Auth)
보안	helmet, cors, dotenv
배포 환경	GitHub + 로컬 네트워크 실행 (Asynchronous Mode)

---

### 🔐 환경 변수 관리
### 🧩 공통 원칙
● .env는 절대 GitHub에 올리지 않음
● .env.example만 업로드하여 팀원들이 복사해서 사용

### 📱 CookitMobile 예시
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000/api
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### 🧠 Server 예시
```bash
PORT=3000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here
SUPABASE_ANON_KEY=your_anon_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

---

### 📸 OCR 언어 데이터 관리 (중요)

Server/tessdata/ 폴더에 아래 파일이 필요합니다:
● kor.traineddata
● eng.traineddata

⚠️ GitHub에는 포함하지 않습니다.
아래 공식 저장소에서 직접 다운로드하세요:

● kor.traineddata
● eng.traineddata

---

### 🌿 Git / Branch 관리 규칙
브랜치	설명
main	안정 버전 (교수님 제출용)
Asynchronous(bedongi)	AI 비동기 분석 버전 (현재 작업 브랜치)
feature/*	개별 기능 개발용
fix/*	버그 수정용

### 🔁 기본 워크플로우

1. 작업 전 git pull origin main
2. 브랜치 생성: git checkout -b feature/ocr-upload
3. 커밋: git commit -m "Add OCR upload handling"
4. 푸시: git push origin feature/ocr-upload

---

⚠️ 보안 및 주의사항

● .env, google-services.json, GoogleService-Info.plist 등은 GitHub 업로드 금지
● tessdata/ 폴더는 .gitignore에 반드시 포함
● 실제 API 키는 개인 로컬에서만 관리

---

💡 Cookit 1.0.0 (Asynchronous)
“AI가 요리를 이해하고, 사용자는 결과를 공유하는 스마트 레시피 플랫폼”

---
