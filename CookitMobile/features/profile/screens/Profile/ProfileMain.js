// 프로필 메인 화면 
// 전체적인 디자인을 피그마 디자인으로 바꿈 
// 이번주 요리 활동 부분에 (요리 완성, 저장된 레시피, 요리 레벨) 레벨은 어떻게 할지 모르겠음

import React, { useEffect, useState, useRef } from 'react'; 
import { View, Text, Image, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal } from 'react-native';
import ProfileSettingModal from '@features/profile/screens/Profile/ProfileSettingModal'; 
import { useAuth } from '@features/auth/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { getMyProfile, getUserPosts, getUserStats, getWeekRecipes, updateProfile } from '@features/profile/services/userApi';

export default function ProfileMain() {
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [showCookingLevelModal, setShowCookingLevelModal] = useState(false);
  const navigation = useNavigation();

  const settingsButtonRef = useRef(null);

  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const handleSettingsPress = () => {
    settingsButtonRef.current.measureInWindow((x, y, width, height) => {
      setButtonPosition({ x, y, width, height });
      setShowSettingModal(true);
    });
  };

  const handleNavigation = (screenName) => {
     navigation.navigate(screenName);
   }

  const { signOut } = useAuth();

  const handleLogout = async () => {
    setShowSettingModal(false); 
    await signOut();
  };

  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({
    weekCompletedRecipes: 0,
    savedRecipes: 0,
    cookingLevel: 'beginner'
  });

  // 쿠킹 레벨 한글 변환 함수
  const getCookingLevelText = (level) => {
    const levelMap = {
      'beginner': '초급',
      'intermediate': '중급',
      'advanced': '고급'
    };
    return levelMap[level] || '초급';
  };

  // 요리 레벨 변경 핸들러
  const handleCookingLevelChange = async (newLevel) => {
    try {
      await updateProfile({ cooking_level: newLevel });
      setStats(prev => ({ ...prev, cookingLevel: newLevel }));
      setShowCookingLevelModal(false);
      Alert.alert('저장 완료', '요리 레벨이 변경되었습니다.');
    } catch (error) {
      console.error('요리 레벨 업데이트 오류:', error);
      Alert.alert('저장 실패', error.message || '요리 레벨 변경 중 오류가 발생했습니다.');
    }
  };

  // 이번 주 완성한 요리 보기
  const handleViewWeekRecipes = async () => {
    try {
      const recipes = await getWeekRecipes();
      if (recipes.length === 0) {
        Alert.alert('알림', '이번 주에 완성한 요리가 없습니다.');
        return;
      }
      navigation.navigate('ProfileWeekRecipes', { recipes });
    } catch (error) {
      console.error('이번 주 요리 조회 오류:', error);
      Alert.alert('오류', error.message || '이번 주 요리를 불러오는 데 실패했습니다.');
    }
  };

  // 좋아하는 레시피 보기
  const handleViewFavoriteRecipes = () => {
    navigation.navigate('ProfileLikes');
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        Alert.alert('유저 정보를 가져올 수 없습니다');
        return;
      }

      try {
        // 서버 API를 통해 프로필 조회
        const profileData = await getMyProfile();
        setProfile(profileData);

        // 서버 API를 통해 게시글 조회
        const postData = await getUserPosts(user.id);
        setPosts(postData);

        // 서버 API를 통해 통계 조회
        const statsData = await getUserStats();
        console.log('📊 통계 데이터:', statsData); // 디버깅용
        setStats({
          weekCompletedRecipes: statsData.weekCompletedRecipes || 0,
          savedRecipes: statsData.savedRecipes || statsData.likesCount || 0, // likesCount도 확인
          cookingLevel: statsData.cookingLevel || 'beginner'
        });
      } catch (error) {
        console.error('데이터 로딩 오류:', error);
        Alert.alert('로딩 실패', error.message || '데이터를 불러오는 중 오류가 발생했습니다.');
      }
    };

    fetchData();
  }, [user]);

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image 
              source={require('@assets/app_logo.png')} 
              style={styles.headerLogo}
              resizeMode="contain"
            />
          <Text style={styles.headerTitle}>마이페이지</Text>
          </View>
          <TouchableOpacity 
            ref={settingsButtonRef} 
            style={styles.settingsButton} 
            onPress={handleSettingsPress}
          > 
            <Text style={styles.settingsText}>⚙️</Text>
          </TouchableOpacity>
          
          <ProfileSettingModal
            visible={showSettingModal}
            onClose={() => setShowSettingModal(false)}
            onNavigate={(screenName) => {
              setShowSettingModal(false);
              navigation.navigate(screenName);
            }}
            onLogout={handleLogout}
            buttonPosition={buttonPosition} 
          />
        </View>

        {/* 프로필 카드 */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: profile.avatar_url || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.displayName}>{profile.display_name || '닉네임 없음'}</Text>
            <Text style={styles.bio}>{profile.bio || '자기소개를 작성해주세요.'}</Text>
          </View>
        </View>

        {/* 선호 정보 */}
        <View style={styles.preferencesSection}>
          <View style={styles.preferenceCard}>
            <View style={styles.preferenceHeader}>
              <Text style={styles.preferenceLabel}>🍳 선호 요리</Text>
            </View>
            <View style={styles.tagsContainer}>
              {profile.favorite_cuisines && profile.favorite_cuisines.length > 0 ? (
                profile.favorite_cuisines.map((cuisine, index) => (
                  <View key={index} style={[styles.tag, styles.favoriteTag]}>
                    <Text style={styles.favoriteTagText}>{cuisine}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>등록된 선호 요리가 없습니다</Text>
              )}
            </View>
          </View>
          
          <View style={styles.preferenceCard}>
            <View style={styles.preferenceHeader}>
              <Text style={styles.preferenceLabel}>⚠️ 알레르기</Text>
            </View>
            <View style={styles.tagsContainer}>
              {profile.dietary_restrictions && profile.dietary_restrictions.length > 0 ? (
                profile.dietary_restrictions.map((restriction, index) => (
                  <View key={index} style={[styles.tag, styles.allergyTag]}>
                    <Text style={styles.allergyTagText}>{restriction}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>등록된 알레르기가 없습니다</Text>
              )}
            </View>
          </View>
        </View>

        {/* 이번 주 요리 활동 */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>📊 이번 주 요리 활동</Text>
          <View style={styles.activityRow}>
            <TouchableOpacity 
              style={styles.activityCard} 
              onPress={handleViewWeekRecipes}
              activeOpacity={0.7}
            >
              <Text style={styles.activityNumber}>{stats.weekCompletedRecipes}</Text>
              <Text style={styles.activityLabel}>요리 완성</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.activityCard}
              onPress={handleViewFavoriteRecipes}
              activeOpacity={0.7}
            >
              <Text style={styles.activityNumber}>{stats.savedRecipes}</Text>
              <Text style={styles.activityLabel}>좋아하는 레시피</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.activityCard}
              onPress={() => setShowCookingLevelModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.activityNumber}>{getCookingLevelText(stats.cookingLevel)}</Text>
              <Text style={styles.activityLabel}>요리 레벨</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 내 요리 메뉴 */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>👨‍🍳 내 요리</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleNavigation('ProfileRecentViewed')}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>🔍</Text>
              <Text style={styles.menuText}>최근에 조회한 레시피</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleNavigation('ProfileHistory')}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>📖</Text>
              <Text style={styles.menuText}>요리 기록</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 커뮤니티 게시물 */}
        {posts.length > 0 && (
          <View style={styles.postsSection}>
            <Text style={styles.sectionTitle}>📸 커뮤니티 게시물</Text>
            <View style={styles.postGrid}>
              {posts.map((post) => (
                <TouchableOpacity 
                  key={post.post_id} 
                  onPress={() => {
                    // Community 스택으로 이동하여 게시물 상세로 네비게이션
                    navigation.navigate('Community', {
                      screen: 'CommunityDetail',
                      params: { postId: post.post_id }
                    });
                  }}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: post.image_urls[0] }}
                    style={styles.postImage}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* 요리 레벨 설정 모달 */}
      <Modal
        visible={showCookingLevelModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCookingLevelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>요리 레벨 설정</Text>
            <Text style={styles.modalSubtitle}>현재 요리 실력을 선택해주세요</Text>
            
            {[
              { label: '초급', description: '라면, 계란요리 정도 가능해요', value: 'beginner' },
              { label: '중급', description: '기본적인 요리 가능해요', value: 'intermediate' },
              { label: '고급', description: '복잡한 요리도 자신있어요', value: 'advanced' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.levelOption,
                  stats.cookingLevel === option.value && styles.levelOptionSelected
                ]}
                onPress={() => handleCookingLevelChange(option.value)}
              >
                <View style={styles.levelOptionContent}>
                  <Text style={[
                    styles.levelOptionLabel,
                    stats.cookingLevel === option.value && styles.levelOptionLabelSelected
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={[
                    styles.levelOptionDescription,
                    stats.cookingLevel === option.value && styles.levelOptionDescriptionSelected
                  ]}>
                    {option.description}
                  </Text>
                </View>
                {stats.cookingLevel === option.value && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCookingLevelModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // 기본 레이아웃
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    fontSize: 16,
    color: '#6C757D',
    marginTop: 10,
  },

  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerLogo: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsText: {
    fontSize: 20,
  },

  // 프로필 카드
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FF6B35',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 6,
  },
  bio: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
  },

  // 선호 정보
  preferencesSection: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
  },
  preferenceCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  preferenceHeader: {
    marginBottom: 12,
  },
  preferenceLabel: {
    fontSize: 15,
    color: '#212529',
    fontWeight: '700',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 2,
    marginRight: 8,
    marginBottom: 8,
  },
  favoriteTag: {
    backgroundColor: '#E6F7E9',
    borderColor: '#38A169',
  },
  favoriteTagText: {
    fontSize: 12,
    color: '#38A169',
    fontWeight: '600',
  },
  allergyTag: {
    backgroundColor: '#FDE8E8',
    borderColor: '#E53E3E',
  },
  allergyTagText: {
    fontSize: 12,
    color: '#E53E3E',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#ADB5BD',
    fontStyle: 'italic',
  },

  // 이번 주 요리 활동
  activitySection: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 12,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  activityNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FF6B35',
    marginBottom: 8,
  },
  activityLabel: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
    fontWeight: '600',
  },

  // 내 요리 메뉴
  menuSection: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#212529',
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 24,
    color: '#ADB5BD',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E9ECEF',
    marginHorizontal: 16,
  },

  // 커뮤니티 게시물
  postsSection: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  postGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  postImage: {
    width: 110,
    height: 110,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#E9ECEF',
  },
  // 요리 레벨 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 24,
    textAlign: 'center',
  },
  levelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  levelOptionSelected: {
    backgroundColor: '#FFF4E6',
    borderColor: '#FF6B35',
  },
  levelOptionContent: {
    flex: 1,
  },
  levelOptionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  levelOptionLabelSelected: {
    color: '#FF6B35',
  },
  levelOptionDescription: {
    fontSize: 14,
    color: '#6C757D',
  },
  levelOptionDescriptionSelected: {
    color: '#FF6B35',
  },
  checkmark: {
    fontSize: 24,
    color: '#FF6B35',
    fontWeight: 'bold',
    marginLeft: 12,
  },
  modalCloseButton: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C757D',
  },
});