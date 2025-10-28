# 🍳 Cookit Mobile App (Expo / React Native)

AI 기반 영상 요리 분석 및 레시피 공유 플랫폼 **Cookit**의 모바일 프론트엔드입니다.  
Expo 환경에서 구동되며, Supabase와 연동되어 회원가입 / 로그인 / 레시피 불러오기 / AI 분석 기능을 제공합니다.

---

## 🚀 실행 환경

- **Expo SDK:** 54
- **Node.js:** ≥ 18.x
- **React Native:** 0.81.x
- **패키지 매니저:** npm or yarn

---

## ⚙️ 설치 및 실행

### 1️⃣ 의존성 설치
```bash
npm install
2️⃣ 환경 변수 설정
프로젝트 루트(CookitMobile/)에 .env 파일을 생성하고, 예시를 참고하여 실제 값으로 변경합니다.

bash
코드 복사
cp .env.example .env
.env 예시:

bash
코드 복사
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000/api
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_APP_VERSION=1.0.0
3️⃣ 실행 (안드로이드 에뮬레이터 또는 Expo Go)
bash
코드 복사
npx expo start
Android: a

iOS (Mac 환경): i

웹 브라우저: w

🔐 주의사항
.env 파일은 절대 깃허브에 올리지 마세요.

대신 .env.example만 공유해 팀원이 복사해서 사용합니다.

실제 API 서버 IP는 로컬 네트워크 환경에 맞게 변경해야 합니다 (예: http://192.168.0.10:3000/api).

📦 주요 기술 스택
영역	기술
Framework	React Native (Expo)
Backend 연동	Supabase
인증	Supabase Auth (Google OAuth 지원)
스타일링	React Native StyleSheet
HTTP 통신	Axios
AI 분석 결과 Polling	Custom interval polling (15초 간격)

📁 폴더 구조
arduino
코드 복사
CookitMobile/
├── app.config.js
├── app.json
├── .env.example
├── screens/
│   ├── AIAnalyze.js
│   ├── RecipeMain.js
│   ├── RecipeSummary.js
│   └── Setup/
├── components/
├── lib/
│   └── supabase.js
└── assets/
