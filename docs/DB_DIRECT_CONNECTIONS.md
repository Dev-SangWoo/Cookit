# DB 직접 연결 현황

이 문서는 프론트엔드에서 Supabase에 **직접 연결**하는 모든 부분을 정리한 것입니다.

## 📋 목차
1. [게시글 관련](#게시글-관련)
2. [사용자 프로필 관련](#사용자-프로필-관련)
3. [재료 관리 관련](#재료-관리-관련)
4. [레시피 관련](#레시피-관련)
5. [좋아요 관련](#좋아요-관련)
6. [댓글 관련](#댓글-관련)
7. [이미지 스토리지 관련](#이미지-스토리지-관련)

---

## 게시글 관련

### ✅ 서버 API로 마이그레이션 완료

#### `CookitMobile/services/postsApi.ts`
- **서버 API**: `/api/user-posts`
- **작업**: INSERT, SELECT, UPDATE, DELETE
- **함수들**:
  - `createPost()` - POST `/api/user-posts` (게시글 작성)
  - `getPosts()` - GET `/api/user-posts` (목록 조회)
  - `updatePost()` - PUT `/api/user-posts/:postId` (게시글 수정)
  - `deletePost()` - DELETE `/api/user-posts/:postId` (게시글 삭제)
  - `getPostById()` - GET `/api/user-posts/:postId` (단일 조회)
- **참고**: 이미지 업로드는 여전히 클라이언트에서 Supabase Storage에 직접 업로드

#### `CookitMobile/screens/community/CommunityCreate.tsx`
- **이전**: 직접 DB 연결 (`supabase.from('user_posts').insert()`)
- **현재**: 서버 API 사용 (`createPost()`)
- **마이그레이션 완료**: ✅

#### `CookitMobile/screens/Recipe/RecipeRecord.js`
- **이전**: 직접 DB 연결 (`supabase.from('user_posts').insert()`)
- **현재**: 서버 API 사용 (`createPost()`)
- **마이그레이션 완료**: ✅

---

## 사용자 프로필 관련

### ✅ 서버 API로 마이그레이션 완료

#### `Server/routes/users.js` & `Server/routes/recipeCategories.js`
- **서버 API 엔드포인트**:
  - `GET /api/users/profile` - 현재 사용자 프로필 조회
  - `GET /api/users/:userId/profile` - 특정 사용자 프로필 조회 (공개)
  - `PUT /api/users/profile` - 프로필 업데이트
  - `GET /api/users/check-nickname/:nickname` - 닉네임 중복 확인
  - `GET /api/users/:userId/posts` - 사용자 게시글 조회
  - `GET /api/users/stats` - 사용자 통계 조회
  - `GET /api/recipe-categories` - 레시피 카테고리 조회
  - `GET /api/recipe-categories/names` - 카테고리 이름만 조회

#### `CookitMobile/services/userApi.ts` (신규 생성)
- **함수들**:
  - `getMyProfile()` - 현재 사용자 프로필 조회
  - `getUserProfile(userId)` - 특정 사용자 프로필 조회
  - `updateProfile(data)` - 프로필 업데이트
  - `checkNicknameAvailability(nickname)` - 닉네임 중복 확인
  - `getUserPosts(userId)` - 사용자 게시글 조회
  - `getUserStats()` - 사용자 통계 조회
  - `getRecipeCategories()` - 레시피 카테고리 조회
  - `getRecipeCategoryNames()` - 카테고리 이름만 조회

#### 마이그레이션 완료된 화면들

1. **`CookitMobile/screens/Profile/ProfileMain.js`**
   - **이전**: 직접 DB 연결 (`supabase.from('user_profiles').select()`, `supabase.from('user_posts').select()`)
   - **현재**: 서버 API 사용 (`getMyProfile()`, `getUserPosts()`)
   - **마이그레이션 완료**: ✅

2. **`CookitMobile/screens/Profile/ProfileEdit.js`**
   - **이전**: 직접 DB 연결 (`supabase.from('user_profiles').select/update()`, `supabase.from('recipe_categories').select()`)
   - **현재**: 서버 API 사용 (`getMyProfile()`, `updateProfile()`, `checkNicknameAvailability()`, `getRecipeCategoryNames()`)
   - **마이그레이션 완료**: ✅

3. **`CookitMobile/screens/Setup/SetupNickname.js`**
   - **이전**: 직접 DB 연결 (`supabase.from('user_profiles').select/update()`)
   - **현재**: 서버 API 사용 (`checkNicknameAvailability()`, `updateProfile()`)
   - **마이그레이션 완료**: ✅

4. **`CookitMobile/screens/Setup/SetupProfile.js`**
   - **이전**: 직접 DB 연결 (`supabase.from('user_profiles').update()`)
   - **현재**: 서버 API 사용 (`updateProfile()`)
   - **마이그레이션 완료**: ✅

5. **`CookitMobile/screens/Setup/SetupPreference.js`**
   - **이전**: 직접 DB 연결 (`supabase.from('user_profiles').update()`, `supabase.from('recipe_categories').select()`)
   - **현재**: 서버 API 사용 (`updateProfile()`, `getRecipeCategoryNames()`)
   - **마이그레이션 완료**: ✅

#### `CookitMobile/contexts/AuthContext.tsx`
- **테이블**: `user_profiles`
- **작업**: SELECT
- **상태**: 직접 DB 연결 유지 (인증 컨텍스트는 세션 관리용)

---

## 재료 관리 관련

### ✅ 서버 API로 마이그레이션 완료

#### `Server/routes/receiptItems.js`
- **서버 API 엔드포인트**:
  - `GET /api/receipt-items` - 재료 목록 조회
  - `POST /api/receipt-items` - 재료 추가
  - `POST /api/receipt-items/bulk` - 여러 재료 일괄 추가
  - `PUT /api/receipt-items/:itemId` - 재료 수정
  - `DELETE /api/receipt-items/:itemId` - 재료 삭제

#### `CookitMobile/services/receiptItemsApi.ts` (신규 생성)
- **함수들**:
  - `getReceiptItems()` - 재료 목록 조회
  - `addReceiptItem(item)` - 재료 추가
  - `addReceiptItemsBulk(items)` - 여러 재료 일괄 추가
  - `updateReceiptItem(itemId, updates)` - 재료 수정
  - `deleteReceiptItem(itemId)` - 재료 삭제

#### 마이그레이션 완료된 화면들

1. **`CookitMobile/screens/Setup/SetupIngredients.js`**
   - **이전**: 직접 DB 연결 (`supabase.from('receipt_items').insert()`)
   - **현재**: 서버 API 사용 (`addReceiptItemsBulk()`)
   - **마이그레이션 완료**: ✅

2. **`CookitMobile/screens/Home/Ingredients.js`**
   - **이전**: 직접 DB 연결 (SELECT, INSERT, UPDATE, DELETE)
   - **현재**: 서버 API 사용 (`getReceiptItems()`, `addReceiptItem()`, `updateReceiptItem()`, `deleteReceiptItem()`)
   - **마이그레이션 완료**: ✅

---

## 레시피 관련

### 12. `CookitMobile/screens/Recipe/RecipeMain.js`
- **테이블**: `recipes`
- **작업**: SELECT
- **상태**: 읽기 전용 레시피 조회 (서버 API 사용 권장하나 우선순위 낮음)

### 13. `CookitMobile/screens/Summary.js`
- **테이블**: `recipes`
- **작업**: SELECT
- **상태**: 읽기 전용 레시피 조회 (서버 API 사용 권장하나 우선순위 낮음)

### ✅ 14. `CookitMobile/screens/Recipe/RecipeRating.js`
- **이전**: 직접 DB 연결 (`supabase.from('recipe_comments').upsert()`)
- **현재**: 서버 API 사용 (`saveRecipeComment()`)
- **참고**: 좋아요도 서버 API 사용 (`/api/recipe-likes`)
- **마이그레이션 완료**: ✅

---

## 좋아요 관련

### ✅ 서버 API로 마이그레이션 완료

#### `Server/routes/postLikes.js` & `Server/routes/recipeLikes.js`
- **게시글 좋아요 API**:
  - `POST /api/post-likes/:postId` - 게시글 좋아요 토글
  - `GET /api/post-likes/:postId` - 좋아요 상태 확인
  - `GET /api/post-likes/:postId/count` - 좋아요 수 조회
  - `GET /api/post-likes/user/liked` - 좋아요한 게시글 목록
  
- **레시피 좋아요 API**:
  - `POST /api/recipe-likes/:recipeId` - 레시피 좋아요 토글
  - `GET /api/recipe-likes/:recipeId` - 좋아요 상태 확인
  - `GET /api/recipe-likes/:recipeId/count` - 좋아요 수 조회
  - `GET /api/recipe-likes/user/liked` - 좋아요한 레시피 목록
  - `DELETE /api/recipe-likes/user/liked/:likeId` - 좋아요 삭제

#### 마이그레이션 완료된 파일들

1. **`CookitMobile/services/likesApi.ts`** → **삭제됨 ✅**
   - 대체: `postLikesApi.ts` 생성

2. **`CookitMobile/services/postLikesApi.ts`** (신규 생성)
   - `togglePostLike()`, `checkPostLike()`, `getPostLikeCount()`, `getMyLikedPosts()`

3. **`CookitMobile/services/recipeLikesApi.ts`** (신규 생성)
   - `getMyLikedRecipes()`, `deleteRecipeLike()`

4. **`CookitMobile/screens/Profile/ProfileLikes.js`**
   - **이전**: 직접 DB 연결
   - **현재**: 서버 API 사용 (`getMyLikedRecipes()`, `deleteRecipeLike()`)
   - **마이그레이션 완료**: ✅

5. **`CookitMobile/screens/community/CommunityDetail.tsx`**
   - **이전**: 직접 DB 연결
   - **현재**: 서버 API 사용 (`togglePostLike()`, `checkPostLike()`, `getPostLikeCount()`)
   - **마이그레이션 완료**: ✅

---

## 댓글 관련

### ✅ 서버 API로 마이그레이션 완료

#### `Server/routes/comments.js`
- **게시글 댓글 API**:
  - `GET /api/comments/posts/:postId` - 게시글 댓글 목록 조회
  - `POST /api/comments/posts/:postId` - 게시글 댓글 작성
  - `DELETE /api/comments/posts/:commentId` - 게시글 댓글 삭제

- **레시피 댓글 API**:
  - `GET /api/comments/recipes/:recipeId` - 레시피 댓글 목록 조회
  - `POST /api/comments/recipes/:recipeId` - 레시피 댓글(평점) 작성/수정 (UPSERT)
  - `GET /api/comments/recipes/:recipeId/my` - 내 레시피 댓글 조회

#### 마이그레이션 완료된 파일들

1. **`CookitMobile/services/commentsApi.ts`** → **교체됨 ✅**
   - 이전 파일 삭제 후 commentsApiNew.ts를 commentsApi.ts로 리네임
   - 함수들:
     - `getPostComments()`, `createPostComment()`, `deletePostComment()`
     - `getRecipeComments()`, `saveRecipeComment()`, `getMyRecipeComment()`

2. **`CookitMobile/screens/community/CommunityDetail.tsx`**
   - **이전**: 직접 DB 연결
   - **현재**: 서버 API 사용 (`getPostComments()`, `createPostComment()`, `deletePostComment()`)
   - **마이그레이션 완료**: ✅

3. **`CookitMobile/screens/Recipe/RecipeRating.js`**
   - **이전**: 직접 DB 연결
   - **현재**: 서버 API 사용 (`saveRecipeComment()`)
   - **마이그레이션 완료**: ✅

---

## 이미지 스토리지 관련

### 19. 여러 파일에서 Supabase Storage 직접 사용

#### `CookitMobile/screens/community/CommunityCreate.tsx`
- **Storage Bucket**: `user-post-images`
- **작업**: UPLOAD, GET_PUBLIC_URL
- **위치**: 334-347줄

#### `CookitMobile/screens/Recipe/RecipeRecord.js`
- **Storage Bucket**: `user-post-images`
- **작업**: UPLOAD, GET_PUBLIC_URL
- **위치**: 311-322줄

#### `CookitMobile/services/postsApi.ts`
- **Storage Bucket**: `user-post-images`
- **작업**: UPLOAD, GET_PUBLIC_URL

#### `CookitMobile/screens/Home/HomeMain.js`
- **Storage Bucket**: `recipe-images`
- **작업**: GET_PUBLIC_URL (이미지 URL 생성)

#### `CookitMobile/screens/Search/SearchMain.js`
- **Storage Bucket**: `recipe-images`
- **작업**: GET_PUBLIC_URL

#### `CookitMobile/components/RecipeSelectModal.tsx`
- **Storage Bucket**: `recipe-images`
- **작업**: GET_PUBLIC_URL

---

## 서버 API를 사용하는 부분 (마이그레이션 완료)

### ✅ 레시피 좋아요
- **파일**: `CookitMobile/screens/Recipe/RecipeRating.js`
- **API**: `POST /api/recipe-likes/:recipeId`, `GET /api/recipe-likes/:recipeId`, `GET /api/recipe-likes/:recipeId/count`

### ✅ 레시피 목록 조회
- **파일**: `CookitMobile/services/recipeService.js`
- **API**: `GET /api/recipes`, `GET /api/recipes/:recipeId`

### ✅ 게시글 관련 (신규)
- **파일**: `CookitMobile/services/postsApi.ts`
- **API**: `POST /api/user-posts`, `GET /api/user-posts`, `PUT /api/user-posts/:postId`, `DELETE /api/user-posts/:postId`

### ✅ 사용자 프로필 관련 (신규)
- **파일**: `CookitMobile/services/userApi.ts`
- **API**: `GET /api/users/profile`, `PUT /api/users/profile`, `GET /api/users/check-nickname/:nickname`, `GET /api/users/:userId/posts`, `GET /api/users/stats`

### ✅ 레시피 카테고리 (신규)
- **파일**: `CookitMobile/services/userApi.ts`
- **API**: `GET /api/recipe-categories`, `GET /api/recipe-categories/names`

---

## 요약 통계

### 직접 연결되는 테이블들
1. `user_posts` - 게시글
2. `user_profiles` - 사용자 프로필
3. `receipt_items` - 재료 목록
4. `recipes` - 레시피 (읽기만)
5. `recipe_comments` - 레시피 댓글
6. `user_post_likes` - 게시글 좋아요
7. `recipe_likes` - 레시피 좋아요 (일부만)
8. `user_post_comments` - 게시글 댓글
9. `recipe_categories` - 레시피 카테고리

### Storage Buckets
1. `user-post-images` - 게시글 이미지
2. `recipe-images` - 레시피 이미지

### 서버 API 사용
- 레시피 좋아요 (CREATE/READ) ✅
- 레시피 목록 조회 ✅

---

## 마이그레이션 권장사항

### ✅ 완료된 마이그레이션 (전체 완료!)
1. **게시글 작성/수정/삭제** - ✅ 완료
2. **사용자 프로필 수정** - ✅ 완료
3. **레시피 좋아요** - ✅ 완료
4. **재료 관리** - ✅ 완료
5. **게시글 댓글** - ✅ 완료
6. **레시피 댓글** - ✅ 완료
7. **게시글 좋아요** - ✅ 완료

### 🎉 마이그레이션 완료 요약

#### 생성된 서버 API 라우트 (8개)
- `/api/users` - 사용자 프로필
- `/api/recipe-categories` - 레시피 카테고리
- `/api/user-posts` - 게시글
- `/api/recipe-likes` - 레시피 좋아요
- `/api/post-likes` - 게시글 좋아요
- `/api/comments` - 댓글 (게시글 + 레시피)
- `/api/receipt-items` - 재료 관리
- `/api/recipes` - 레시피 (기존)

#### 생성된 프론트엔드 서비스 API (6개)
- `userApi.ts` - 사용자 프로필 및 카테고리
- `postsApi.ts` - 게시글
- `recipeLikesApi.ts` - 레시피 좋아요
- `postLikesApi.ts` - 게시글 좋아요
- `commentsApi.ts` - 댓글
- `receiptItemsApi.ts` - 재료 관리

#### 마이그레이션된 화면 (14개)
1. CommunityCreate.tsx
2. RecipeRecord.js
3. ProfileMain.js
4. ProfileEdit.js
5. ProfileLikes.js
6. SetupNickname.js
7. SetupProfile.js
8. SetupPreference.js
9. SetupIngredients.js
10. Ingredients.js
11. RecipeRating.js
12. CommunityDetail.tsx
13. (기타 게시글/댓글 관련 화면들)

### 미 마이그레이션 항목 (우선순위 낮음)
1. **AuthContext.tsx** - 인증 컨텍스트 (세션 관리용, 유지)
2. **RecipeMain.js, Summary.js** - 읽기 전용 레시피 조회 (서버 API 사용 권장하나 우선순위 낮음)
3. **이미지 스토리지** - Supabase Storage 직접 사용 (CDN 성능상 유지 권장)

