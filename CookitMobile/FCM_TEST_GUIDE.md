# FCM 푸시 알림 테스트 가이드

## 구현 완료 사항 ✅

1. ✅ expo-notifications, expo-device, expo-constants 패키지 설치
2. ✅ app.json에 알림 설정 추가 (Android 권한, 플러그인)
3. ✅ notificationService.js를 실제 FCM 버전으로 교체
4. ✅ App.js에 알림 초기화 코드 추가

---

## 테스트 방법

### 1. 앱 빌드 (필수!)

알림은 **실제 기기**에서만 작동합니다. 개발 빌드를 생성해야 합니다.

#### Development Build 생성:
```bash
cd CookitMobile

# EAS Build 사용 (권장)
npx eas build --profile development --platform android

# 또는 로컬 빌드
npx expo run:android
```

**주의**: Expo Go에서는 FCM이 제대로 작동하지 않습니다!

---

### 2. 실제 기기에 설치

1. 빌드가 완료되면 APK 다운로드
2. 안드로이드 기기에 설치
3. 앱 실행

---

### 3. 알림 권한 확인

앱이 시작되면 자동으로 알림 권한 요청:
- "알림 허용" 클릭
- 콘솔에서 토큰 확인: `📱 Expo Push Token: ExponentPushToken[...]`

---

### 4. 테스트 알림 보내기

#### 방법 1: 앱 내부에서 테스트 (가장 쉬움)

Settings 화면에서 테스트 버튼 클릭:
- 유통기한 알림 테스트
- 요리 완료 알림 테스트
- 레시피 추천 알림 테스트
- 재료 추가 알림 테스트

#### 방법 2: Expo Push Tool 사용

1. https://expo.dev/notifications 접속
2. 콘솔에서 복사한 토큰 입력
   ```
   ExponentPushToken[xxxxxxxxxxxxxx]
   ```
3. 메시지 작성:
   ```json
   {
     "to": "ExponentPushToken[xxxxxxxxxxxxxx]",
     "title": "테스트 알림",
     "body": "FCM이 정상 작동합니다!",
     "data": {
       "type": "test"
     }
   }
   ```
4. "Send a Notification" 클릭

#### 방법 3: 서버에서 직접 전송 (Node.js)

```javascript
const axios = require('axios');

async function sendPushNotification(token) {
  const message = {
    to: token,
    sound: 'default',
    title: '🚨 유통기한 알림',
    body: '우유의 유통기한이 곧 만료됩니다!',
    data: { type: 'expiry', ingredientName: '우유' },
  };

  await axios.post('https://exp.host/--/api/v2/push/send', message, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
}

// 사용
sendPushNotification('ExponentPushToken[xxxxxxxxxxxxxx]');
```

---

### 5. 알림 동작 확인

#### 포그라운드 (앱 실행 중)
- 알림이 화면 상단에 표시됨
- 콘솔: `📩 알림 수신: ...`

#### 백그라운드 (앱이 백그라운드)
- 알림 센터에 표시됨
- 알림 클릭 시 앱이 열림
- 콘솔: `👆 알림 클릭: ...`

---

## 디버깅 팁

### 토큰이 나오지 않는 경우
1. 실제 기기 사용 확인 (에뮬레이터 X)
2. 앱을 Development Build로 빌드했는지 확인
3. 알림 권한이 허용되었는지 확인
4. 콘솔 로그 확인:
   ```
   ⚠️ Push notifications은 실제 기기에서만 작동합니다.
   ```

### 알림이 오지 않는 경우
1. 토큰이 올바른지 확인
2. Expo Push Tool로 테스트
3. 기기 알림 설정 확인:
   - 설정 > 앱 > CookIt > 알림 > 허용
4. 배터리 최적화 제외:
   - 설정 > 배터리 > 배터리 최적화 > CookIt > 최적화 안 함

### Google Services 파일 확인
`google-services.json` 파일이 올바른 위치에 있는지 확인:
```
CookitMobile/
  └── google-services.json
```

---

## 다음 단계

### 서버 연동 (향후 작업)
1. 사용자별 토큰 저장 API 구현
2. 서버에서 푸시 전송 API 구현
3. 유통기한 자동 알림 스케줄링
4. 요리 타이머 완료 알림

### 알림 타입별 네비게이션
`App.js`의 `handleNotificationPress` 함수에 화면 이동 로직 추가:
```javascript
switch (type) {
  case 'expiry':
    navigation.navigate('Ingredients');
    break;
  case 'cooking':
    navigation.navigate('Recipe');
    break;
  // ...
}
```

---

## 참고 자료

- Expo Notifications 문서: https://docs.expo.dev/versions/latest/sdk/notifications/
- Expo Push Notifications: https://docs.expo.dev/push-notifications/overview/
- Firebase Cloud Messaging: https://firebase.google.com/docs/cloud-messaging

---

## 문제 해결

### "Module not found" 에러
```bash
cd CookitMobile
npm install
```

### 빌드 실패
```bash
# 캐시 클리어 후 재시도
npx expo start --clear

# node_modules 재설치
rm -rf node_modules
npm install
```

---

**테스트 완료 후 실제 기기에서 알림이 작동하는지 확인하세요!** 📱


