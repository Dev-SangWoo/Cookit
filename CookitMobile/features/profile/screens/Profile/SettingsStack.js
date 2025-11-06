import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from '@shared/services/notificationService';

export default function SettingsStack({ navigation }) {
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    expiryNotifications: true,
    cookingTimer: true,
    pushNotifications: true,
    expiryHoursBefore: 24,
  });

  useEffect(() => {
    checkNotificationPermission();
    loadNotificationSettings();
  }, []);

  // 알림 권한 확인
  const checkNotificationPermission = async () => {
    try {
      const { status } = await notificationService.getPermissionsAsync();
      setNotificationPermission(status === 'granted');
    } catch (error) {
      console.error('알림 권한 확인 실패:', error);
    }
  };

  // 알림 설정 로드
  const loadNotificationSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      if (settings) {
        setNotificationSettings(JSON.parse(settings));
      }
    } catch (error) {
      console.error('설정 로드 실패:', error);
    }
  };

  // 알림 권한 요청
  const requestNotificationPermission = async () => {
    try {
      const token = await notificationService.registerForPushNotificationsAsync();
      if (token) {
        setNotificationPermission(true);
        Alert.alert('성공', '알림 권한이 허용되었습니다.');
      } else {
        Alert.alert('실패', '알림 권한을 허용해주세요.');
      }
    } catch (error) {
      console.error('알림 권한 요청 실패:', error);
      Alert.alert('오류', '알림 권한 요청에 실패했습니다.');
    }
  };

  // 설정 변경
  const handleSettingChange = async (key, value) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('설정 저장 실패:', error);
      Alert.alert('오류', '설정 저장에 실패했습니다.');
    }
  };

  // 테스트 알림들
  const sendTestExpiryNotification = async () => {
    try {
      await notificationService.sendTestExpiryNotification();
      Alert.alert('성공', '유통기한 테스트 알림을 보냈습니다.');
    } catch (error) {
      Alert.alert('오류', '테스트 알림 전송에 실패했습니다.');
    }
  };

  const sendTestCookingNotification = async () => {
    try {
      await notificationService.sendTestCookingNotification();
      Alert.alert('성공', '요리 완료 테스트 알림을 보냈습니다.');
    } catch (error) {
      Alert.alert('오류', '테스트 알림 전송에 실패했습니다.');
    }
  };

  const sendTestRecipeNotification = async () => {
    try {
      await notificationService.sendTestRecipeNotification();
      Alert.alert('성공', '레시피 추천 테스트 알림을 보냈습니다.');
    } catch (error) {
      Alert.alert('오류', '테스트 알림 전송에 실패했습니다.');
    }
  };

  const sendTestIngredientNotification = async () => {
    try {
      await notificationService.sendTestIngredientNotification();
      Alert.alert('성공', '재료 추가 테스트 알림을 보냈습니다.');
    } catch (error) {
      Alert.alert('오류', '테스트 알림 전송에 실패했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Image 
            source={require('@assets/app_logo.png')} 
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>알림 설정</Text>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        {/* 알림 권한 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>알림 권한</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={24} color="#FF6B35" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>알림 권한</Text>
                <Text style={styles.settingDescription}>
                  {notificationPermission ? '알림이 허용되었습니다' : '알림 권한이 필요합니다'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.permissionButton,
                notificationPermission ? styles.permissionButtonGranted : styles.permissionButtonDenied
              ]}
              onPress={requestNotificationPermission}
            >
              <Text style={[
                styles.permissionButtonText,
                notificationPermission ? styles.permissionButtonTextGranted : styles.permissionButtonTextDenied
              ]}>
                {notificationPermission ? '허용됨' : '권한 요청'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 알림 설정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>알림 설정</Text>
          
          {/* 유통기한 알림 */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="time" size={24} color="#FF6B35" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>유통기한 알림</Text>
                <Text style={styles.settingDescription}>
                  재료 유통기한 임박 시 알림
                </Text>
              </View>
            </View>
            <Switch
              value={notificationSettings.expiryNotifications}
              onValueChange={(value) => handleSettingChange('expiryNotifications', value)}
              trackColor={{ false: '#767577', true: '#FF6B35' }}
              thumbColor={notificationSettings.expiryNotifications ? '#fff' : '#f4f3f4'}
              disabled={!notificationPermission}
            />
          </View>

          {/* 요리 타이머 알림 */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="timer" size={24} color="#FF6B35" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>요리 타이머</Text>
                <Text style={styles.settingDescription}>
                  요리 완료 시 알림
                </Text>
              </View>
            </View>
            <Switch
              value={notificationSettings.cookingTimer}
              onValueChange={(value) => handleSettingChange('cookingTimer', value)}
              trackColor={{ false: '#767577', true: '#FF6B35' }}
              thumbColor={notificationSettings.cookingTimer ? '#fff' : '#f4f3f4'}
              disabled={!notificationPermission}
            />
          </View>
        </View>

        {/* 테스트 알림 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>테스트 알림</Text>
          
          <TouchableOpacity 
            style={[styles.testButton, !notificationPermission && styles.testButtonDisabled]} 
            onPress={sendTestExpiryNotification}
            disabled={!notificationPermission}
          >
            <Ionicons name="time" size={20} color="#fff" />
            <Text style={styles.testButtonText}>유통기한 알림 테스트</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, !notificationPermission && styles.testButtonDisabled]} 
            onPress={sendTestCookingNotification}
            disabled={!notificationPermission}
          >
            <Ionicons name="timer" size={20} color="#fff" />
            <Text style={styles.testButtonText}>요리 완료 알림 테스트</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, !notificationPermission && styles.testButtonDisabled]} 
            onPress={sendTestRecipeNotification}
            disabled={!notificationPermission}
          >
            <Ionicons name="restaurant" size={20} color="#fff" />
            <Text style={styles.testButtonText}>레시피 추천 알림 테스트</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, !notificationPermission && styles.testButtonDisabled]} 
            onPress={sendTestIngredientNotification}
            disabled={!notificationPermission}
          >
            <Ionicons name="leaf" size={20} color="#fff" />
            <Text style={styles.testButtonText}>재료 추가 알림 테스트</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
  },
  headerLogo: {
    width: 28,
    height: 28,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  permissionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  permissionButtonGranted: {
    backgroundColor: '#4CAF50',
  },
  permissionButtonDenied: {
    backgroundColor: '#FF6B35',
  },
  permissionButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  permissionButtonTextGranted: {
    color: '#fff',
  },
  permissionButtonTextDenied: {
    color: '#fff',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  testButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

