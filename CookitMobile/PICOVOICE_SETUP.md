# Picovoice 음성 명령 설정 가이드

## 1. Picovoice Access Key 발급

### 단계 1: 계정 생성
1. [Picovoice Console](https://console.picovoice.ai/) 접속
2. 무료 계정 가입 (GitHub, Google, 이메일로 가능)

### 단계 2: Access Key 발급
1. Console 로그인
2. 상단 메뉴에서 "Access Keys" 클릭
3. "Create Access Key" 버튼 클릭
4. Key 이름 입력 (예: "CookIt-Development")
5. 생성된 Access Key 복사

### 단계 3: Access Key 적용
`.env` 파일을 열고 `EXPO_PUBLIC_PICOVOICE_ACCESS_KEY` 값을 설정:
```bash
# .env 파일
EXPO_PUBLIC_PICOVOICE_ACCESS_KEY=px_ABC123XYZ...  # 복사한 실제 Access Key
```

**참고:** `.env.example` 파일에 예제가 있습니다.

---

## 2. Rhino Context 파일 생성

### 옵션 A: Picovoice Console에서 생성 (추천)

1. [Rhino Console](https://console.picovoice.ai/rhino) 접속
2. "Create New Context" 클릭
3. 언어 선택: **Korean (한국어)**
4. Context 이름: `cooking_commands`

#### 명령어 정의:
```yaml
# Intent: next
Expressions:
  - 다음
  - 다음 단계
  - 넥스트

# Intent: previous
Expressions:
  - 이전
  - 이전 단계
  - 뒤로

# Intent: timer
Expressions:
  - 타이머 $minutes:number 분
  - $minutes:number 분 타이머

Slots:
  number: [일, 이, 삼, 사, 오, 육, 칠, 팔, 구, 십]

# Intent: stop
Expressions:
  - 중지
  - 정지
  - 멈춰
```

5. "Train" 버튼 클릭 (학습 시간: 약 1-2분)
6. 학습 완료 후 "Download" 버튼 클릭
7. `.rhn` 파일을 다운로드
8. 파일을 `CookitMobile/assets/rhino_context.rhn` 경로로 이동

#### Context 파일 경로 업데이트:
`screens/Recipe/RecipeMain.js` 파일의 553번 줄:
```javascript
require('./rhino_context.rhn') // 또는
'path/to/your/rhino_context.rhn'
```

---

### 옵션 B: 기본 Context 파일 사용

이미 생성된 `rhino_context.rhn` 파일을 사용하려면:

1. `assets` 폴더 생성 (없는 경우)
2. `rhino_context.rhn` 파일을 `assets/` 폴더로 이동
3. RecipeMain.js에서 경로 수정:
```javascript
require('../assets/rhino_context.rhn')
```

---

## 3. 테스트

### 음성 명령 테스트:
1. 앱 실행
2. 레시피 화면으로 이동
3. 음성 제어 활성화
4. 테스트 명령어:
   - 🗣️ **"다음"** → 다음 단계
   - 🗣️ **"이전"** → 이전 단계
   - 🗣️ **"타이머 삼 분"** → 3분 타이머
   - 🗣️ **"중지"** → 타이머 중지

---

## 4. 문제 해결

### Access Key 오류
```
Error: Invalid Access Key
또는
Picovoice Access Key 필요
```
**해결:**
1. `.env` 파일에 `EXPO_PUBLIC_PICOVOICE_ACCESS_KEY`가 설정되었는지 확인
2. Access Key가 올바르게 복사되었는지 확인
3. 앱을 재시작 (`npx expo start --clear`)

### Context 파일 오류
```
Error: Unable to load context file
```
**해결:**
1. Context 파일 경로가 올바른지 확인
2. 파일이 `.rhn` 확장자인지 확인
3. 파일이 Picovoice Console에서 학습된 파일인지 확인

### 마이크 권한 오류
```
Error: Microphone permission denied
```
**해결:**
- 설정 → 앱 → CookIt → 권한 → 마이크 허용

---

## 5. 무료 티어 제한

- **월 3개 디바이스까지 무료**
- 개발 중에는 충분
- 프로덕션 배포 시 유료 플랜 필요

---

## 6. 고급 설정

### Wake Word 추가 (선택사항)
"쿡잇" 같은 웨이크 워드로 음성 인식 활성화:

```bash
npm install @picovoice/porcupine-react-native
```

### 더 많은 명령어 추가
Rhino Console에서 Context를 수정하여 명령어 추가:
- "반복" → 현재 단계 반복
- "처음부터" → 첫 단계로 이동
- "종료" → 요리 종료

---

## 참고 자료
- [Picovoice 공식 문서](https://picovoice.ai/docs/)
- [Rhino React Native SDK](https://github.com/Picovoice/rhino/tree/master/binding/react-native)
- [한국어 음성 인식 가이드](https://picovoice.ai/docs/quick-start/rhino-react-native/)

