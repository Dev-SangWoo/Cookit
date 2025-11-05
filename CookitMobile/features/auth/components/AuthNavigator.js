import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '@features/auth/contexts/AuthContext';
import AuthScreen from '@features/auth/components/AuthScreen';
import HomeTab from '@features/navigation/HomeTab';

// Setup 화면들 import
import SetupNickname from '@features/profile/screens/SetupNickname';
import SetupProfile from '@features/profile/screens/SetupProfile';
import SetupPreference from '@features/profile/screens/SetupPreference';
import SetupIngredients from '@features/refrigerator/screens/SetupIngredients';

// 화면 imports
import Summary from '@features/recipe/screens/Summary';
import RecipeList from '@features/recipe/screens/RecipeList';
import AIAnalyze from '@features/recipe/screens/AIAnalyze';
import RecipeStack from '@features/recipe/screens/Recipe/RecipeStack';
import SearchStack from '@features/recipe/screens/Search/SearchStack';
import ReceiptStack from '@features/refrigerator/screens/Receipt/ReceiptStack';
import SettingsStack from '@features/profile/screens/Profile/SettingsStack';
import CommunityStack from '@features/community/screens/community/CommunityStack';
import ProfileMain from '@features/profile/screens/Profile/ProfileMain';
import ProfileEdit from '@features/profile/screens/Profile/ProfileEdit';
import ProfileAlarm from '@features/profile/screens/Profile/ProfileAlarm';
import ProfileHistory from '@features/profile/screens/Profile/ProfileHistory';
import ProfileLikes from '@features/profile/screens/Profile/ProfileLikes';
import ProfileRecentViewed from '@features/profile/screens/Profile/ProfileRecentViewed';
import ProfileWeekRecipes from '@features/profile/screens/Profile/ProfileWeekRecipes';
import AnalysisFloatingBar from '@shared/components/AnalysisFloatingBar';
import AnalysisHistory from '@features/recipe/screens/AnalysisHistory';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  const { user, loading, isSetupComplete } = useAuth();

  // 디버깅 로그
  console.log('🔍 AuthNavigator 상태:', {
    user: user ? '로그인됨' : '로그인 안됨',
    loading,
    isSetupComplete,
    userEmail: user?.email
  });

  // 로딩 중일 때 스피너 표시
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={!user ? "Auth" : "SetupNickname"} // 테스트용: 인증된 사용자는 SetupNickname으로 시작
      >
        {/* 인증되지 않은 사용자 - 로그인 화면 */}
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          // 테스트용: 인증된 사용자는 무조건 Setup 화면으로 이동
          <>
            <Stack.Screen name="SetupNickname" component={SetupNickname} />
            <Stack.Screen name="SetupProfile" component={SetupProfile} />
            <Stack.Screen name="SetupPreference" component={SetupPreference} />
            <Stack.Screen name="SetupIngredients" component={SetupIngredients} />
            
            {/* Setup 완료 후 사용할 메인 앱 화면들 */}
            <Stack.Screen name="HomeTab" component={HomeTab} />
            <Stack.Screen name="Summary" component={Summary} />
            <Stack.Screen name="RecipeList" component={RecipeList} />
            <Stack.Screen name="AIAnalyze" component={AIAnalyze} />
            <Stack.Screen name="Recipe" component={RecipeStack} />
            <Stack.Screen name="Search" component={SearchStack} />
            <Stack.Screen name="Receipt" component={ReceiptStack} />
            <Stack.Screen name="Settings" component={SettingsStack} />
            <Stack.Screen name="Community" component={CommunityStack} />
            <Stack.Screen name="Profile" component={ProfileMain} />
            <Stack.Screen name="ProfileEdit" component={ProfileEdit} />
            <Stack.Screen name="ProfileAlarm" component={ProfileAlarm} />
            <Stack.Screen name="ProfileHistory" component={ProfileHistory} />
            <Stack.Screen name="ProfileLikes" component={ProfileLikes} />
            <Stack.Screen name="ProfileRecentViewed" component={ProfileRecentViewed} />
            <Stack.Screen name="ProfileWeekRecipes" component={ProfileWeekRecipes} />
            <Stack.Screen name="AnalysisHistory" component={AnalysisHistory} />
          </>
        )}
      </Stack.Navigator>
      {/* 전역 분석 플로팅 바 */}
      <AnalysisFloatingBar />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
});