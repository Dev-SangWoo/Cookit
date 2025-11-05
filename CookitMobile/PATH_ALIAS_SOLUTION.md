# 긴 상대 경로 문제 해결 방안

## 문제 원인

기능별 모듈화 구조에서 깊은 디렉토리 구조 때문에 다른 feature 모듈을 참조할 때 매우 긴 상대 경로가 필요합니다.

### 예시:
```
features/profile/screens/Profile/ProfileMain.js
  → features/auth/contexts/AuthContext.tsx로 가려면
  → ../../../../auth/contexts/AuthContext (4단계 위로!)
```

## 해결 방법

### 방법 1: Babel Module Resolver (권장)

절대 경로 alias를 설정하여 `@features/auth` 같은 경로 사용 가능

#### 설치
```bash
npm install --save-dev babel-plugin-module-resolver
```

#### babel.config.js 수정
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-worklets/plugin',
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
        blocklist: null,
        allowlist: null,
        safe: false,
        allowUndefined: true,
      }],
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@features': './features',
            '@shared': './shared',
            '@screens': './screens',
            '@assets': './assets',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      ],
    ],
  };
};
```

#### 사용 예시
```javascript
// 이전 (긴 상대 경로)
import { useAuth } from '../../../../auth/contexts/AuthContext';

// 이후 (절대 경로)
import { useAuth } from '@features/auth/contexts/AuthContext';
// 또는
import { useAuth } from '@features/auth';
```

### 방법 2: Feature Index 파일 활용

각 feature의 index.ts를 통해 export하고 사용

#### 예시
```javascript
// features/auth/index.ts
export { useAuth } from './contexts/AuthContext';

// 사용
import { useAuth } from '../../auth'; // 상대 경로는 여전히 필요하지만 더 짧아짐
```

## 추천

**방법 1 (Babel Module Resolver)**을 추천합니다. 
- 더 깔끔한 코드
- 파일 이동 시 경로 수정 불필요
- IDE 자동완성 지원

