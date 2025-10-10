import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import AuthScreen from './AuthScreen';
import HomeTab from '../screens/HomeTab';

// 화면 imports
import ModalVideo from '../screens/modal/ModalVideo';
import ModalAi from '../screens/modal/ModalAi';
import ModalSave from '../screens/modal/ModalSave';
import ModalSummary from '../screens/modal/ModalSummary';
import Search from '../screens/search';
import Profile from '../screens/Profile';
import Summary from '../screens/Summary';
import SearchList from '../screens/SearchList';
import SummaryChoice from '../screens/SummaryChoice';
import ModalDelete from '../screens/modal/ModalDelete';
import Recipe from '../screens/Recipe';
import RecipeList from '../screens/RecipeList';
import AIAnalyze from '../screens/AIAnalyze';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  const { user, loading } = useAuth();

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
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* 인증되지 않은 사용자 - 로그인 화면 */}
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          // 인증된 사용자 - 메인 앱 화면들
          <>
            <Stack.Screen name="HomeTab" component={HomeTab} />
            <Stack.Screen name="Search" component={Search} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="Summary" component={Summary} />
            <Stack.Screen name="SearchList" component={SearchList} />
                <Stack.Screen name="SummaryChoice" component={SummaryChoice} />
                <Stack.Screen name="Recipe" component={Recipe} />
                <Stack.Screen name="RecipeList" component={RecipeList} />
                <Stack.Screen name="AIAnalyze" component={AIAnalyze} />
            
            {/* 모달 화면들 */}
            <Stack.Screen name="ModalVideo" component={ModalVideo} />
            <Stack.Screen name="ModalAi" component={ModalAi} />
            <Stack.Screen name="ModalSave" component={ModalSave} />
            <Stack.Screen name="ModalSummary" component={ModalSummary} />
            <Stack.Screen name="ModalDelete" component={ModalDelete} />
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