✅ 커뮤니티 기능 기반 README.md (프론트 전달용)
# 🍳 Cookit Mobile - Community Front Integration

이 프로젝트는 Cookit Mobile 앱에서 **커뮤니티 기능**을 구현하기 위한 프론트엔드 연동용 소스 코드입니다.  
Supabase 백엔드 및 OAuth 인증, 게시글 작성/조회/삭제/좋아요/댓글 기능을 포함하고 있습니다.

---

## 📁 폴더 구조 요약

```bash
cookitmobile/
├── app/                   # 페이지 라우팅 구조 (expo-router)
│   ├── (tabs)/            # 탭 내 community/index.tsx, explore.tsx 등
│   ├── community/         # 커뮤니티 상세/작성 페이지
│   ├── +not-found.tsx     # 404 화면
│   ├── _layout.tsx        # 루트 레이아웃
├── services/              # API 요청 모듈
├── contexts/              # 인증 컨텍스트
├── types/                 # 타입 정의
├── babel.config.js        # import alias 설정
├── tsconfig.json          # 타입스크립트 설정
├── package.json           # 종속성 정의
└── app.json               # Expo 앱 설정

🔑 필요한 환경 변수

다음 환경 변수들은 .env 파일로 관리하며, 외부에는 공유되지 않도록 합니다.
.env.example 파일을 참고하여 .env 파일을 생성해주세요:

EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

🚀 설치 및 실행 방법
# 의존성 설치
npm install

# 캐시 제거 후 개발 서버 시작
npx expo start -c

# 안드로이드 에뮬레이터 실행
npx expo run:android

🔐 인증 흐름 (Google OAuth)

Supabase의 Google OAuth를 사용하며, 딥링크는 cookitmobile:// 형태로 처리

모바일에서는 expo-auth-session, expo-linking, SecureStore, AsyncStorage 사용

📌 구현된 커뮤니티 기능
기능	설명
🔓 Google 로그인 / 로그아웃	contexts/AuthContext.tsx
📄 게시글 목록 조회	썸네일로 렌더링 (community/index.tsx)
➕ 게시글 작성	이미지 업로드 포함
💬 게시글 상세 조회	이미지, 본문, 작성자
❤️ 좋아요 기능	toggle 방식
🗑 게시글 삭제	작성자만 가능
💬 댓글 기능	작성자 이름 + 삭제 가능 (본인만)
🔗 Supabase 테이블 요약

user_profiles: 사용자 프로필 정보

user_posts: 커뮤니티 게시글

user_post_likes: 좋아요 기록

user_post_comments: 댓글

백엔드 정책 및 테이블 스키마는 별도 문서를 참조하거나 백엔드 개발자에게 문의

📞 문의

이 프로젝트와 관련된 백엔드 API 및 데이터베이스 구조 문의는
cookit 백엔드 담당에게 문의해주세요.
