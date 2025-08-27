import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';
import { SafeAreaView } from 'react-native';
import ModalLogout from './modal/ModalLogout';

export default function Profile({ navigation }) {
  const [showModal, setShowModal] = useState(false);

  const handleLogoutPress = () => {
    setShowModal(true);
  };

  const confirmLogout = async () => {
    setShowModal(false);
    await supabase.auth.signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const cancelLogout = () => {
    setShowModal(false);
  };


  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const dummyProfile = {
      display_name: '김민준',
      avatar_url: 'https://picsum.photos/100',
      bio: '요리와 사진을 좋아하는 개발자입니다.',
      favorite_cuisines: '한식, 일식, 양식',
      dietary_restrictions: '갑각류, 견과류',
    };

    const dummyPosts = [
      { image_url: 'https://picsum.photos/100' },
      { image_url: 'https://picsum.photos/100' },
      { image_url: 'https://picsum.photos/100' },
    ];

    setProfile(dummyProfile);
    setPosts(dummyPosts);
  }, []);
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const { data: { user }, error: userError } = await supabase.auth.getUser();
  //     if (userError || !user) {
  //       Alert.alert('유저 정보를 가져올 수 없습니다');
  //       return;
  //     }

  //     const { data: profileData, error: profileError } = await supabase
  //       .from('user_profiles')
  //       .select('*')
  //       .eq('id', user.id)
  //       .single();

  //     if (profileError) {
  //       Alert.alert('프로필 로딩 실패', profileError.message);
  //     } else {
  //       setProfile(profileData);
  //     }

  //     const { data: postData, error: postError } = await supabase
  //       .from('user_posts')
  //       .select('image_url')
  //       .eq('user_id', user.id);

  //     if (postError) {
  //       console.log('게시물 로딩 실패:', postError.message);
  //     } else {
  //       setPosts(postData);
  //     }
  //   };

  //   fetchData();
  // }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
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
          <ModalLogout
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
        <Text style={styles.label}>내가 올린 사진들</Text>
        <View style={styles.postGrid}>
          {posts.map((post, index) => (
            <Image
              key={index}
              source={{ uri: post.image_url }}
              style={styles.postImage}
            />
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
