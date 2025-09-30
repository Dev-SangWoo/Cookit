# 🎉 정리된 AI API 가이드

## 📋 개요

**기존 방식을 모두 제거**하고 **구조화된 JSON 방식만** 남긴 깔끔한 AI API입니다.
YouTube 영상을 넣으면 구조화된 JSON 레시피가 나와서 **자동으로 Supabase DB에 저장**됩니다!

---

## 🛠️ **제공하는 API 엔드포인트**

### **✅ 남은 엔드포인트들**

| 엔드포인트 | 메서드 | 역할 |
|------------|--------|------|
| `/analyze-youtube` | POST | **🎯 메인 기능** - YouTube 영상 → 구조화된 레시피 → DB 저장 |
| `/test` | POST | **🧪 테스트용** - 샘플 텍스트로 JSON 생성 (DB 저장 안 함) |
| `/status` | GET | **📊 상태 확인** - 서비스 상태 및 버전 정보 |
| `/health` | GET | **🔍 헬스체크** - 환경변수 및 모듈 로드 상태 확인 |

### **❌ 제거된 엔드포인트들**

- ~~`/analyze-youtube-structured`~~ → `/analyze-youtube`로 통합
- ~~`/analyze-video`~~ → 파일 업로드 기능 제거
- ~~`/ocr`~~ → 별도 OCR API 제거  
- ~~`/generate-recipe`~~ → 기존 텍스트 방식 제거

---

## 🎯 **메인 API 사용법**

### **YouTube 영상 분석**

```javascript
POST /api/ai/analyze-youtube
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
  "title": "AI 김치찌개 레시피",
  "video_id": "VIDEO_ID", 
  "processing_time": 45,
  "source_url": "https://youtube.com/watch?v=VIDEO_ID"
}
```

---

## 🧪 **테스트 API**

### **샘플 텍스트로 JSON 생성 테스트**

```javascript
POST /api/ai/test
```

**응답:**
```json
{
  "success": true,
  "message": "구조화된 레시피 생성 테스트 완료 - DB 저장은 하지 않음",
  "recipe": {
    "title": "김치찌개",
    "category": "한식",
    "cooking_time": 25,
    "ingredients": [...],
    "instructions": [...],
    // 완전한 JSON 구조
  },
  "note": "DB에 저장하려면 /analyze-youtube 엔드포인트를 사용하세요"
}
```

---

## 📊 **상태 확인 API**

### **서비스 상태 확인**

```javascript
GET /api/ai/status
```

**응답:**
```json
{
  "success": true,
  "status": "active",
  "services": {
    "gemini": true,
    "structured_pipeline": true,
    "supabase_integration": true,
    "ocr": true,
    "ffmpeg": true
  },
  "pipeline_version": "enhanced_structured",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### **헬스체크**

```javascript
GET /api/ai/health
```

**응답:**
```json
{
  "success": true,
  "status": "healthy",
  "pipeline": "enhanced_structured",
  "features": {
    "youtube_analysis": true,
    "structured_json_output": true,
    "automatic_db_storage": true
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🔄 **처리 흐름**

```
📱 프론트엔드
    ↓ YouTube URL 전송
    POST /api/ai/analyze-youtube
    ↓
🖥️ Express 서버 (ai.js)
    ↓ enhanced_ai_pipeline.js 호출
🤖 AI 처리 엔진
    ↓ 1. OCR 분석 (기존 파이프라인)
    ↓ 2. 텍스트 통합 (기존 파이프라인) 
    ↓ 3. 구조화된 Gemini 프롬프트
    ↓ 4. JSON 응답 파싱 & 검증
💾 Supabase DB 자동 저장
    ↓ recipe_id 반환
📱 프론트엔드에 완료 알림
```

---

## 📋 **생성되는 JSON 구조**

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
  "tags": ["김치찌개", "한식", "AI-Generated"],
  "source_url": "https://youtube.com/watch?v=VIDEO_ID",
  "ai_generated": true,
  "is_public": true
}
```

---

## 💻 **프론트엔드 사용 예시**

### **React Native / JavaScript**

```javascript
const analyzeYouTubeVideo = async (videoUrl) => {
  try {
    const response = await fetch('/api/ai/analyze-youtube', {
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
      
      // 바로 DB에서 레시피 상세 정보 조회 가능!
      navigateToRecipe(result.recipe_id);
    } else {
      console.error('❌ 분석 실패:', result.error);
    }
  } catch (error) {
    console.error('❌ 네트워크 오류:', error);
  }
};

// 테스트 API 호출
const testStructuredGeneration = async () => {
  try {
    const response = await fetch('/api/ai/test', {
      method: 'POST',
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('🧪 테스트 성공:', result.recipe);
      // JSON 구조 확인 가능
    }
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  }
};
```

---

## 🔧 **환경변수 설정**

```bash
# .env 파일
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url  
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## ⚡ **성능 및 처리 시간**

| 단계 | 소요 시간 | 설명 |
|------|----------|------|
| **영상 다운로드** | 30초 ~ 2분 | 영상 길이에 따라 |
| **OCR 처리** | 1분 ~ 3분 | 프레임 수에 비례 |
| **Gemini API** | 30초 ~ 1분 | 구조화된 JSON 생성 |
| **DB 저장** | 2초 | Supabase 저장 |

**🎯 총 처리 시간: 2분 ~ 6분**

---

## 🎉 **주요 개선사항**

### **✅ 개선된 점들**

1. **🧹 깔끔한 API**: 4개 엔드포인트만 남김
2. **📦 일관된 구조**: 모든 응답이 구조화됨
3. **⚡ 자동 저장**: DB 저장 과정 완전 자동화
4. **🛡️ 안정성**: 검증된 JSON만 저장
5. **🔧 간편한 사용**: 프론트엔드에서 쉽게 사용

### **❌ 제거된 복잡성**

- 파일 업로드 처리 제거
- 텍스트 파싱 로직 제거  
- 기존 방식 API 제거
- 중복 헬퍼 함수 제거

---

## 🚀 **마이그레이션 가이드**

### **Before (기존 방식)**
```javascript
// 복잡한 기존 방식
POST /api/ai/analyze-youtube-structured  // 또는
POST /api/ai/generate-recipe
POST /api/recipes/from-ai  // 수동 DB 저장
```

### **After (새로운 방식)**  
```javascript
// 간단한 새 방식
POST /api/ai/analyze-youtube
// 끝! DB에 자동 저장됨
```

---

## ✨ **결론**

이제 **단 하나의 API**만 호출하면:
1. 🎬 YouTube 영상 분석
2. 📋 구조화된 JSON 생성  
3. 💾 Supabase DB 자동 저장
4. 📱 recipe_id 즉시 사용 가능

**모든 복잡성을 제거하고 핵심 기능만 남긴 깔끔한 AI API입니다!** 🚀✨
