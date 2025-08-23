import { getPosts } from '@/services/postsApi';
import { useFocusEffect, useRouter } from 'expo-router';
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

export default function CommunityListScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getPosts();
      setPosts(data);
    } catch (err) {
      console.error('게시글 로딩 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 화면이 포커스될 때마다 게시글 목록 새로고침
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const screenWidth = Dimensions.get('window').width;
  const imageSize = screenWidth / 3;

  const renderItem = ({ item }: { item: any }) => {
    const thumbnail = item.image_urls?.[0];
    if (!thumbnail) return null;

    return (
      <TouchableOpacity
        style={{ width: imageSize, height: imageSize }}
        onPress={() => router.push(`/community/${item.id}`)}
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
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>커뮤니티</Text>
        <Button title="새 글 작성" onPress={() => router.push('/community/create')} />
      </View>

      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.list}
      />
    </View>
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
