# 📚 Cookit 프로젝트 - 애플리케이션 자료사전 (Application Data Dictionary)

## 📋 개요
Cookit React Native 애플리케이션에서 사용되는 모든 데이터 구조와 상태 관리를 정의한 자료사전입니다.

---

## 1. 인증 및 사용자 데이터

### 1.1 사용자 인증 상태 (AuthContext)
| 항목명 | 데이터 타입 | 설명 | 초기값 |
|--------|-------------|------|--------|
| user | User \| null | 현재 로그인한 사용자 정보 | null |
| session | Session \| null | Supabase 인증 세션 | null |
| loading | boolean | 인증 상태 로딩 여부 | true |
| isSetupComplete | boolean | 사용자 초기 설정 완료 여부 | false |

### 1.2 사용자 정보 (User Interface)
```typescript
interface User {
  id: string;           // 사용자 고유 ID
  email: string;        // 이메일 주소
  name?: string;        // 사용자 이름 (선택)
  avatar_url?: string;  // 프로필 이미지 URL (선택)
}
```

### 1.3 인증 컨텍스트 메서드
| 메서드명 | 매개변수 | 반환값 | 설명 |
|----------|----------|--------|------|
| signInWithGoogle | - | Promise<void> | Google OAuth 로그인 |
| signOut | - | Promise<void> | 로그아웃 |
| updateUserProfile | Partial<User> | Promise<void> | 사용자 프로필 업데이트 |

---

## 2. 네비게이션 데이터

### 2.1 화면 네비게이션 파라미터
| 화면명 | 파라미터 | 타입 | 설명 |
|--------|----------|------|------|
| **Auth** | - | - | 로그인 화면 |
| **SetupNickname** | - | - | 닉네임 설정 |
| **SetupProfile** | - | - | 프로필 설정 |
| **SetupPreference** | - | - | 선호도 설정 |
| **SetupIngredients** | - | - | 재료 설정 |
| **HomeTab** | - | - | 메인 홈 화면 |
| **Summary** | recipeId | string | 레시피 ID |
| | recipe | Recipe | 레시피 객체 |
| **RecipeMain** | recipeId | string | 레시피 ID |
| | recipe | Recipe | 레시피 객체 |
| **CommunityDetail** | postId | string | 게시글 ID |
| **SearchMain** | query? | string | 검색어 (선택) |

### 2.2 네비게이션 스택 구조
```
AuthNavigator
├── Auth (인증 전)
└── Setup Flow (인증 후)
    ├── SetupNickname
    ├── SetupProfile  
    ├── SetupPreference
    ├── SetupIngredients
    └── Main App
        ├── HomeTab
        ├── Summary
        ├── RecipeMain
        ├── CommunityDetail
        └── SearchMain
```

---

## 3. 레시피 관련 데이터

### 3.1 레시피 객체 (Recipe)
```typescript
interface Recipe {
  id: string;                    // 레시피 ID
  title: string;                 // 레시피 제목
  description?: string;           // 레시피 설명
  ingredients: Ingredient[];      // 재료 목록
  instructions: Instruction[];    // 조리법 목록
  prep_time?: number;            // 준비 시간 (분)
  cook_time?: number;            // 조리 시간 (분)
  servings?: number;             // 인분 수
  difficulty_level: 'easy' | 'medium' | 'hard'; // 난이도
  image_urls?: string[];         // 이미지 URL 배열
  video_url?: string;            // 영상 URL
  ai_generated: boolean;         // AI 생성 여부
  created_at: string;            // 생성일시
  updated_at: string;           // 수정일시
}
```

### 3.2 재료 정보 (Ingredient)
```typescript
interface Ingredient {
  name: string;        // 재료명
  quantity: string;     // 수량
  unit?: string;        // 단위
  notes?: string;       // 특이사항
}
```

### 3.3 조리법 정보 (Instruction)
```typescript
interface Instruction {
  step: number;         // 단계 번호
  instruction: string;   // 조리 설명
  time_required?: number; // 소요 시간 (분)
  image_url?: string;   // 단계별 이미지 URL
  video_url?: string;   // 단계별 영상 URL
}
```

### 3.4 레시피 카드 데이터 (RecipeCard)
```typescript
interface RecipeCard {
  id: string;           // 레시피 ID
  title: string;        // 제목
  description: string;   // 설명
  thumbnail: string;    // 썸네일 이미지 URL
}
```

---

## 4. 커뮤니티 관련 데이터

### 4.1 게시글 데이터 (Post)
```typescript
interface Post {
  post_id: string;              // 게시글 ID
  user_id: string;              // 작성자 ID
  title: string;                // 제목
  content: string;              // 내용
  image_urls?: string[];        // 첨부 이미지 URL 배열
  tags?: string[];              // 태그 배열
  recipe_id?: string;           // 관련 레시피 ID
  created_at: string;           // 작성일시
  updated_at: string;          // 수정일시
  user_profiles?: {             // 작성자 정보
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  like_count?: number;          // 좋아요 수
  comment_count?: number;       // 댓글 수
}
```

### 4.2 댓글 데이터 (Comment)
```typescript
interface Comment {
  id: string;                   // 댓글 ID
  user_id: string;              // 작성자 ID
  post_id: string;              // 게시글 ID
  content: string;              // 댓글 내용
  parent_comment_id?: string;   // 대댓글인 경우 부모 댓글 ID
  created_at: string;           // 작성일시
  updated_at: string;          // 수정일시
  user_profiles?: {             // 작성자 정보
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}
```

### 4.3 좋아요 데이터 (Like)
```typescript
interface Like {
  id: string;        // 좋아요 ID
  user_id: string;   // 사용자 ID
  post_id: string;    // 게시글 ID
  created_at: string; // 생성일시
}
```

---

## 5. 검색 관련 데이터

### 5.1 검색 결과 (SearchResult)
```typescript
interface SearchResult {
  thumbnail: string;  // 썸네일 이미지
  title: string;     // 제목
  creator: string;    // 제작자
  recipeId: string;  // 레시피 ID
}
```

### 5.2 검색 파라미터 (SearchParams)
```typescript
interface SearchParams {
  query?: string;     // 검색어
  page?: number;      // 페이지 번호
  limit?: number;     // 결과 수 제한
  ai_only?: boolean;  // AI 생성 레시피만 검색
}
```

---

## 6. 파일 및 미디어 데이터

### 6.1 이미지 업로드 데이터
```typescript
interface ImageUpload {
  uri: string;        // 로컬 파일 URI
  type: string;       // MIME 타입
  name: string;       // 파일명
  size?: number;      // 파일 크기 (bytes)
}
```

### 6.2 영상 데이터 (Video)
```typescript
interface Video {
  url: string;        // 영상 URL
  videoId?: string;   // YouTube Video ID
  startTime?: number; // 시작 시간 (초)
  endTime?: number;   // 종료 시간 (초)
  loop?: boolean;     // 반복 재생 여부
}
```

---

## 7. 상태 관리 데이터

### 7.1 로딩 상태 (LoadingState)
```typescript
interface LoadingState {
  recipes: boolean;      // 레시피 로딩
  posts: boolean;        // 게시글 로딩
  comments: boolean;     // 댓글 로딩
  profile: boolean;      // 프로필 로딩
  search: boolean;       // 검색 로딩
}
```

### 7.2 에러 상태 (ErrorState)
```typescript
interface ErrorState {
  message: string;       // 에러 메시지
  code?: string;         // 에러 코드
  details?: any;         // 상세 정보
}
```

### 7.3 앱 상태 (AppState)
```typescript
interface AppState {
  isOnline: boolean;     // 네트워크 연결 상태
  isActive: boolean;     // 앱 활성 상태
  currentRoute: string;  // 현재 화면
  deepLink?: string;     // 딥링크 URL
}
```

---

## 8. API 요청/응답 데이터

### 8.1 API 응답 표준 형식
```typescript
interface ApiResponse<T> {
  data?: T;           // 응답 데이터
  error?: string;     // 에러 메시지
  success: boolean;   // 성공 여부
  message?: string;   // 추가 메시지
}
```

### 8.2 페이지네이션 데이터
```typescript
interface PaginatedResponse<T> {
  data: T[];          // 데이터 배열
  page: number;       // 현재 페이지
  limit: number;      // 페이지당 항목 수
  total: number;      // 전체 항목 수
  hasMore: boolean;   // 더 많은 데이터 존재 여부
}
```

### 8.3 레시피 API 요청
```typescript
interface RecipeApiRequest {
  page?: number;      // 페이지 번호
  limit?: number;     // 결과 수 제한
  ai_only?: boolean;  // AI 생성만
  category?: string;  // 카테고리 필터
  search?: string;    // 검색어
}
```

---

## 9. 컴포넌트 Props 데이터

### 9.1 RecipeCard Props
```typescript
interface RecipeCardProps {
  recipe: RecipeCard;           // 레시피 데이터
  onPress: (recipe: RecipeCard) => void; // 클릭 핸들러
  style?: StyleProp<ViewStyle>; // 스타일 (선택)
}
```

### 9.2 PostItem Props
```typescript
interface PostItemProps {
  post: Post;                  // 게시글 데이터
  onPress: (postId: string) => void; // 클릭 핸들러
  onLike?: (postId: string) => void; // 좋아요 핸들러
  onComment?: (postId: string) => void; // 댓글 핸들러
}
```

### 9.3 Modal Props
```typescript
interface ModalProps {
  isVisible: boolean;           // 표시 여부
  onClose: () => void;         // 닫기 핸들러
  onConfirm?: () => void;      // 확인 핸들러
  title?: string;             // 제목 (선택)
  children?: React.ReactNode;  // 내용 (선택)
}
```

---

## 10. 환경 설정 데이터

### 10.1 앱 설정 (AppConfig)
```typescript
interface AppConfig {
  apiBaseUrl: string;         // API 기본 URL
  supabaseUrl: string;        // Supabase URL
  supabaseAnonKey: string;    // Supabase 익명 키
  googleClientId: string;    // Google OAuth 클라이언트 ID
  youtubeApiKey: string;      // YouTube API 키
}
```

### 10.2 환경 변수
| 변수명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| EXPO_PUBLIC_SUPABASE_URL | string | Supabase 프로젝트 URL | https://xxx.supabase.co |
| EXPO_PUBLIC_SUPABASE_ANON_KEY | string | Supabase 익명 키 | eyJhbGciOiJIUzI1NiIs... |
| EXPO_PUBLIC_GOOGLE_CLIENT_ID | string | Google OAuth 클라이언트 ID | 123456789.apps.googleusercontent.com |
| EXPO_PUBLIC_YOUTUBE_API_KEY | string | YouTube API 키 | AIzaSyBxxxxxxxxxxxxxxxxxxxxx |

---

## 11. 이벤트 및 콜백 데이터

### 11.1 네비게이션 이벤트
```typescript
interface NavigationEvent {
  type: 'navigate' | 'goBack' | 'replace' | 'reset';
  route: string;
  params?: Record<string, any>;
  timestamp: number;
}
```

### 11.2 사용자 액션 이벤트
```typescript
interface UserActionEvent {
  action: 'view' | 'like' | 'comment' | 'share' | 'cook';
  targetId: string;
  targetType: 'recipe' | 'post' | 'comment';
  userId: string;
  timestamp: number;
  metadata?: Record<string, any>;
}
```

### 11.3 파일 처리 이벤트
```typescript
interface FileProcessEvent {
  type: 'upload' | 'download' | 'delete';
  fileType: 'image' | 'video' | 'audio' | 'document';
  fileSize: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number; // 0-100
}
```

---

## 12. 데이터 검증 규칙

### 12.1 입력 데이터 검증
| 데이터 타입 | 검증 규칙 | 에러 메시지 |
|-------------|-----------|-------------|
| 이메일 | RFC 5322 표준 | "올바른 이메일 형식이 아닙니다" |
| 비밀번호 | 최소 8자, 영문+숫자 | "비밀번호는 8자 이상이어야 합니다" |
| 닉네임 | 2-20자, 특수문자 제한 | "닉네임은 2-20자 사이여야 합니다" |
| URL | HTTP/HTTPS 프로토콜 | "올바른 URL 형식이 아닙니다" |
| 이미지 | JPG, PNG, GIF만 허용 | "지원하지 않는 이미지 형식입니다" |

### 12.2 비즈니스 로직 검증
| 규칙 | 설명 | 처리 방법 |
|------|------|-----------|
| 중복 좋아요 방지 | 같은 사용자가 같은 게시글에 중복 좋아요 불가 | 기존 좋아요 삭제 후 새로 생성 |
| 댓글 깊이 제한 | 대댓글은 2단계까지만 허용 | 3단계 댓글 작성 시 에러 |
| 파일 크기 제한 | 이미지 최대 10MB | 초과 시 압축 또는 거부 |
| 검색어 길이 | 최소 2자, 최대 100자 | 범위 벗어나면 에러 |

---

## 13. 성능 최적화 데이터

### 13.1 캐싱 전략
| 데이터 타입 | 캐시 시간 | 저장 위치 | 갱신 조건 |
|-------------|-----------|-----------|-----------|
| 사용자 프로필 | 1시간 | AsyncStorage | 프로필 수정 시 |
| 레시피 목록 | 30분 | 메모리 | 새 레시피 추가 시 |
| 게시글 목록 | 15분 | 메모리 | 새 게시글 작성 시 |
| 검색 결과 | 10분 | 메모리 | 검색어 변경 시 |

### 13.2 이미지 최적화
```typescript
interface ImageOptimization {
  maxWidth: number;      // 최대 너비
  maxHeight: number;     // 최대 높이
  quality: number;       // 압축 품질 (0-1)
  format: 'jpeg' | 'png' | 'webp'; // 변환 형식
  thumbnail: boolean;    // 썸네일 생성 여부
}
```

---

## 14. 오프라인 데이터

### 14.1 오프라인 저장 데이터
```typescript
interface OfflineData {
  recipes: Recipe[];     // 즐겨찾기 레시피
  posts: Post[];         // 최근 본 게시글
  searchHistory: string[]; // 검색 기록
  userPreferences: {     // 사용자 설정
    theme: 'light' | 'dark';
    language: string;
    notifications: boolean;
  };
}
```

### 14.2 동기화 상태
```typescript
interface SyncStatus {
  lastSync: number;      // 마지막 동기화 시간
  pendingChanges: number; // 동기화 대기 중인 변경사항 수
  isOnline: boolean;     // 온라인 상태
  syncInProgress: boolean; // 동기화 진행 중
}
```

---

## 15. 디버깅 및 로깅 데이터

### 15.1 로그 레벨
| 레벨 | 설명 | 사용 예시 |
|------|------|-----------|
| ERROR | 에러 발생 | API 호출 실패, 데이터 로딩 실패 |
| WARN | 경고 | 네트워크 연결 불안정, 캐시 만료 |
| INFO | 정보 | 사용자 액션, 네비게이션 |
| DEBUG | 디버그 | API 요청/응답, 상태 변화 |

### 15.2 성능 메트릭
```typescript
interface PerformanceMetrics {
  screenLoadTime: number;    // 화면 로딩 시간 (ms)
  apiResponseTime: number;   // API 응답 시간 (ms)
  imageLoadTime: number;     // 이미지 로딩 시간 (ms)
  memoryUsage: number;       // 메모리 사용량 (MB)
  batteryLevel: number;      // 배터리 잔량 (%)
}
```

이 자료사전은 Cookit React Native 애플리케이션의 모든 데이터 구조와 상태 관리를 포괄적으로 정의합니다. 개발자들이 일관된 데이터 구조를 사용하고, 타입 안정성을 보장할 수 있도록 도와줍니다.

