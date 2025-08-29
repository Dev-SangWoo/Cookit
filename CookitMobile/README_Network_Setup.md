# CookitMobile 네트워크 설정 가이드

## 환경변수 설정

### 1. .env 파일 생성
`CookitMobile` 폴더에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# API 서버 설정 (PC의 실제 IP 주소로 변경)
EXPO_PUBLIC_API_BASE_URL=http://YOUR_PC_IP:3000/api

# Supabase 설정
EXPO_PUBLIC_SUPABASE_URL=https://ujqdizvpkrjunyrcpvtf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. PC IP 주소 확인 방법

#### Windows:
```cmd
ipconfig
```
- "IPv4 주소" 항목에서 IP 주소 확인 (예: 192.168.1.100)

#### macOS/Linux:
```bash
ifconfig
# 또는
ip addr
```

### 3. 서버 실행
```bash
cd Server
npm start
```

### 4. 모바일 앱 실행
```bash
cd CookitMobile
npm start
```

## 현재 설정
- **API Base URL**: http://172.20.1.213:3000/api
- **서버 포트**: 3000
- **모바일 앱**: Expo Go 또는 개발 빌드

## 문제 해결

### 1. 연결 안됨
- PC와 모바일이 같은 Wi-Fi 네트워크에 연결되어 있는지 확인
- 방화벽에서 3000번 포트 허용
- 서버가 실행 중인지 확인

### 2. IP 주소 변경 시
- `.env` 파일의 `EXPO_PUBLIC_API_BASE_URL` 수정
- 모바일 앱 재시작

### 3. 환경변수 적용 안됨
- `.env` 파일이 `CookitMobile` 폴더에 있는지 확인
- Expo 개발 서버 재시작
- 모바일 앱 새로고침
