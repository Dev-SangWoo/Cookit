# 한국어 모델 파일 다운로드 가이드

## 문제 상황
Rhino 초기화 시 다음 오류가 발생하는 경우:
```
Context file (.rhn) and model file (.pv) should belong to the same language. 
File belongs to `ko` while model file (.pv) belongs to `en`.
```

**원인:** Context 파일은 한국어(ko)인데, 기본 모델 파일이 영어(en)로 설정되어 있음

## 해결 방법

### 1. 한국어 모델 파일 다운로드

Picovoice GitHub에서 한국어 모델 파일을 다운로드하세요:

**방법 A: GitHub에서 직접 다운로드**
1. [Picovoice Rhino GitHub](https://github.com/Picovoice/rhino) 접속
2. `lib/common/` 폴더로 이동
3. `ko_android_v3_0_0.pv` 또는 `ko.pv` 파일 다운로드
   - Android: `ko_android_v3_0_0.pv`
   - iOS: `ko_ios_v3_0_0.pv`

**방법 B: 릴리스에서 다운로드**
1. [Rhino Releases](https://github.com/Picovoice/rhino/releases) 접속
2. 최신 버전의 리소스에서 한국어 모델 파일 다운로드

### 2. 파일 배치

**Android:**
- `assets/ko_android_v3_0_0.pv` (또는 `ko.pv`)
- `android/app/src/main/assets/ko_android_v3_0_0.pv` (빌드 시 자동 복사)

**iOS:**
- `assets/ko_ios_v3_0_0.pv` (또는 `ko.pv`)
- XCode에서 번들 리소스로 추가

### 3. 파일명 확인

코드에서 사용하는 파일명:
- `ko_android_v3_0_0.pv` (Android)
- 또는 `ko.pv` (범용)

파일명이 다르면 `RecipeMain.js`의 `modelFileName` 변수를 수정하세요.

---

## 참고 링크
- [Picovoice Rhino GitHub](https://github.com/Picovoice/rhino)
- [Rhino React Native API](https://picovoice.ai/docs/api/rhino-react-native/)
- [Non-English Languages 문서](https://picovoice.ai/docs/quick-start/rhino-react-native/#non-english-languages)

