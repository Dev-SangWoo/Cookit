# CookIt Mobile App

React Native/Expo 기반의 요리 레시피 앱입니다.

## 🚀 시작하기

### 1. 저장소 클론
```bash
git clone <repository-url>
cd CookitMobile
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경변수 설정
```bash
# .env.example을 .env로 복사
cp .env.example .env

# Windows 사용자는:
copy .env.example .env

# .env 파일을 열어서 실제 값들로 수정
# - EXPO_PUBLIC_SUPABASE_URL: Supabase 프로젝트 URL
# - EXPO_PUBLIC_SUPABASE_ANON_KEY: Supabase 익명 키
```

### 4. 앱 실행
```bash
npx expo start
```

## 📋 환경변수 설정 가이드

### Supabase 설정 방법:

1. [Supabase](https://supabase.com/)에 접속하여 프로젝트 생성 (또는 기존 프로젝트 사용)
2. 프로젝트 대시보드에서 **Settings → API** 페이지로 이동
3. 다음 값들을 복사:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`에 입력
   - **anon public** 키 → `EXPO_PUBLIC_SUPABASE_ANON_KEY`에 입력
4. `.env` 파일에 해당 값들을 입력

### .env 파일 예시:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🤝 협업 가이드

### ⚠️ 중요한 규칙:
- **절대 `.env` 파일을 Git에 커밋하지 마세요!**
- **새로운 환경변수 추가 시 `.env.example`도 함께 업데이트하세요**
- **민감한 정보는 팀 내부 문서나 보안 채널로 공유하세요**

### 새로운 팀원 온보딩:
1. 저장소 클론
2. `npm install` 실행
3. `.env.example`을 `.env`로 복사
4. 팀장에게 Supabase 프로젝트 접근 권한 요청
5. 실제 환경변수 값들을 `.env`에 입력
6. `npx expo start`로 앱 실행

## 📁 프로젝트 구조

```
CookitMobile/
├── components/     # 재사용 가능한 컴포넌트
├── contexts/       # React Context (상태 관리)
├── lib/           # 라이브러리 설정 (Supabase 등)
├── screens/       # 화면 컴포넌트
├── types/         # TypeScript 타입 정의
├── assets/        # 이미지, 폰트 등 정적 파일
├── .env.example   # 환경변수 템플릿
└── README.md      # 이 파일
```

## 🛠️ 기술 스택

- **React Native** + **Expo**
- **TypeScript**
- **Supabase** (백엔드/데이터베이스)
- **React Navigation** (네비게이션)
- **AsyncStorage** (로컬 저장소)

## 📱 지원 플랫폼

- iOS (Expo Go 앱 또는 개발 빌드)
- Android (Expo Go 앱 또는 개발 빌드)
- 웹 (개발 모드)