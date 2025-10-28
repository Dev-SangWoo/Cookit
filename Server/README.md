---

## 🧩 `Server/README.md`

```markdown
# 🧠 Cookit Server (Node.js + Express + Supabase + AI)

Cookit 프로젝트의 백엔드 서버입니다.  
AI 분석 요청, Supabase 연동, OCR(영수증 인식), 사용자 관리 등을 담당합니다.
```
---

## 🚀 실행 환경

- **Node.js:** ≥ 18.x
- **Framework:** Express
- **Database:** Supabase (PostgreSQL)
- **AI API:** Google Gemini (optional)
- **OCR:** Tesseract.js (kor + eng 언어 데이터)

---

## ⚙️ 설치 및 실행

### 1️⃣ 의존성 설치
```bash
npm install
```
### 2️⃣ 환경 변수 설정
.env 파일 생성:

```bash
cp .env.example .env
```
.env 내부는 아래 항목을 포함합니다:

```bash
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here
SUPABASE_ANON_KEY=your_anon_key_here

# Gemini (AI 분석용)
GEMINI_API_KEY=your_gemini_api_key_here

# 파일 업로드
MAX_FILE_SIZE=100mb
UPLOAD_DIR=./uploads

# 네트워크 설정
LOG_LEVEL=info
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
```
### 3️⃣ 서버 실행
```bash
npm start
```
→ http://localhost:3000 또는 http://192.168.x.x:3000 에서 실행됩니다.

---
```arduino
📦 주요 기능
기능	       |  설명
AI 분석 API	 | /api/ai/analyze-youtube — 영상 분석 및 요약
Polling API	 | /api/ai/status/:id — 분석 상태 확인
사용자 관리	 | /api/users
레시피 CRUD	 | /api/recipes
Supabase 연동 |	실시간 데이터 반영
```
🧾 OCR (Tesseract.js)
Cookit Server는 영수증 또는 이미지에서 텍스트를 추출하기 위해 Tesseract.js를 사용합니다.

📂 필요 파일:

```arduino
Server/tessdata/
├── kor.traineddata
├── eng.traineddata
```
이 두 파일은 GitHub에 포함되지 않으며, 아래에서 다운로드할 수 있습니다:

kor.traineddata
eng.traineddata
🔹 다운로드 후 Server/tessdata/ 폴더에 넣으세요.
🔹 없을 경우 OCR 기능만 비활성화됩니다 (서버 실행에는 영향 없음).

---

🧠 기술 스택
```arduino
영역	| 기술
서버	| Node.js + Express
데이터베이스	| Supabase
AI 모델 | Google Gemini API
OCR | Tesseract.js
로깅 | morgan + winston
보안 | helmet, cors
파일 업로드 | multer
```

---

📁 폴더 구조
```pgsql
Server/
├── app.js
├── .env.example
├── routes/
│   ├── ai.js
│   ├── auth.js
│   ├── recipes.js
│   └── userRecipes.js
├── uploads/
├── tessdata/
│   ├── kor.traineddata  (ignored)
│   ├── eng.traineddata  (ignored)
└── package.json
```
---
🔐 보안 주의사항
● .env 파일은 절대 깃허브에 올리지 마세요.
● .env.example만 업로드하세요.
● tessdata/와 uploads/ 폴더는 .gitignore에 포함되어야 합니다.

---

🌐 API 테스트
Postman 또는 curl 명령으로 확인할 수 있습니다:

```bash
POST http://localhost:3000/api/ai/analyze-youtube
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=example"
}
