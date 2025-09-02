// screens/community/Community.js
import { getPosts } from '../../services/postsApi';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommunityStackParamList } from './CommunityStack'; 
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ✅ 네비게이션 훅에 타입을 적용하기 위한 타입 정의
type CommunityScreenNavigationProp = NativeStackNavigationProp<
  CommunityStackParamList,
  'CommunityMain'
>;

export default function Community() {
  // ✅ posts 상태에 타입 명시
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // ✅ useNavigation 훅에 위에서 정의한 타입 적용
  const navigation = useNavigation<CommunityScreenNavigationProp>();

const fetchData = async () => {
  try {
    setLoading(true);
    const data = await getPosts();
    // ✅ data는 이제 오류 발생 시 빈 배열([])입니다.
    setPosts(data);
  } catch (err) {
    // ✅ 이 블록은 이제 실행될 일이 거의 없습니다.
    console.error('게시글 로딩 실패:', err);
  } finally {
    setLoading(false);
  }
};

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const screenWidth = Dimensions.get('window').width;
  const imageSize = screenWidth / 3;

  // ✅ item의 타입을 명시적으로 정의
  const renderItem = ({ item }: { item: { post_id: string; image_urls: string[] } }) => {
    const thumbnail = item.image_urls?.[0];
    if (!thumbnail) return null;

    return (
      <TouchableOpacity
        style={{ width: imageSize, height: imageSize }}
        onPress={() => navigation.push('PostDetail', { id: item.post_id })}
      >
        <Image
          source={{ uri: thumbnail }}
          style={{ width: '100%', height: '100%' }}
        />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#666" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>커뮤니티</Text>
        <Button title="새 글 작성" onPress={() => navigation.push('CreatePost')} />
      </View>

      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.post_id}
        numColumns={3}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingTop: 16,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});