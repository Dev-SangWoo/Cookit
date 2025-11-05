# 삭제해야 할 파일 목록

리팩토링 후 features/와 shared/로 파일들이 이동했으므로, 기존 디렉토리의 중복 파일들을 삭제해야 합니다.

## ✅ 삭제 가능한 파일들

### 1. `components/` 디렉토리 (전체 삭제 가능)
모든 파일이 `features/*/components/` 또는 `shared/components/`로 이동했습니다.

- ❌ `components/AuthNavigator.js` → ✅ `features/auth/components/AuthNavigator.js`
- ❌ `components/AuthScreen.tsx` → ✅ `features/auth/components/AuthScreen.tsx`
- ❌ `components/GoogleSignInButton.tsx` → ✅ `features/auth/components/GoogleSignInButton.tsx`
- ❌ `components/RecipeCard.js` → ✅ `features/recipe/components/RecipeCard.js`
- ❌ `components/RecipeSelectModal.tsx` → ✅ `features/recipe/components/RecipeSelectModal.tsx`
- ❌ `components/SearchInput.js` → ✅ `shared/components/SearchInput.js`
- ❌ `components/Sort.js` → ✅ `shared/components/Sort.js`
- ❌ `components/WheelDatePicker.js` → ✅ `shared/components/WheelDatePicker.js`
- ❌ `components/YouTubeAnalysisModal.js` → ✅ `features/recipe/components/YouTubeAnalysisModal.js`
- ❌ `components/YouTubePlayer.js` → ✅ `features/recipe/components/YouTubePlayer.js`
- ❌ `components/AnalysisFloatingBar.tsx` → ✅ `shared/components/AnalysisFloatingBar.tsx`

### 2. `contexts/` 디렉토리 (전체 삭제 가능)
모든 파일이 `features/*/contexts/`로 이동했습니다.

- ❌ `contexts/AuthContext.tsx` → ✅ `features/auth/contexts/AuthContext.tsx`
- ❌ `contexts/AnalysisContext.tsx` → ✅ `features/recipe/contexts/AnalysisContext.tsx`

### 3. `services/` 디렉토리 (전체 삭제 가능)
모든 파일이 `features/*/services/` 또는 `shared/services/`로 이동했습니다.

- ❌ `services/commentsApi.ts` → ✅ `features/community/services/commentsApi.ts`
- ❌ `services/postLikesApi.ts` → ✅ `features/community/services/postLikesApi.ts`
- ❌ `services/postsApi.ts` → ✅ `features/community/services/postsApi.ts`
- ❌ `services/receiptItemsApi.ts` → ✅ `features/refrigerator/services/receiptItemsApi.ts`
- ❌ `services/recipeLikesApi.ts` → ✅ `features/recipe/services/recipeLikesApi.ts`
- ❌ `services/recipeService.js` → ✅ `features/recipe/services/recipeService.js`
- ❌ `services/userApi.ts` → ✅ `features/profile/services/userApi.ts`
- ❌ `services/notificationService.js` → ✅ `shared/services/notificationService.js`

### 4. `lib/` 디렉토리 (전체 삭제 가능)
모든 파일이 `shared/lib/`로 이동했습니다.

- ❌ `lib/supabase.ts` → ✅ `shared/lib/supabase.ts`

### 5. `screens/` 디렉토리 (부분 삭제)
일부 파일은 여전히 사용 중이지만, 많은 파일들이 `features/*/screens/`로 이동했습니다.

#### ❌ 삭제 가능한 파일들:
- `screens/Summary.js` → ✅ `features/recipe/screens/Summary.js` (또는 `screens/Summary.js`는 여전히 사용 중일 수 있음)
- `screens/RecipeList.js` → ✅ `features/recipe/screens/RecipeList.js`
- `screens/AIAnalyze.js` → ✅ `features/recipe/screens/AIAnalyze.js`
- `screens/Recipe/` (전체) → ✅ `features/recipe/screens/Recipe/`
- `screens/Search/` (전체) → ✅ `features/recipe/screens/Search/`
- `screens/community/` (전체) → ✅ `features/community/screens/community/`
- `screens/Profile/` (전체) → ✅ `features/profile/screens/Profile/`
- `screens/Receipt/` (전체) → ✅ `features/refrigerator/screens/Receipt/`
- `screens/Setup/` (전체) → ✅ `features/profile/screens/Setup*` 또는 `features/refrigerator/screens/Setup*`
- `screens/Home/Ingredients.js` → ✅ `features/refrigerator/screens/Ingredients.js`

#### ✅ 이미 이동 완료된 파일들 (삭제 가능):
- ❌ `screens/Home/HomeMain.js` → ✅ `features/recipe/screens/HomeMain.js` (이동 완료)
- ❌ `screens/AnalysisHistory.tsx` → ✅ `features/recipe/screens/AnalysisHistory.tsx` (이동 완료)
- ❌ `screens/Settings/SettingsStack.js` → ✅ `features/settings/screens/SettingsStack.js` (이동 완료)
- ❌ `screens/HomeTab.tsx` → ✅ `features/navigation/HomeTab.tsx` (이동 완료)

## 📝 삭제 명령어

### 안전한 삭제 (확실히 중복인 파일들)
```bash
# components 디렉토리 전체 삭제
rm -rf CookitMobile/components

# contexts 디렉토리 전체 삭제
rm -rf CookitMobile/contexts

# services 디렉토리 전체 삭제
rm -rf CookitMobile/services

# lib 디렉토리 전체 삭제
rm -rf CookitMobile/lib
```

### 주의가 필요한 삭제 (screens/)
```bash
# screens 디렉토리 내부의 일부만 삭제
rm -rf CookitMobile/screens/Summary.js
rm -rf CookitMobile/screens/RecipeList.js
rm -rf CookitMobile/screens/AIAnalyze.js
rm -rf CookitMobile/screens/Recipe
rm -rf CookitMobile/screens/Search
rm -rf CookitMobile/screens/community
rm -rf CookitMobile/screens/Profile
rm -rf CookitMobile/screens/Receipt
rm -rf CookitMobile/screens/Setup
rm -rf CookitMobile/screens/Home/Ingredients.js
```

## ⚠️ 주의사항

1. **삭제 전 확인**: 모든 import 경로가 `@features/*` 또는 `@shared/*`를 사용하는지 확인
2. **테스트**: 삭제 후 앱이 정상 작동하는지 테스트
3. **백업**: Git commit 후 삭제 (되돌릴 수 있도록)

