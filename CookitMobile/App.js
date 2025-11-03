import React, { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';

// Auth 관련 imports
import { AuthProvider } from './contexts/AuthContext';
import { AnalysisProvider } from './contexts/AnalysisContext';
import AuthNavigator from './components/AuthNavigator';
import notificationService from './services/notificationService';

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
        
        // 알림 타입에 따라 화면 이동 처리 가능
        handleNotificationPress(data);
      }
    );

    // 클린업
    return () => {
      try {
        if (notificationListener.current && Notifications.removeNotificationSubscription) {
          Notifications.removeNotificationSubscription(notificationListener.current);
        }
        if (responseListener.current && Notifications.removeNotificationSubscription) {
          Notifications.removeNotificationSubscription(responseListener.current);
        }
      } catch (error) {
        console.warn('알림 리스너 정리 경고:', error.message);
      }
    };
  }, []);

  const registerForPushNotifications = async () => {
    try {
      const token = await notificationService.registerForPushNotificationsAsync();
      console.log('✅ 푸시 알림 설정 완료');
      // TODO: 서버에 토큰 저장
    } catch (error) {
      console.error('❌ 푸시 알림 설정 실패:', error);
    }
  };

  const handleNotificationPress = (data) => {
    const { type } = data || {};
    
    console.log('🔔 알림 타입:', type);
    
    // TODO: 알림 타입에 따라 네비게이션 처리
    // switch (type) {
    //   case 'expiry':
    //     // 유통기한 화면으로 이동
    //     break;
    //   case 'cooking':
    //     // 요리 화면으로 이동
    //     break;
    //   case 'recipe':
    //     // 레시피 화면으로 이동
    //     break;
    //   default:
    //     break;
    // }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AnalysisProvider>
          <AuthNavigator />
        </AnalysisProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
