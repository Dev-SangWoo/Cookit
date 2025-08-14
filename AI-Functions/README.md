# 🤖 AI Functions

요리 영상을 분석하여 레시피를 자동 생성하는 AI 기능들의 모음입니다.

## 📁 구조

```
AI-Functions/
├── 📄 JavaScript Files
│   ├── app.js                          # 메인 애플리케이션
│   ├── ocr_analyze.js                  # OCR 텍스트 추출
│   ├── test_whisper.py                 # Whisper 음성 인식
│   ├── send_to_gemini.js               # Gemini AI 요약
│   ├── generate_combined_text.js        # 텍스트 결합
│   ├── generate_prompt.js              # AI 프롬프트 생성
│   ├── parse_summary_for_firestore.js  # Firestore 파싱
│   └── run_full_pipeline.js            # 전체 파이프라인 실행
│
├── 📂 Data & Results
│   ├── OCR_sub/        # OCR 추출 자막
│   ├── whisper_sub/    # Whisper 음성 인식 결과
│   ├── combined_sub/   # 결합된 자막
│   ├── prompt_out/     # AI 프롬프트
│   ├── result_out/     # 최종 요약 결과
│   ├── parsed_out/     # 파싱된 데이터
│   └── downloads/      # 다운로드 파일들
│
├── 🗂️ ML Models
│   ├── eng.traineddata # Tesseract 영어 모델
│   └── kor.traineddata # Tesseract 한국어 모델
│
└── 🎬 Media Files
    └── video.mp4       # 테스트 영상
```

## 🚀 사용법

### 1. 의존성 설치
```bash
npm install
pip install whisper  # Python Whisper 설치
```

### 2. 전체 파이프라인 실행
```bash
node run_full_pipeline.js
```

### 3. 개별 기능 테스트
```bash
# OCR 분석
node ocr_analyze.js

# Whisper 음성 인식  
python test_whisper.py

# Gemini AI 요약
node send_to_gemini.js

# 텍스트 결합
node generate_combined_text.js
```

## 🔧 설정

### 환경변수 (.env)
```env
GEMINI_API_KEY=your_gemini_api_key
# 기타 필요한 API 키들
```

### API 키 발급
1. **Google Gemini API**: [Google AI Studio](https://makersuite.google.com/)에서 발급
2. **기타 서비스**: 각 서비스 문서 참조

## 📊 워크플로우

```
영상 입력 (video.mp4)
    ↓
OCR 자막 추출 (ocr_analyze.js)
    ↓
음성 인식 (test_whisper.py) 
    ↓
텍스트 결합 (generate_combined_text.js)
    ↓
AI 프롬프트 생성 (generate_prompt.js)
    ↓
Gemini 요약 (send_to_gemini.js)
    ↓
구조화된 레시피 출력 (parse_summary_for_firestore.js)
```

## 🎯 출력 형식

최종 레시피는 다음과 같은 JSON 형식으로 출력됩니다:

```json
{
  "title": "요리 제목",
  "ingredients": ["재료1", "재료2", "..."],
  "steps": ["단계1", "단계2", "..."],
  "cookingTime": "조리 시간",
  "difficulty": "난이도",
  "tags": ["태그1", "태그2", "..."]
}
```

## 🐛 문제해결

### 일반적인 문제들
1. **Tesseract 설치 문제**: 시스템에 Tesseract OCR이 설치되어 있는지 확인
2. **Python 모듈 문제**: `pip install openai-whisper` 실행
3. **API 키 문제**: 환경변수가 올바르게 설정되었는지 확인

### 로그 확인
각 스크립트는 상세한 로그를 출력하므로 오류 발생 시 콘솔을 확인하세요.

---

**AI Team** 🤖✨