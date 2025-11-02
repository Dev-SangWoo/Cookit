import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import AuthScreen from './AuthScreen';
import HomeTab from '../screens/HomeTab';

// Setup 화면들 import
import SetupNickname from '../screens/Setup/SetupNickname';
import SetupProfile from '../screens/Setup/SetupProfile';
import SetupPreference from '../screens/Setup/SetupPreference';
import SetupIngredients from '../screens/Setup/SetupIngredients';

// 화면 imports
import Summary from '../screens/Summary';
import RecipeList from '../screens/RecipeList';
import AIAnalyze from '../screens/AIAnalyze';
import RecipeStack from '../screens/Recipe/RecipeStack';
import SearchStack from '../screens/Search/SearchStack';
import SearchSummary from '../screens/Search/SearchSummary';  // ✅ 추가

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  const { user, loading, isSetupComplete } = useAuth();

  console.log('🔍 AuthNavigator 상태:', {
    user: user ? '로그인됨' : '로그인 안됨',
    loading,
    isSetupComplete,
    userEmail: user?.email
  });

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
        initialRouteName={!user ? "Auth" : "SetupNickname"}
      >
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="SetupNickname" component={SetupNickname} />
            <Stack.Screen name="SetupProfile" component={SetupProfile} />
            <Stack.Screen name="SetupPreference" component={SetupPreference} />
            <Stack.Screen name="SetupIngredients" component={SetupIngredients} />
            <Stack.Screen name="HomeTab" component={HomeTab} />
            <Stack.Screen name="Summary" component={Summary} />
            <Stack.Screen name="RecipeList" component={RecipeList} />
            <Stack.Screen name="AIAnalyze" component={AIAnalyze} />
            <Stack.Screen name="Recipe" component={RecipeStack} />
            <Stack.Screen name="Search" component={SearchStack} />
            <Stack.Screen name="SearchSummary" component={SearchSummary} />
          </>
        )}
      </Stack.Navigator>
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
