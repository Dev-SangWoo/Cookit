// screens/community/CommunityMain.tsx
import { getPosts } from '../../services/postsApi';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommunityStackParamList } from './CommunityStack';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type CommunityScreenNavigationProp = NativeStackNavigationProp<
  CommunityStackParamList,
  'CommunityMain'
>;

type PostItem = { 
  post_id: string; 
  title: string;
  image_urls: string[]; 
  like_count: number;
  comment_count: number;
};

export default function CommunityMain() {
  
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'01' | '10'>('01'); // '01' = 커뮤니티, '10' = 질문
  
  const navigation = useNavigation<CommunityScreenNavigationProp>();

  const fetchData = async (tags: '01' | '10') => {
    try {
      setLoading(true);
      const data = await getPosts({ tags });
      setPosts(data);
    } catch (err) {
      console.error('게시글 로딩 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData(filter);
    }, [filter])
  );

  const screenWidth = Dimensions.get('window').width;
  const numColumns = 2;
  const itemPadding = 8;
  const imageSize = (screenWidth / numColumns) - (itemPadding * (numColumns + 1) / numColumns); 

  const renderItem = ({ item }: { item: PostItem }) => {
    const thumbnail = item.image_urls?.[0];
    if (!thumbnail) return null;

    return (
      <TouchableOpacity
        style={styles.postItemContainer}
        onPress={() => navigation.push('CommunityDetail', { postId: item.post_id })}
      >
        <Image
          source={{ uri: thumbnail }}
          style={styles.postImage}
        />
        <View style={styles.postDetails}>
          <Text style={styles.postTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.metricsContainer}>
            <Text style={styles.metricText}>❤️ {item.like_count}</Text>
            <Text style={styles.metricText}>💬 {item.comment_count}</Text>
          </View>
        </View>
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
      </View>
      
      {/* 필터 탭 - 밑줄 스타일 */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterTab}
          onPress={() => setFilter('01')}
        >
          <Text style={[styles.filterText, filter === '01' && styles.filterTextActive]}>
            커뮤니티
          </Text>
          {filter === '01' && <View style={styles.underline} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterTab}
          onPress={() => setFilter('10')}
        >
          <Text style={[styles.filterText, filter === '10' && styles.filterTextActive]}>
            질문
          </Text>
          {filter === '10' && <View style={styles.underline} />}
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.post_id}
        numColumns={numColumns}
        contentContainerStyle={styles.list}
      />
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.push('CommunityCreate')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  filterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#CCCCCC',
  },
  filterTextActive: {
    color: '#333333',
    fontWeight: '700',
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#FF6B35',
  },
  list: {
    paddingHorizontal: 8,
    paddingBottom: 40, // 플로팅 버튼을 위한 하단 여백 추가
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postItemContainer: {
    flex: 1,
    margin: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postImage: {
    width: '100%',
    height: Dimensions.get('window').width / 2 - (8 * 2),
    resizeMode: 'cover',
  },
  postDetails: {
    padding: 8,
  },
  postTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  metricText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addButtonText: {
    fontSize: 30,
    color: 'white',
    lineHeight: 30,
  },
});