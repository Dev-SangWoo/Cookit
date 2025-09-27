import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import ProfileLogoutModal from './ProfileLogoutModal';
import { useAuth } from '../../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileMain({ navigation }) {
  const [showModal, setShowModal] = useState(false);

  const handleLogoutPress = () => {
    setShowModal(true);
  };

  const { signOut } = useAuth();

  const confirmLogout = async () => {
    setShowModal(false);
    await signOut();
  };

  const cancelLogout = () => {
    setShowModal(false);
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


  const handlePostPress = (postId) => {
    navigation.navigate('CommunityDetail', { postId: postId });
  };

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 닉네임 + 로그아웃 */}
        <View style={styles.headerRow}>
          <Text style={styles.nickname}>{profile.display_name}</Text>
          <TouchableOpacity style={styles.logout} onPress={handleLogoutPress}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
          <ProfileLogoutModal
            visible={showModal}
            onConfirm={confirmLogout}
            onCancel={cancelLogout}
          />
        </View>
        <View style={styles.divider} />
        {/* 프로필 + 이메일 + 자기소개 */}
        <View style={styles.profileRow}>
          <Image
            source={{ uri: profile.avatar_url || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          <View style={styles.infoColumn}>
            <Text style={styles.email}>{profile.email || '이메일 정보 없음'}</Text>
            <Text style={styles.bio}>{profile.bio || '자기소개가 없습니다.'}</Text>
          </View>
        </View>

        {/* 선호 요리 / 알레르기 */}
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

        {/* 게시물 */}
        <Text style={styles.label}>커뮤니티에 올린 사진들</Text>
        <View style={styles.postGrid}>
          {posts.map((post) => (
            <TouchableOpacity key={post.post_id} onPress={() => handlePostPress(post.post_id)}>
              <Image
                // ✅ image_urls 배열의 첫 번째 요소만 사용합니다.
                source={{ uri: post.image_urls[0] }}
                style={styles.postImage}
              />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  nickname: { fontSize: 20, fontWeight: 'bold' },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
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
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logout: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#aaa',
    borderRadius: 8,
  },
  label: { fontSize: 16, fontWeight: '600', marginTop: 20 },
  tag: { fontSize: 14, color: '#555' },
  postGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 10 },
  postImage: { width: 100, height: 100, margin: 5, borderRadius: 10 },
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
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
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
});
