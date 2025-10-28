import { Alert, Platform } from 'react-native';

class NotificationService {
  constructor() {
    this.hasPermission = true; // Alert는 항상 사용 가능
  }

  // 알림 권한 확인 및 요청 (Alert 기반으로 항상 허용됨)
  async getPermissionsAsync() {
    return { status: 'granted' };
  }

  // 알림 권한 요청 (기존 메서드와 호환성 유지)
  async registerForPushNotificationsAsync() {
    return 'alert-token';
  }

  // 즉시 알림 보내기 (Alert 사용)
  async sendNotification(title, body, data = {}) {
    Alert.alert(title, body, [
      { text: '확인', style: 'default' }
    ]);
  }

  // 유통기한 알림 스케줄링 (Alert로 즉시 표시)
  async scheduleExpiryNotification(ingredientName, expiryDate, hoursBefore = 24) {
    const notificationDate = new Date(expiryDate);
    notificationDate.setHours(notificationDate.getHours() - hoursBefore);
    
    // 과거 날짜면 스케줄링하지 않음
    if (notificationDate <= new Date()) {
      return;
    }

    // 즉시 Alert로 표시 (실제로는 스케줄링하지 않음)
    Alert.alert(
      '🚨 유통기한 알림',
      `${ingredientName}의 유통기한이 ${hoursBefore}시간 후입니다!`,
      [{ text: '확인', style: 'default' }]
    );
  }

  // 요리 타이머 알림 (Alert로 즉시 표시)
  async scheduleCookingTimer(minutes, recipeTitle) {
    // 즉시 Alert로 표시 (실제로는 스케줄링하지 않음)
    Alert.alert(
      '🍳 요리 완료!',
      `${recipeTitle} 요리가 완료되었습니다!`,
      [{ text: '확인', style: 'default' }]
    );
  }

  // 테스트용 즉시 알림들
  async sendTestExpiryNotification() {
    Alert.alert(
      '🚨 유통기한 알림',
      '우유의 유통기한이 24시간 후입니다!',
      [{ text: '확인', style: 'default' }]
    );
  }

  async sendTestCookingNotification() {
    Alert.alert(
      '🍳 요리 완료!',
      '김치찌개 요리가 완료되었습니다!',
      [{ text: '확인', style: 'default' }]
    );
  }

  async sendTestRecipeNotification() {
    Alert.alert(
      '📱 새로운 레시피',
      '오늘의 추천 레시피를 확인해보세요!',
      [{ text: '확인', style: 'default' }]
    );
  }

  async sendTestIngredientNotification() {
    Alert.alert(
      '🥬 재료 추가',
      '냉장고에 새로운 재료가 추가되었습니다.',
      [{ text: '확인', style: 'default' }]
    );
  }

  // 모든 알림 취소 (Alert는 취소할 수 없으므로 빈 함수)
  async cancelAllNotifications() {
    console.log('Alert 기반 알림은 취소할 수 없습니다.');
  }

  // 특정 타입의 알림만 취소 (Alert는 취소할 수 없으므로 빈 함수)
  async cancelNotificationsByType(type) {
    console.log('Alert 기반 알림은 취소할 수 없습니다.');
  }

  // 알림 리스너 설정 (Alert는 리스너가 없으므로 빈 함수)
  addNotificationListener(listener) {
    console.log('Alert 기반 알림은 리스너를 지원하지 않습니다.');
    return () => {}; // 빈 제거 함수 반환
  }

  // 알림 응답 리스너 설정 (Alert는 리스너가 없으므로 빈 함수)
  addNotificationResponseListener(listener) {
    console.log('Alert 기반 알림은 리스너를 지원하지 않습니다.');
    return () => {}; // 빈 제거 함수 반환
  }
}

export default new NotificationService();


