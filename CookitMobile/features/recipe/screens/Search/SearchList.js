// YouTube 검색 결과를 보여주는 화면
// 요리 영상만 필터링하여 표시

import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import SearchInput from '@shared/components/SearchInput';
import Sort from '@shared/components/Sort';
import YouTubeAnalysisModal from '@features/recipe/components/YouTubeAnalysisModal';
import { Ionicons } from '@expo/vector-icons';
import { useAnalysis } from '@features/recipe/contexts/AnalysisContext';

const SearchList = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const initialQuery = route.params?.query || '';
  const [query, setQuery] = useState(initialQuery);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('관련성순');
  const [nextPageToken, setNextPageToken] = useState(null);
  const [analysisModalVisible, setAnalysisModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { startAnalysis } = useAnalysis();

  // YouTube 검색 API 호출
  const searchYouTubeVideos = async (searchQuery, pageToken = null) => {
    try {
      setLoading(true);
      
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';
      // API_BASE_URL에 이미 /api가 포함되어 있는지 확인
      const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
      const response = await fetch(`${baseUrl}/youtube/search?query=${encodeURIComponent(searchQuery)}&maxResults=20${pageToken ? `&pageToken=${pageToken}` : ''}`);
      const data = await response.json();
      
      if (data.success) {
        if (pageToken) {
          setVideos(prev => [...prev, ...data.data.items]);
        } else {
          setVideos(data.data.items);
        }
        setNextPageToken(data.data.nextPageToken);
      } else {
        console.error('YouTube 검색 실패:', data.error);
      }
    } catch (error) {
      console.error('YouTube 검색 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query.trim()) {
      searchYouTubeVideos(query);
    }
  }, [query]);

  // 정렬 함수
  const sortedData = [...videos].sort((a, b) => {
    if (sortBy === '관련성순') return 0; // YouTube API에서 이미 관련성 순으로 정렬됨
    if (sortBy === '조회수순') return parseInt(b.viewCount) - parseInt(a.viewCount);
    if (sortBy === '최신순') return new Date(b.publishedAt) - new Date(a.publishedAt);
    if (sortBy === '좋아요순') return parseInt(b.likeCount) - parseInt(a.likeCount);
    return 0;
  });

  // 더 많은 영상 로드
  const loadMoreVideos = () => {
    if (nextPageToken && !loading) {
      searchYouTubeVideos(query, nextPageToken);
    }
  };

  // 영상 카드 컴포넌트
  const VideoCard = ({ video, onPress }) => (
    <TouchableOpacity style={styles.videoCard} onPress={() => onPress(video)} activeOpacity={0.8}>
      <Image source={{ uri: video.thumbnail }} style={styles.thumbnail} />
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
        <Text style={styles.channelTitle}>{video.channelTitle}</Text>
        <View style={styles.videoStats}>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={14} color="#666" />
            <Text style={styles.statText}>{formatNumber(video.viewCount)}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="thumbs-up-outline" size={14} color="#666" />
            <Text style={styles.statText}>{formatNumber(video.likeCount)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // 숫자 포맷팅 함수
  const formatNumber = (num) => {
    const number = parseInt(num);
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    }
    return number.toString();
  };

  // 영상 분석 시작: AnalysisContext 사용
  const startVideoAnalysis = (video) => {
    try {
      setIsAnalyzing(true);
      const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
      
      // AnalysisContext로 분석 시작 (플로팅 바 사용)
      startAnalysis(videoUrl, {
        title: video.title,
        channelTitle: video.channelTitle,
        thumbnail: video.thumbnail,
      });

      setAnalysisModalVisible(false);
      setIsAnalyzing(false);
    } catch (error) {
      console.error('영상 분석 이동 오류:', error);
      Alert.alert('오류', '분석 화면으로 이동 중 문제가 발생했습니다.');
      setIsAnalyzing(false);
      setAnalysisModalVisible(false);
    }
  };

  // 영상 선택 핸들러
  const handleVideoPress = (video) => {
    setSelectedVideo(video);
    setAnalysisModalVisible(true);
  };

  // 분석 모달 닫기
  const closeAnalysisModal = () => {
    setAnalysisModalVisible(false);
    setSelectedVideo(null);
    setIsAnalyzing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <SearchInput
        value={query}
        onChange={setQuery}
        onClear={() => setQuery('')}
        onBack={() => navigation.goBack()}
        onSubmitEditing={() => searchYouTubeVideos(query)}
      />
      <Sort sortBy={sortBy} setSortBy={setSortBy} />
      
      {loading && videos.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>요리 영상을 검색하는 중...</Text>
        </View>
      ) : (
        <FlatList
          data={sortedData}
          keyExtractor={(item, index) => `${item.videoId}-${index}`}
          renderItem={({ item }) => (
            <VideoCard video={item} onPress={handleVideoPress} />
          )}
          onEndReached={loadMoreVideos}
          onEndReachedThreshold={0.3}
          ListFooterComponent={() => 
            loading && videos.length > 0 ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#FF6B35" />
                <Text style={styles.loadingMoreText}>더 많은 영상을 불러오는 중...</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#CCC" />
              <Text style={styles.emptyTitle}>검색 결과가 없습니다</Text>
              <Text style={styles.emptySubtitle}>다른 검색어로 시도해보세요</Text>
            </View>
          )}
        />
      )}

      {/* YouTube 영상 분석 모달 */}
      <YouTubeAnalysisModal
        visible={analysisModalVisible}
        onClose={closeAnalysisModal}
        onConfirm={() => startVideoAnalysis(selectedVideo)}
        video={selectedVideo}
        isAnalyzing={isAnalyzing}
      />
    </SafeAreaView>
  );
};

export default SearchList;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  loadingMore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  videoCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 4,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  thumbnail: {
    width: '100%',
    height: 200,
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  channelTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  videoStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
});
