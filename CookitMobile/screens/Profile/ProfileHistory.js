// 요리 기록 화면 - 내가 쓴 모든 게시글 목록

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getUserPosts } from '../../services/userApi';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}년 ${month}월 ${day}일`;
};

const ProfileHistory = () => {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUserPosts();
      setPosts(data);
    } catch (error) {
      console.error('게시글 불러오기 오류:', error);
      Alert.alert('오류', '게시글을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [fetchPosts])
  );

  const getVisibilityText = (tags) => {
    if (!tags || tags.length === 0) return '비공개';
    if (tags.includes('01')) return '공개';
    return '비공개';
  };

  const getVisibilityStyle = (tags) => {
    if (!tags || tags.length === 0) return styles.badgePrivate;
    if (tags.includes('01')) return styles.badgePublic;
    return styles.badgePrivate;
  };

  const renderItem = ({ item }) => {
    const formattedDate = formatDate(item.created_at);
    const thumbnail = item.image_urls?.[0] || 'https://via.placeholder.com/100x100/E0E0E0/808080?text=No+Image';
    const visibilityText = getVisibilityText(item.tags);
    const visibilityStyle = getVisibilityStyle(item.tags);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          navigation.navigate('Community', {
            screen: 'CommunityDetail',
            params: { postId: item.post_id }
          });
        }}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: thumbnail }} 
          style={styles.thumbnail}
        />
        <View style={styles.textBox}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <View style={visibilityStyle}>
              <Text style={styles.badgeText}>{visibilityText}</Text>
            </View>
          </View>
          {item.content && (
            <Text style={styles.content} numberOfLines={2}>
              {item.content}
            </Text>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.date}>{formattedDate}</Text>
            <View style={styles.metrics}>
              <Text style={styles.metricText}>❤️ {item.like_count || 0}</Text>
              <Text style={styles.metricText}>💬 {item.comment_count || 0}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>요리 기록</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>요리 기록</Text>
        <View style={styles.backButton} />
      </View>
      {posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>아직 작성한 게시글이 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.post_id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

export default ProfileHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    width: 60,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
    textAlign: 'center',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 100,
    height: 120,
  },
  textBox: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginRight: 8,
  },
  content: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#777',
    fontWeight: '500',
  },
  metrics: {
    flexDirection: 'row',
    gap: 8,
  },
  metricText: {
    fontSize: 12,
    color: '#666',
  },
  badgePublic: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgePrivate: {
    backgroundColor: '#999',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});
