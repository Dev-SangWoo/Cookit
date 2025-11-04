# Porcupine Wake Word 설정 가이드

## 개요

Porcupine Wake Word는 항상 마이크를 켜두고 특정 단어("porcupine" 등)를 감지하면 Rhino 음성 인식을 활성화하는 기능입니다.

## 현재 구현

### 기본 Wake Word 사용
현재는 기본 영어 wake word "porcupine"을 사용합니다.

```javascript
porcupineManager = await PorcupineManager.fromBuiltInKeywords(
  accessKey,
  [BuiltInKeywords.PORCUPINE],
  wakeWordCallback,
  processErrorCallback
);
```

### 동작 방식
1. **Porcupine**: 항상 wake word를 듣고 있음 (배터리 효율적)
2. **Wake word 감지**: "porcupine" 말하면 감지
3. **Rhino 활성화**: Wake word 감지 후 자동으로 음성 인식 시작
4. **명령 인식**: "다음", "이전", "타이머 3분" 등 명령 실행

## 한국어 커스텀 Wake Word 사용하기

### 1. Picovoice Console에서 Wake Word 생성

1. [Picovoice Console](https://console.picovoice.ai/) 접속
2. **Porcupine** 페이지로 이동
3. **언어 선택**: 한국어 (Korean)
4. **Wake Word 입력**: 원하는 wake word 입력 (예: "쿡잇", "요리 시작", "쿡잇 시작" 등)
5. **검증**: Console에서 wake word 유효성 검사
6. **테스트**: 브라우저에서 마이크로 테스트
7. **학습**: Platform 선택 (Android)
8. **다운로드**: `.ppn` 파일 다운로드

### 2. 파일 배치

**Android:**
- `assets/cookit_ko_android_v3_0_0.ppn` (또는 원하는 파일명)
- `android/app/src/main/assets/cookit_ko_android_v3_0_0.ppn` (빌드 시 자동 복사)

**iOS:**
- `assets/cookit_ko_ios_v3_0_0.ppn`
- XCode에서 번들 리소스로 추가

### 3. 코드 수정

`RecipeMain.js`의 Porcupine 초기화 부분을 수정:

```javascript
// 기존 (기본 wake word)
porcupineManager = await PorcupineManager.fromBuiltInKeywords(
  accessKey,
  [BuiltInKeywords.PORCUPINE],
  wakeWordCallback,
  processErrorCallback
);

// 변경 후 (커스텀 wake word)
const keywordFileName = 'cookit_ko_android_v3_0_0.ppn';
const modelFileName = 'ko_android_v3_0_0.pv'; // 한국어 모델

porcupineManager = await PorcupineManager.fromKeywordPaths(
  accessKey,
  [keywordFileName], // 커스텀 wake word 파일
  wakeWordCallback,
  processErrorCallback,
  modelFileName // 한국어 모델 파일
);
```

### 4. Wake Word 선택 가이드

**좋은 Wake Word:**
- 2-4 음절 (예: "쿡잇", "요리 시작")
- 발음하기 쉬운 단어
- 일상에서 자주 사용하지 않는 단어

**피해야 할 Wake Word:**
- 너무 짧은 단어 (1음절)
- 너무 긴 문구 (5음절 이상)
- 일상에서 자주 사용하는 단어 (오인식 증가)

## 참고 링크

- [Porcupine React Native Quick Start](https://picovoice.ai/docs/quick-start/porcupine-react-native/)
- [Porcupine API Docs](https://picovoice.ai/docs/api/porcupine-react-native/)
- [Wake Word Tips](https://picovoice.ai/docs/porcupine/#wake-word-tips)

## 현재 상태

- ✅ 기본 wake word "porcupine" 사용 중
- ✅ Wake word 감지 후 Rhino 자동 활성화
- ✅ UI에 wake word 상태 표시
- ⏳ 한국어 커스텀 wake word는 설정 필요

