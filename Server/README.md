# Cookit Server 🍳

Cookit 모바일 앱의 백엔드 API 서버입니다.

## 🚀 시작하기

### 필수 요구사항
- Node.js (v14 이상)
- npm 또는 yarn

### 설치 및 실행

1. **프로젝트 클론**
   ```bash
   git clone <repository-url>
   cd Cookit/Server
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**
   ```bash
   # .env 파일을 생성하고 다음 내용을 추가하세요:
   PORT=3000
   NODE_ENV=development
   # 추가 환경 변수는 필요에 따라 설정
   ```

4. **개발 서버 실행**
   ```bash
   npm run dev
   ```
   서버가 성공적으로 시작되면 다음과 같은 메시지가 표시됩니다:
   ```
   🚀 Cookit 서버가 포트 3000에서 실행 중입니다.
   📱 환경: development
   🌐 URL: http://localhost:3000
   ```

5. **프로덕션 서버 실행**
   ```bash
   npm start
   ```

6. **서버 테스트**
   ```bash
   curl http://localhost:3000
   # 또는 브라우저에서 http://localhost:3000 접속
   ```

## 📚 API 엔드포인트

### 기본 엔드포인트
- `GET /` - 서버 상태 확인

**응답 예시:**
```json
{
  "message": "Cookit API 서버가 실행 중입니다!",
  "version": "1.0.0",
  "timestamp": "2025-07-24T00:23:25.302Z"
}
```

### 인증 (Authentication)
- `POST /api/auth/register` - 회원가입
  ```json
  // 요청
  {
    "email": "user@cookit.com",
    "password": "password123",
    "name": "김쿡잇"
  }
  ```

- `POST /api/auth/login` - 로그인
  ```json
  // 요청
  {
    "email": "user@cookit.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/logout` - 로그아웃

### 사용자 (Users)
- `GET /api/users` - 모든 사용자 조회
- `GET /api/users/:id` - 특정 사용자 조회
- `PUT /api/users/:id` - 사용자 정보 수정
- `DELETE /api/users/:id` - 사용자 삭제

**응답 예시:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "김쿡잇",
      "email": "kim@cookit.com",
      "createdAt": "2025-07-24T00:23:25.302Z"
    }
  ]
}
```

### 레시피 (Recipes)
- `GET /api/recipes` - 모든 레시피 조회
- `GET /api/recipes/:id` - 특정 레시피 조회
- `POST /api/recipes` - 새 레시피 생성
- `PUT /api/recipes/:id` - 레시피 수정
- `DELETE /api/recipes/:id` - 레시피 삭제

**응답 예시:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "김치볶음밥",
      "description": "간단하고 맛있는 김치볶음밥 레시피",
      "cookingTime": "15분",
      "difficulty": "쉬움",
      "ingredients": ["밥", "김치", "계란", "대파", "참기름"],
      "author": {
        "id": 1,
        "name": "김쿡잇"
      },
      "createdAt": "2025-07-24T00:23:25.302Z"
    }
  ]
}
```

## 🛠️ 기술 스택

### 메인 프레임워크
- **Node.js** - 런타임 환경
- **Express.js 4.21.2** - 웹 프레임워크

### 미들웨어 & 패키지
- **CORS 2.8.5** - Cross-Origin 요청 처리
- **Helmet 8.0.0** - 보안 헤더 설정
- **Morgan 1.10.0** - HTTP 요청 로깅
- **dotenv 16.4.7** - 환경 변수 관리

### 개발 도구
- **nodemon 3.1.9** - 개발 시 자동 재시작

## 📁 프로젝트 구조

```
Server/
├── routes/              # API 라우터
│   ├── auth.js         # 인증 관련 라우터 (회원가입, 로그인, 로그아웃)
│   ├── users.js        # 사용자 관련 라우터 (CRUD)
│   └── recipes.js      # 레시피 관련 라우터 (CRUD)
├── app.js              # 메인 서버 파일
├── package.json        # 프로젝트 설정 및 의존성
├── package-lock.json   # 정확한 버전 잠금
├── .gitignore         # Git 제외 파일 목록
└── README.md          # 프로젝트 설명 (이 파일)
```

## 🔧 개발 정보

- **기본 포트**: 3000
- **환경**: development/production
- **로깅**: Morgan combined 형식 사용
- **보안**: Helmet 미들웨어로 보안 헤더 자동 설정
- **CORS**: 모든 출처 허용 (개발 환경)
- **JSON 파싱**: express.json() 미들웨어 사용
- **에러 핸들링**: 전역 에러 핸들러 구현

## 📱 모바일 앱과 연동

### CookitMobile (Expo) 앱에서 사용법:

1. **API Base URL 설정**
   ```javascript
   const API_BASE_URL = 'http://localhost:3000/api';
   ```

2. **API 호출 예시**
   ```javascript
   // 레시피 목록 가져오기
   const fetchRecipes = async () => {
     try {
       const response = await fetch(`${API_BASE_URL}/recipes`);
       const data = await response.json();
       return data;
     } catch (error) {
       console.error('API 호출 오류:', error);
     }
   };
   ```

3. **CORS 설정**
   - 현재 모든 출처에서의 요청을 허용하도록 설정됨
   - 프로덕션 환경에서는 특정 도메인만 허용하도록 변경 필요

## 🧪 테스트

### 기본 서버 테스트
```bash
# 서버 상태 확인
curl http://localhost:3000

# 레시피 목록 조회
curl http://localhost:3000/api/recipes

# 사용자 목록 조회
curl http://localhost:3000/api/users
```

### Postman/Insomnia 컬렉션
API 테스트를 위해 Postman이나 Insomnia에서 다음 엔드포인트들을 테스트할 수 있습니다:
- Base URL: `http://localhost:3000`
- Content-Type: `application/json`

## 📝 현재 구현 상태

### ✅ 완료된 기능
- [x] Express 서버 기본 설정
- [x] 라우터 구조 설계 (auth, users, recipes)
- [x] 미들웨어 설정 (CORS, Helmet, Morgan)
- [x] 에러 핸들링
- [x] 개발 환경 설정 (nodemon)
- [x] 기본 API 엔드포인트 구현
- [x] JSON 응답 형식 통일

### 🚧 진행 예정
- [ ] 데이터베이스 연동 (MongoDB/PostgreSQL)
- [ ] JWT 인증 구현
- [ ] 비밀번호 암호화 (bcrypt)
- [ ] 파일 업로드 기능 (multer)
- [ ] 이메일 인증
- [ ] API 문서화 (Swagger)
- [ ] 테스트 코드 작성 (Jest)
- [ ] Docker 설정
- [ ] 배포 설정 (Heroku/AWS)

## 🔍 추가 설정

### 환경 변수 예시
```env
PORT=3000
NODE_ENV=development

# 데이터베이스 (추후 사용)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cookit_db
DB_USER=cookit_user
DB_PASSWORD=your_password

# JWT (추후 사용)
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d

# CORS 설정
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
```

## 🤝 기여하기

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 지원

문제가 발생하거나 질문이 있으시면 다음을 확인해주세요:

1. Node.js와 npm이 올바르게 설치되었는지 확인
2. 포트 3000이 다른 프로세스에 의해 사용되고 있지 않은지 확인
3. 방화벽 설정이 로컬 서버 접근을 차단하지 않는지 확인

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 있습니다. 