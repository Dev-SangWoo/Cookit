// 프로필 화면
import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const navigation = useNavigation();
  const { user, signOut, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await signOut();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              console.error('로그아웃 오류:', error);
              Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const ProfileMenuItem = ({ icon, title, subtitle, onPress, showArrow = true }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIcon}>
          <Ionicons name={icon} size={20} color="#666" />
        </View>
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={styles.loadingText}>프로필을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>프로필</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="log-out-outline" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* 사용자 정보 카드 */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.defaultAvatar}>
                <Ionicons name="person" size={40} color="#fff" />
              </View>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.name || user?.email?.split('@')[0] || '사용자'}
            </Text>
            <Text style={styles.userEmail}>{user?.email || '이메일 없음'}</Text>
            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>저장한 레시피</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>즐겨찾기</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>요리 횟수</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 메뉴 섹션 */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>내 요리</Text>
          
          <ProfileMenuItem
            icon="bookmark-outline"
            title="저장한 레시피"
            subtitle="내가 저장한 레시피들을 확인해보세요"
            onPress={() => navigation.navigate('RecipeList', { type: 'saved', title: '저장한 레시피' })}
          />
          
          <ProfileMenuItem
            icon="heart-outline"
            title="즐겨찾기"
            subtitle="좋아하는 레시피들을 모아보세요"
            onPress={() => navigation.navigate('RecipeList', { type: 'favorited', title: '즐겨찾기' })}
          />
          
          <ProfileMenuItem
            icon="restaurant-outline"
            title="요리 기록"
            subtitle="내가 만들어본 요리들을 확인해보세요"
            onPress={() => navigation.navigate('RecipeList', { type: 'cooked', title: '요리 기록' })}
          />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>설정</Text>
          
          <ProfileMenuItem
            icon="person-outline"
            title="계정 정보"
            subtitle="이메일, 이름 등 기본 정보를 관리하세요"
            onPress={() => Alert.alert('알림', '계정 정보 수정 기능은 준비 중입니다.')}
          />
          
          <ProfileMenuItem
            icon="notifications-outline"
            title="알림 설정"
            subtitle="푸시 알림을 관리하세요"
            onPress={() => Alert.alert('알림', '알림 설정 기능은 준비 중입니다.')}
          />
          
          <ProfileMenuItem
            icon="color-palette-outline"
            title="테마 설정"
            subtitle="앱 테마를 변경하세요"
            onPress={() => Alert.alert('알림', '테마 설정 기능은 준비 중입니다.')}
          />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>지원</Text>
          
          <ProfileMenuItem
            icon="help-circle-outline"
            title="도움말"
            subtitle="앱 사용법을 알아보세요"
            onPress={() => Alert.alert('알림', '도움말 기능은 준비 중입니다.')}
          />
          
          <ProfileMenuItem
            icon="mail-outline"
            title="문의하기"
            subtitle="개발팀에게 문의하세요"
            onPress={() => Alert.alert('알림', '문의하기 기능은 준비 중입니다.')}
          />
          
          <ProfileMenuItem
            icon="information-circle-outline"
            title="앱 정보"
            subtitle="버전 1.0.0"
            onPress={() => Alert.alert('앱 정보', 'Cookit v1.0.0\nAI 기반 요리 레시피 앱')}
            showArrow={false}
          />
        </View>

        {/* 로그아웃 버튼 */}
        <TouchableOpacity
          style={styles.logoutButtonLarge}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text style={styles.logoutButtonText}>로그아웃</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  defaultAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e9ecef',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 20,
    paddingBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  logoutButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 15,
    borderRadius: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 20,
  },
});