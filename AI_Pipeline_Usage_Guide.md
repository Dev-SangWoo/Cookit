# 🤖 개선된 AI 파이프라인 사용 가이드

## 📋 개요

기존 AI 파이프라인을 개선하여 **Supabase 레시피 테이블 구조에 맞는 JSON**을 직접 생성하고 DB에 자동 저장하는 시스템입니다.

---

## 🔄 개선사항

### **기존 방식** vs **개선된 방식**

| 구분 | 기존 방식 | 개선된 방식 |
|------|----------|------------|
| **출력 형태** | 자유형식 텍스트 | **구조화된 JSON** |
| **DB 저장** | 수동 가공 필요 | **자동 저장** |
| **데이터 품질** | 일관성 부족 | **검증된 구조** |
| **프롬프트** | 일반적 요약 | **스키마 기반 명령** |
| **에러 처리** | 텍스트 파싱 오류 | **JSON 검증 & 기본값** |

---

## 📊 Supabase 레시피 테이블 구조

```sql
-- recipes 테이블
CREATE TABLE recipes (
  recipe_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  cooking_time INTEGER,
  prep_time INTEGER,
  servings INTEGER,
  difficulty VARCHAR(20),
  ingredients JSONB,        -- 재료 배열
  instructions JSONB,       -- 조리단계 배열  
  nutrition_info JSONB,     -- 영양정보 객체
  tags TEXT[],              -- 태그 배열
  source_url TEXT,
  ai_generated BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  image_url TEXT,
  view_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  ai_analysis_data JSONB,   -- AI 분석 메타데이터
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 API 엔드포인트

### **1. 구조화된 YouTube 분석 (권장)**

```http
POST /api/ai/analyze-youtube-structured
Content-Type: application/json

{
  "url": "https://youtube.com/watch?v=VIDEO_ID"
}
```

**응답:**
```json
{
  "success": true,
  "message": "레시피가 성공적으로 분석되고 저장되었습니다.",
  "recipe_id": "uuid-here",
  "title": "AI가 생성한 레시피 제목",
  "video_id": "VIDEO_ID",
  "processing_time": 45,
  "source_url": "https://youtube.com/watch?v=VIDEO_ID"
}
```

### **2. 테스트용 API**

```http
POST /api/ai/test-structured
```

샘플 텍스트로 구조화된 레시피 생성을 테스트할 수 있습니다.

### **3. 기존 방식 (호환성 유지)**

```http
POST /api/ai/analyze-youtube
```

기존 텍스트 형태로 결과를 반환합니다.

---

## 🎯 생성되는 JSON 구조

```json
{
  "title": "김치찌개",
  "description": "매콤하고 깊은 맛의 김치찌개 레시피",
  "category": "한식",
  "cooking_time": 25,
  "prep_time": 10,
  "servings": 2,
  "difficulty": "쉬움",
  "ingredients": [
    {
      "name": "돼지고기",
      "quantity": "200g",
      "unit": "g",
      "order": 1
    },
    {
      "name": "김치",
      "quantity": "300g", 
      "unit": "g",
      "order": 2
    }
  ],
  "instructions": [
    {
      "step": 1,
      "title": "재료 준비",
      "instruction": "돼지고기를 한입 크기로 자르고 마늘을 다진다",
      "time": 5,
      "temperature": null,
      "tips": "고기는 냉동실에서 30분 정도 두면 자르기 쉬워요"
    }
  ],
  "nutrition_info": {
    "calories": 350,
    "carbs": "15g",
    "protein": "25g",
    "fat": "12g",
    "serving_size": "1인분"
  },
  "tags": ["김치찌개", "한식", "매운맛", "AI-Generated"],
  "source_url": "https://youtube.com/watch?v=VIDEO_ID",
  "ai_generated": true,
  "is_public": true,
  "image_url": null,
  "view_count": 0,
  "favorite_count": 0
}
```

---

## 🔧 설정 방법

### **1. 환경변수 설정**

```bash
# .env 파일에 추가
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **2. 의존성 설치**

```bash
cd Server
npm install @google/generative-ai
```

### **3. 서버 실행**

```bash
cd Server
npm start
```

---

## 🧪 테스트 방법

### **1. 로컬 테스트**

```bash
# 1. 구조화된 레시피 생성 테스트
curl -X POST http://localhost:3000/api/ai/test-structured

# 2. YouTube 영상 분석 테스트
curl -X POST http://localhost:3000/api/ai/analyze-youtube-structured \
  -H "Content-Type: application/json" \
  -d '{"url": "https://youtube.com/watch?v=SAMPLE_VIDEO_ID"}'
```

### **2. 프론트엔드에서 사용**

```javascript
// React Native / JavaScript
const analyzeYouTubeVideo = async (videoUrl) => {
  try {
    const response = await fetch('http://localhost:3000/api/ai/analyze-youtube-structured', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: videoUrl }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ 레시피 생성 완료:', result.title);
      console.log('📋 레시피 ID:', result.recipe_id);
      
      // DB에서 레시피 상세 정보 조회
      const recipeDetail = await fetch(`/api/recipes/${result.recipe_id}`);
      // ...
    }
  } catch (error) {
    console.error('❌ 분석 실패:', error);
  }
};
```

---

## 📈 처리 흐름

```
📺 YouTube URL 입력
    ↓
🎬 Video ID 추출
    ↓  
🔍 OCR 분석 (기존 파이프라인)
    ↓
📝 텍스트 통합 (기존 파이프라인)
    ↓
🤖 Gemini API 호출 (구조화된 프롬프트)
    ↓
📋 JSON 응답 파싱 & 검증
    ↓
💾 Supabase DB 자동 저장
    ↓
✅ recipe_id 반환
```

---

## 🔍 데이터 검증 규칙

| 필드 | 검증 규칙 | 기본값 |
|------|----------|--------|
| **category** | 한식/중식/양식/일식/분식/디저트/음료 | "한식" |
| **difficulty** | 쉬움/보통/어려움 | "보통" |
| **cooking_time** | 숫자 (분) | 30 |
| **prep_time** | 숫자 (분) | 10 |
| **servings** | 숫자 (인분) | 2 |
| **ingredients** | 배열, order 필드 자동 생성 | [] |
| **instructions** | 배열, step 필드 자동 생성 | [] |

---

## ⚠️ 주의사항

1. **Gemini API 사용량**: 토큰 사용량을 모니터링하세요
2. **처리 시간**: 영상 길이에 따라 2-5분 소요
3. **네트워크**: YouTube 다운로드 시 안정적인 연결 필요
4. **저장공간**: 임시 파일들이 services/ 폴더에 생성됩니다

---

## 🔄 마이그레이션 가이드

### **기존 코드에서 새 API로 전환**

**Before:**
```javascript
// 기존 방식
const response = await fetch('/api/ai/analyze-youtube', {
  method: 'POST',
  body: JSON.stringify({ url: videoUrl })
});

const { recipe } = await response.json();
// 수동으로 DB 저장 로직 필요...
```

**After:**
```javascript
// 개선된 방식
const response = await fetch('/api/ai/analyze-youtube-structured', {
  method: 'POST', 
  body: JSON.stringify({ url: videoUrl })
});

const { recipe_id, title } = await response.json();
// DB에 이미 저장됨! recipe_id로 바로 조회 가능
```

---

## 🎉 예상 효과

- **개발 시간 단축**: 수동 가공 작업 제거
- **데이터 품질 향상**: 일관된 구조 보장  
- **에러 감소**: 검증된 데이터만 DB 저장
- **사용자 경험 개선**: 빠르고 정확한 레시피 생성

구조화된 AI 파이프라인으로 더 안정적이고 사용하기 쉬운 레시피 생성 시스템을 만들어보세요! 🚀
