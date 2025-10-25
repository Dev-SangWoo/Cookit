// 커뮤니티 메인 화면 
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

      const navigation = useNavigation<CommunityScreenNavigationProp>();

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

      useFocusEffect(
            useCallback(() => {
                  fetchData();
            }, [])
      );

      const screenWidth = Dimensions.get('window').width;
      const numColumns = 2;
      const itemPadding = 8;
      // const imageSize = (screenWidth / numColumns) - (itemPadding * (numColumns + 1) / numColumns); // ⚠️ 사용되지 않는 변수는 제거할 수 있습니다.

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
                        <TouchableOpacity
                              style={styles.headerAddButton}
                              onPress={() => navigation.push('CommunityCreate')}
                        >
                              <Text style={{ fontSize: 18, color: '#fff' }}>새 글 작성</Text>
                        </TouchableOpacity>
                  </View>

                  <FlatList
                        data={posts}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.post_id}
                        numColumns={numColumns}
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
            fontSize: 24, // 제목을 좀 더 크게 변경
            fontWeight: 'bold',
      },
      // ✅ 헤더에 추가된 둥근 사각형 버튼 스타일
      headerAddButton: {
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: '#FFC107',
            borderRadius: 8, // 둥근 사각형
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 10,
      },
      // ⚠️ 이전의 우측 하단 버튼 관련 스타일은 이제 사용하지 않습니다.
      // addButton: { ... },
      // addButtonText: { ... },
      list: {
            paddingHorizontal: 8,
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
});