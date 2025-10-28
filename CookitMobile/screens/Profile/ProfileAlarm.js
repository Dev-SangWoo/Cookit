// 알림 설정 화면 (On, Off) 
// 알림 관련 부분은 디자인 형태만 확인 가능
// 적용되도록 하려면 DB 스키마 설정이 필요하다고 함

import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, ActivityIndicator, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from '../../services/notificationService';

// 단일 알림 설정 항목 컴포넌트
const NotificationSettingItem = ({ title, description, isEnabled, onToggle, isLoading, disabled = false }) => (
    <View style={styles.itemContainer}>
        <View style={styles.textContainer}>
            <Text style={styles.itemTitle}>{title}</Text>
            <Text style={styles.itemDescription}>{description}</Text>
        </View>
        <Switch
            trackColor={{ false: '#767577', true: '#FF6347' }} // 토마토색 계열
            thumbColor={isEnabled ? '#f4f3f4' : '#f4f3f4'}
            onValueChange={onToggle}
            value={isEnabled}
            disabled={isLoading || disabled}
        />
    </View>
);

export default function ProfileAlarm() {
    const { user, updateUserProfile, loading: authLoading } = useAuth();
    const [isLoading, setIsLoading] = React.useState(false); // 개별 토글 변경 시 로딩 상태
    
    // 추가된 알림 관련 상태
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

    if (authLoading || !user) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6347" />
                <Text style={styles.loadingText}>사용자 정보 불러오는 중...</Text>
            </View>
        );
    }
    
    // 알림 설정 변경 핸들러
    const handleToggle = (key, newValue) => async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            // 변경된 설정을 DB에 반영
            await updateUserProfile({
                [key]: newValue
            });
            // 로컬 상태는 AuthContext의 useEffect에서 자동으로 업데이트됨

        } catch (error) {
            console.error(`알림 설정 (${key}) 업데이트 실패:`, error);
            Alert.alert('오류', '설정 변경에 실패했습니다. 네트워크를 확인해 주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    // user의 알림 설정은 boolean | null 타입일 수 있으므로, 기본값(true)을 사용합니다.
    const isPushEnabled = user.push_notifications_enabled ?? true;
    const isRecipeRecommendationEnabled = user.recipe_recommendations_enabled ?? true;

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>알림 설정</Text>

            {/* 알림 권한 섹션 */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>알림 권한</Text>
                
                <View style={styles.permissionRow}>
                    <View style={styles.permissionInfo}>
                        <Ionicons name="notifications" size={24} color="#FF6347" />
                        <View style={styles.permissionText}>
                            <Text style={styles.permissionTitle}>알림 권한</Text>
                            <Text style={styles.permissionDescription}>
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

            {/* 메인 푸시 알림 토글 (모든 알림의 마스터 스위치 역할) */}
            <NotificationSettingItem
                title="모든 푸시 알림"
                description="새 댓글, 레시피 추천 등 모든 앱 알림을 받습니다."
                isEnabled={isPushEnabled}
                onToggle={handleToggle('push_notifications_enabled', !isPushEnabled)}
                isLoading={isLoading}
            />

            <View style={styles.divider} />
            
            {/* 개별 알림 설정 항목 */}
            <NotificationSettingItem
                title="레시피 추천 알림"
                description="사용자의 요리 스타일과 취향에 맞는 맞춤형 레시피를 추천받습니다."
                // 메인 알림이 켜져 있을 때만 해당 설정을 활성화/비활성화 할 수 있습니다.
                isEnabled={isPushEnabled && isRecipeRecommendationEnabled} 
                onToggle={handleToggle('recipe_recommendations_enabled', !isRecipeRecommendationEnabled)}
                isLoading={isLoading || !isPushEnabled} // 메인 알림이 꺼져 있으면 disabled
            />

            {/* 추가된 알림 설정들 */}
            <View style={styles.divider} />
            
            <NotificationSettingItem
                title="유통기한 알림"
                description="재료 유통기한 임박 시 알림"
                isEnabled={notificationSettings.expiryNotifications}
                onToggle={() => handleSettingChange('expiryNotifications', !notificationSettings.expiryNotifications)}
                disabled={!notificationPermission}
            />

            <NotificationSettingItem
                title="요리 타이머"
                description="요리 완료 시 알림"
                isEnabled={notificationSettings.cookingTimer}
                onToggle={() => handleSettingChange('cookingTimer', !notificationSettings.cookingTimer)}
                disabled={!notificationPermission}
            />

            {/* 테스트 알림 섹션 */}
            <View style={styles.testSection}>
                <Text style={styles.testSectionTitle}>테스트 알림</Text>
                
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

            {isLoading && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="small" color="#FF6347" />
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#555',
    },
    // 섹션 스타일
    section: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 15,
        padding: 15,
        borderWidth: 1,
        borderColor: '#eee',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    // 권한 관련 스타일
    permissionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    permissionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    permissionText: {
        marginLeft: 12,
        flex: 1,
    },
    permissionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    permissionDescription: {
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
        backgroundColor: '#FF6347',
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
    // 기존 알림 설정 아이템 스타일
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#eee',
    },
    textContainer: {
        flex: 1,
        paddingRight: 10,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    itemDescription: {
        fontSize: 13,
        color: '#777',
        marginTop: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 5,
    },
    // 테스트 알림 섹션
    testSection: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginTop: 15,
        padding: 15,
        borderWidth: 1,
        borderColor: '#eee',
    },
    testSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    testButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF6347',
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
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    }
});