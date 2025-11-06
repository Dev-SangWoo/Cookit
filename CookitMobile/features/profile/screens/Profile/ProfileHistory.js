// 요리 기록 화면 - 내가 쓴 모든 게시글 목록 및 별점/평점

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getUserPosts, getUserRatings } from '@features/profile/services/userApi';
import { Ionicons } from '@expo/vector-icons';

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
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'ratings'

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [postsData, ratingsData] = await Promise.all([
        getUserPosts(),
        getUserRatings()
      ]);
      setPosts(postsData);
      setRatings(ratingsData);
    } catch (error) {
      console.error('데이터 불러오기 오류:', error);
      Alert.alert('오류', '데이터를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const getVisibilityText = (tags) => {
    if (!tags || tags.length === 0) return '비공개';
    if (tags.includes('공개')) return '공개';
    return '비공개';
  };

  const getVisibilityStyle = (tags) => {
    if (!tags || tags.length === 0) return styles.badgePrivate;
    if (tags.includes('공개')) return styles.badgePublic;
    return styles.badgePrivate;
  };

  const renderPostItem = ({ item }) => {
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

  const renderRatingItem = ({ item }) => {
    const formattedDate = formatDate(item.created_at);
    const recipe = item.recipe;
    const thumbnail = recipe?.image_urls?.[0] || 'https://via.placeholder.com/100x100/E0E0E0/808080?text=No+Image';
    
    // 별점 표시
    const renderStars = (rating) => {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        stars.push(
          <Text key={i} style={[styles.star, i <= rating && styles.filledStar]}>
            ★
          </Text>
        );
      }
      return stars;
    };

    return (
      <TouchableOpacity
        style={styles.ratingCard}
        onPress={() => {
          if (recipe?.id) {
            navigation.navigate('Recipe', {
              screen: 'RecipeMain',
              params: { recipeId: recipe.id }
            });
          }
        }}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: thumbnail }} 
          style={styles.ratingThumbnail}
        />
        <View style={styles.ratingContent}>
          <Text style={styles.ratingRecipeTitle} numberOfLines={1}>
            {recipe?.title || '레시피'}
          </Text>
          <View style={styles.ratingStarsContainer}>
            {renderStars(item.rating || 0)}
          </View>
          {item.comment && (
            <Text style={styles.ratingComment} numberOfLines={2}>
              {item.comment}
            </Text>
          )}
          <Text style={styles.ratingDate}>{formattedDate}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Image 
            source={require('@assets/app_logo.png')} 
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>요리 기록</Text>
        </View>
        <View style={styles.backButton} />
      </View>
      {/* 탭 메뉴 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
          onPress={() => setActiveTab('posts')}
        >
          <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
            📖 게시글
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ratings' && styles.activeTab]}
          onPress={() => setActiveTab('ratings')}
        >
          <Text style={[styles.tabText, activeTab === 'ratings' && styles.activeTabText]}>
            ⭐ 별점/평점
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 게시글 탭 */}
        {activeTab === 'posts' && (
          <View style={styles.section}>
            {posts.length === 0 ? (
              <View style={styles.emptySection}>
                <Text style={styles.emptyText}>아직 작성한 게시글이 없습니다.</Text>
              </View>
            ) : (
              <View style={styles.postsList}>
                {posts.map((item) => (
                  <View key={item.post_id}>
                    {renderPostItem({ item })}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 별점/평점 탭 */}
        {activeTab === 'ratings' && (
          <View style={styles.section}>
            {ratings.length === 0 ? (
              <View style={styles.emptySection}>
                <Text style={styles.emptyText}>아직 작성한 별점/평점이 없습니다.</Text>
              </View>
            ) : (
              <View style={styles.ratingsList}>
                {ratings.map((item) => (
                  <View key={item.id}>
                    {renderRatingItem({ item })}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
  },
  headerLogo: {
    width: 28,
    height: 28,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF6B35',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6C757D',
  },
  activeTabText: {
    color: '#FF6B35',
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 12,
  },
  postsList: {
    gap: 15,
  },
  ratingsList: {
    gap: 12,
  },
  emptySection: {
    paddingVertical: 40,
    alignItems: 'center',
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
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  // 별점/평점 카드 스타일
  ratingCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  ratingThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#E9ECEF',
  },
  ratingContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  ratingRecipeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 6,
  },
  ratingStarsContainer: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  star: {
    fontSize: 18,
    color: '#DEE2E6',
    marginRight: 2,
  },
  filledStar: {
    color: '#FFC107',
  },
  ratingComment: {
    fontSize: 13,
    color: '#6C757D',
    marginBottom: 6,
    lineHeight: 18,
  },
  ratingDate: {
    fontSize: 12,
    color: '#ADB5BD',
  },
});
