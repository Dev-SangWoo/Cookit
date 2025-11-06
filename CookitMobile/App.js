import React, { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';

// Auth 관련 imports
import { AuthProvider, AuthNavigator } from '@features/auth';
import { AnalysisProvider } from '@features/recipe';
import notificationService from '@shared/services/notificationService';

// 네비게이션 ref를 전역으로 관리
export const navigationRef = React.createRef();

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // 앱 시작 시 알림 권한 요청 및 토큰 등록
    registerForPushNotifications();

    // 알림 수신 리스너 (앱이 포그라운드일 때)
    notificationListener.current = notificationService.addNotificationListener(
      (notification) => {
        console.log('📩 알림 수신:', notification);
        // 필요시 추가 처리
      }
    );

    // 알림 클릭 리스너
    responseListener.current = notificationService.addNotificationResponseListener(
      (response) => {
        console.log('👆 알림 클릭:', response);
        const data = response.notification.request.content.data;
        
        // 알림 타입에 따라 화면 이동 처리
        handleNotificationPress(data);
      }
    );

    // 클린업
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const registerForPushNotifications = async () => {
    try {
      const token = await notificationService.registerForPushNotificationsAsync();
      console.log('✅ 푸시 알림 설정 완료');
    } catch (error) {
      console.error('❌ 푸시 알림 설정 실패:', error);
    }
  };

  const handleNotificationPress = (data) => {
    const { type, recipeId, ingredientName, recipeTitle } = data || {};
    
    console.log('🔔 알림 타입:', type, data);
    
    // 네비게이션이 준비되지 않았으면 대기
    if (!navigationRef.current) {
      console.log('⏳ 네비게이션 준비 중...');
      setTimeout(() => handleNotificationPress(data), 500);
      return;
    }

    try {
      switch (type) {
        case 'expiry':
          // 유통기한 화면(냉장고)으로 이동 - HomeTab의 Refrigerator 탭
          navigationRef.current.navigate('HomeTab', {
            screen: 'Refrigerator'
          });
          console.log('✅ HomeTab > Refrigerator 탭으로 이동');
          break;
          
        case 'cooking':
          // 요리 완료 알림 - 레시피 화면으로 이동
          if (recipeId) {
            navigationRef.current.navigate('Recipe', {
              screen: 'RecipeMain',
              params: { recipeId }
            });
            console.log('✅ Recipe > RecipeMain 화면으로 이동:', recipeId);
          } else {
            // recipeId가 없으면 HomeTab의 Home 탭으로
            navigationRef.current.navigate('HomeTab', {
              screen: 'Home'
            });
            console.log('✅ HomeTab > Home 탭으로 이동');
          }
          break;
          
        case 'recipe':
          // 레시피 추천 알림 - 레시피 목록으로 이동
          navigationRef.current.navigate('RecipeList');
          console.log('✅ RecipeList 화면으로 이동');
          break;
          
        case 'ingredient':
          // 재료 추가 알림 - HomeTab의 Refrigerator 탭으로 이동
          navigationRef.current.navigate('HomeTab', {
            screen: 'Refrigerator'
          });
          console.log('✅ HomeTab > Refrigerator 탭으로 이동');
          break;
          
        default:
          // 알 수 없는 타입이면 HomeTab의 Home 탭으로
          navigationRef.current.navigate('HomeTab', {
            screen: 'Home'
          });
          console.log('ℹ️ HomeTab > Home 탭으로 이동 (기본)');
          break;
      }
    } catch (error) {
      console.error('❌ 알림 네비게이션 오류:', error);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <AuthProvider>
        <AnalysisProvider>
          <AuthNavigator />
        </AnalysisProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
