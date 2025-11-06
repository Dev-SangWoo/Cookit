import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// 알림이 포그라운드에 올 때 표시 방식 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.hasPermission = false;
  }

  // 알림 권한 요청
  async getPermissionsAsync() {
    if (!Device.isDevice) {
      console.warn('⚠️ Push notifications은 실제 기기에서만 작동합니다.');
      return { status: 'denied' };
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('⚠️ 푸시 알림 권한이 거부되었습니다!');
      return { status: 'denied' };
    }

    this.hasPermission = true;
    return { status: 'granted' };
  }

  // Expo Push Token 가져오기
  async registerForPushNotificationsAsync() {
    try {
      const permission = await this.getPermissionsAsync();
      if (permission.status !== 'granted') {
        throw new Error('알림 권한이 필요합니다.');
      }

      // Expo Push Token 가져오기
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.warn('⚠️ EAS projectId가 설정되지 않았습니다.');
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      this.expoPushToken = tokenData.data;
      console.log('📱 Expo Push Token:', this.expoPushToken);
      
      // TODO: 서버에 토큰 전송
      // await this.sendTokenToServer(this.expoPushToken);

      return this.expoPushToken;
    } catch (error) {
      console.error('❌ 푸시 토큰 등록 실패:', error);
      throw error;
    }
  }

  // 서버에 토큰 전송 (향후 구현)
  async sendTokenToServer(token) {
    try {
      // TODO: 서버 API에 토큰 전송
      console.log('📤 서버에 토큰 전송 준비:', token);
      // const response = await fetch('YOUR_SERVER/api/notifications/token', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token }),
      // });
    } catch (error) {
      console.error('❌ 토큰 전송 실패:', error);
    }
  }

  // 즉시 알림 보내기
  async sendNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // 즉시 전송
      });
    } catch (error) {
      console.error('❌ 알림 전송 실패:', error);
      throw error;
    }
  }

  // 로컬 알림 스케줄링
  async scheduleNotification(title, body, data = {}, trigger = null) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger,
      });

      console.log('✅ 알림 스케줄 완료:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('❌ 알림 스케줄링 실패:', error);
      throw error;
    }
  }

  // 유통기한 알림 스케줄링 (당일 알림)
  async scheduleExpiryNotification(ingredientName, expiryDate, hoursBefore = 0) {
    // expiryDate를 Date 객체로 변환
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0); // 당일 00:00:00으로 설정
    
    // 알림 시간 설정 (당일 오전 9시)
    const notificationDate = new Date(expiry);
    notificationDate.setHours(9, 0, 0, 0); // 오전 9시

    // 과거 날짜면 스케줄링하지 않음
    if (notificationDate <= new Date()) {
      console.log('⏭️ 유통기한이 이미 지났거나 오늘 이전이어서 스케줄링하지 않습니다.');
      return null;
    }

    const trigger = {
      date: notificationDate,
    };

    return await this.scheduleNotification(
      '🚨 유통기한 알림',
      `${ingredientName}의 유통기한이 오늘입니다!`,
      { type: 'expiry', ingredientName, expiryDate },
      trigger
    );
  }

  // 유통기한 알림 스케줄링 (N일 전 알림 - 선택사항)
  async scheduleExpiryNotificationBefore(ingredientName, expiryDate, daysBefore = 1) {
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    
    // N일 전 날짜 계산
    const notificationDate = new Date(expiry);
    notificationDate.setDate(notificationDate.getDate() - daysBefore);
    notificationDate.setHours(9, 0, 0, 0); // 오전 9시

    // 과거 날짜면 스케줄링하지 않음
    if (notificationDate <= new Date()) {
      console.log(`⏭️ 유통기한 ${daysBefore}일 전 알림이 이미 지나서 스케줄링하지 않습니다.`);
      return null;
    }

    const trigger = {
      date: notificationDate,
    };

    return await this.scheduleNotification(
      '⚠️ 유통기한 임박 알림',
      `${ingredientName}의 유통기한이 ${daysBefore}일 후입니다!`,
      { type: 'expiry', ingredientName, expiryDate },
      trigger
    );
  }

  // 요리 타이머 알림
  async scheduleCookingTimer(minutes, recipeTitle) {
    const trigger = {
      seconds: minutes * 60,
    };

    return await this.scheduleNotification(
      '🍳 요리 완료!',
      `${recipeTitle} 요리가 완료되었습니다!`,
      { type: 'cooking', recipeTitle },
      trigger
    );
  }

  // 모든 알림 취소
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('✅ 모든 알림 취소 완료');
    } catch (error) {
      console.error('❌ 알림 취소 실패:', error);
    }
  }

  // 특정 알림 취소
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('✅ 알림 취소 완료:', notificationId);
    } catch (error) {
      console.error('❌ 알림 취소 실패:', error);
    }
  }

  // 타입별 알림 취소 (구현 필요 시)
  async cancelNotificationsByType(type) {
    console.log('⚠️ 타입별 알림 취소는 아직 구현되지 않았습니다.');
  }

  // 알림 수신 리스너 추가
  addNotificationListener(listener) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  // 알림 클릭 리스너 추가
  addNotificationResponseListener(listener) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  // 배지 카운트 설정
  async setBadgeCount(count) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('❌ 배지 설정 실패:', error);
    }
  }

  // 배지 제거
  async clearBadge() {
    await this.setBadgeCount(0);
  }

  // === 테스트 알림들 ===

  async sendTestExpiryNotification() {
    await this.sendNotification(
      '🚨 유통기한 알림',
      '우유의 유통기한이 24시간 후입니다!',
      { type: 'expiry', test: true }
    );
  }

  async sendTestCookingNotification() {
    await this.sendNotification(
      '🍳 요리 완료!',
      '김치찌개 요리가 완료되었습니다!',
      { type: 'cooking', test: true }
    );
  }

  async sendTestRecipeNotification() {
    await this.sendNotification(
      '📱 새로운 레시피',
      '오늘의 추천 레시피를 확인해보세요!',
      { type: 'recipe', test: true }
    );
  }

  async sendTestIngredientNotification() {
    await this.sendNotification(
      '🥬 재료 추가',
      '냉장고에 새로운 재료가 추가되었습니다.',
      { type: 'ingredient', test: true }
    );
  }
}

export default new NotificationService();
