# 📱 네트워크 설정 가이드

API 연결을 위해 환경에 맞는 IP 주소 설정이 필요합니다.

## 🔧 설정 방법

### 1️⃣ IP 주소 확인

**Windows:**
```cmd
ipconfig
```

**macOS/Linux:**
```bash
ifconfig
```

WiFi 어댑터의 IPv4 주소를 확인하세요. 예: `192.168.1.100`

### 2️⃣ recipeService.js 수정

```javascript
// CookitMobile/services/recipeService.js
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:3000/api'          // Android 에뮬레이터
  : 'http://YOUR_IP_HERE:3000/api';     // 실제 디바이스
```

**실제 디바이스에서 테스트할 때:**
```javascript
const API_BASE_URL = 'http://192.168.1.100:3000/api'; // 여기에 실제 IP 입력
```

### 3️⃣ 환경별 설정

| 환경 | IP 주소 |
|------|---------|
| Android 에뮬레이터 | `10.0.2.2` |
| iOS 시뮬레이터 | `localhost` 또는 `127.0.0.1` |
| 실제 디바이스 | PC의 실제 IP (예: `192.168.1.100`) |

### 4️⃣ 서버 실행 확인

```bash
cd Server
npm start
# 🚀 Cookit 서버가 포트 3000에서 실행 중입니다.
```

브라우저에서 `http://localhost:3000` 접속해서 서버 실행 확인

## ⚠️ 주의사항

1. **방화벽 설정**: 포트 3000이 열려있는지 확인
2. **같은 네트워크**: 디바이스와 PC가 같은 WiFi에 연결되어야 함
3. **IP 변경**: WiFi 재연결 시 IP가 바뀔 수 있음

## 🔍 문제 해결

### Network request failed 오류가 계속 나는 경우:

1. **IP 주소 재확인**
2. **서버 실행 상태 확인**
3. **방화벽 설정 확인**
4. **디바이스와 PC가 같은 네트워크인지 확인**

### 현재 설정 (2025-08-28):
```javascript
// 모든 환경에서 실제 IP 사용
const API_BASE_URL = 'http://172.20.1.213:3000/api';
```

### 임시 해결책 (개발용):
```javascript
// 모든 환경에서 실제 IP 사용
const API_BASE_URL = 'http://192.168.1.100:3000/api';
```
