// 알림 설정 화면 (On, Off) 
// 알림 관련 부분은 디자인 형태만 확인 가능
// 적용되도록 하려면 DB 스키마 설정이 필요하다고 함

import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, StyleSheet, Switch, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext'; // 업데이트된 AuthContext 사용

// 단일 알림 설정 항목 컴포넌트
const NotificationSettingItem = ({ title, description, isEnabled, onToggle, isLoading }) => (
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
            disabled={isLoading}
        />
    </View>
);

export default function ProfileAlarm() {
    const { user, updateUserProfile, loading: authLoading } = useAuth();
    const [isLoading, setIsLoading] = React.useState(false); // 개별 토글 변경 시 로딩 상태

    if (authLoading || !user) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6347" />
                <Text style={styles.loadingText}>사용자 정보 불러오는 중...</Text>
            </View>
        );
    }
    
    // 알림 설정 변경 핸들러
    // TypeScript 타입은 제거하고 JavaScript 형식으로 작성합니다.
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
        <View style={styles.container}>
            <Text style={styles.header}>알림 설정</Text>

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

            {/* 다른 알림 설정 항목들을 여기에 추가할 수 있습니다. */}

            {isLoading && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="small" color="#FF6347" />
                </View>
            )}
        </View>
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
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    }
});
