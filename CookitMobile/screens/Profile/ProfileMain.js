// 프로필 메인 화면 
// 전체적인 디자인을 피그마 디자인으로 바꿈 
// 이번주 요리 활동 부분에 (요리 완성, 저장된 레시피, 요리 레벨) 레벨은 어떻게 할지 모르겠음


import React, { useEffect, useState, useRef } from 'react'; 
import { View, Text, Image, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import ProfileSettingModal from './ProfileSettingModal'; 
import { useAuth } from '../../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native'

export default function ProfileMain() {
  const [showSettingModal, setShowSettingModal] = useState(false);
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


  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        Alert.alert('유저 정보를 가져올 수 없습니다');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        Alert.alert('프로필 로딩 실패', profileError.message);
      } else {
        setProfile(profileData);
      }

      const { data: postData, error: postError } = await supabase
        .from('user_posts')
        .select('post_id, image_urls')
        .eq('user_id', user.id);

      if (postError) {
        console.log('게시물 로딩 실패:', postError.message);
      } else {
        setPosts(postData);
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
      <View style={styles.headerRow}>
        <Text style={styles.nickname}>마이페이지</Text>
        <TouchableOpacity 
          ref={settingsButtonRef} 
          style={styles.settingsButton} 
          onPress={handleSettingsPress}
        > 
          <Text style={styles.settingsText}>설정</Text>
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
      <View style={styles.divider} />
      <View style={styles.profileRow}>
        <Image
          source={{ uri: profile.avatar_url || 'https://via.placeholder.com/100' }}
          style={styles.avatar}
        />
        <View style={styles.infoColumn}>
          <Text style={styles.nickname}>{profile.display_name || '닉네임 없음'} 님</Text>
          <Text style={styles.bio}>{profile.bio || '자기소개가 없습니다.'}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>선호 요리</Text>
          <Text style={styles.tag}>{profile.favorite_cuisines || '없음'}</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.label}>알레르기</Text>
          <Text style={styles.tag}>{profile.dietary_restrictions || '없음'}</Text>
        </View>
      </View>
      <View style={styles.activityContainer}>
        <Text style={styles.sectionTitle}>이번 주 요리 활동</Text>
        <View style={styles.activityRow}>
          <View style={styles.activityBox}>
            <Text style={styles.boxText}></Text>
            <Text style={styles.subText}>요리 완성</Text>
          </View>
          <View style={styles.activityBox}>
            <Text style={styles.boxText}></Text>
            <Text style={styles.subText}>저장된 레시피</Text>
          </View>
          <View style={styles.activityBox}>
            <Text style={styles.boxText}></Text>
            <Text style={styles.subText}>요리 레벨</Text>
          </View>
        </View>
      </View>
      <View style={styles.cookSection}>
        <Text style={styles.sectionTitle}>내 요리</Text>
        </View>
      <TouchableOpacity 
      style={styles.cookBox}
      onPress={() => handleNavigation('ProfileLikes')}
      >
        <Text style={styles.cookText}>좋아요 누른 레시피</Text>
        <Text style={styles.Arrow}>▶</Text>
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity 
      style={styles.cookBox}
      onPress={() => handleNavigation('ProfileHistory')}
      >
        <Text style={styles.cookText}>요리 기록</Text>
                <Text style={styles.Arrow}>▶</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  avatar: { width: 100, height: 100, borderRadius: 25, marginBottom: 10 },
  nickname: { fontSize: 20, fontWeight: 'bold' },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
  },
  infoColumn: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },

  bio: {
    fontSize: 14,
    color: '#444',
  },
  settingsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  settingsButton: { 
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#aaa',
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20
  },
  tag: {
    fontSize: 14,
    color: '#555'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#555',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  column: {
    width: '48%',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
  activityContainer: {
    backgroundColor: '#f0ddf3ff',
    padding: 10,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    // color: 'purple',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityBox: {
    width: '30%',
    backgroundColor: '#fff',
    padding: 10,
  },
  boxText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subText: {
    fontSize: 12,
    color: '#939292ff',
    textAlign: 'center',
  },
  cookSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  cookBox: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cookText: {
    fontSize: 14,
  },
  Arrow: {
    fontSize: 14,
    color: '#939292ff',
  },
})