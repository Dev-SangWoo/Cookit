import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import RecipeSummaryModal from '../Recipe/RecipeSummaryModal';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}.${month.toString().padStart(2, '0')}.${day.toString().padStart(2, '0')}`;
};

const RatingDisplay = ({ rating }) => {
  const totalStars = 5;
  const filledStars = Math.round(rating);
  const stars = [];

  for (let i = 1; i <= totalStars; i++) {
    stars.push(
      <Text
        key={i}
        style={[styles.reviewStar, i <= filledStars ? styles.reviewStarFilled : styles.reviewStarEmpty]}
      >
        ★
      </Text>
    );
  }

  return (
    <View style={styles.reviewRatingContainer}>
      {stars}
    </View>
  );
};

const ReviewCard = ({ review }) => {
  const showRating = review.rating > 0;

  return (
    <View style={styles.reviewCard}>
      {/* 프로필 및 닉네임 */}
      <View style={styles.reviewProfileRow}>
        <Image source={{ uri: review.avatar }} style={styles.reviewAvatar} />
        <View style={styles.reviewUserInfo}>
          <Text style={styles.reviewNickname}>{review.nickname}</Text>
          {showRating && <RatingDisplay rating={review.rating} />}
        </View>
        <Text style={styles.reviewDateText}>{formatDate(review.createdAt)}</Text>
      </View>
      {/* 한 줄 평 내용 */}
      <Text style={styles.reviewContent}>{review.content}</Text>
    </View>
  );
};

const SearchSummary = ({ route, navigation }) => {
  const { thumbnail, title, creator, recipeId, description } = route.params;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0); // 평균 별점 상태 추가

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      await fetchLikeCount();
      await fetchReviews();

      setLoading(false);
    };

    fetchData();
  }, [recipeId]);

  const fetchLikeCount = async () => {
    try {
      const { count, error } = await supabase
        .from('recipe_likes')
        .select('*', { count: 'exact', head: true })
        .eq('recipe_id', recipeId);

      if (error) throw error;

      setLikeCount(count || 0);

    } catch (error) {
      console.error("좋아요 수 로드 오류:", error.message);
      setLikeCount(0);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('recipe_comments')
        .select(`
          id, 
          content, 
          created_at,
          rating, 
          user_profiles (
          display_name,
          avatar_url
          )
          `)
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedReviews = data.map(review => ({
        id: review.id,
        content: review.content,
        rating: review.rating, // 별점 추가
        nickname: review.user_profiles?.display_name || '익명 사용자',
        avatar: review.user_profiles?.avatar_url || 'https://via.placeholder.com/40x40/cccccc/ffffff?text=U',
        createdAt: review.created_at,
      }));

      setReviews(formattedReviews);

      const validRatings = formattedReviews
        .map(r => r.rating)
        .filter(r => r > 0); // 0점(NULL 상태 포함)은 계산에서 제외

      if (validRatings.length > 0) {
        const total = validRatings.reduce((sum, current) => sum + current, 0);
        const avg = total / validRatings.length;
        setAverageRating(avg.toFixed(1)); // 소수점 첫째 자리까지 표시
      } else {
        setAverageRating(0);
      }

    } catch (error) {
      console.error("댓글 로드 오류:", error.message);
      setReviews([]);
      setAverageRating(0);
    }
  };

  const handleSummaryPress = () => {
    setIsModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>레시피 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* 1. 스크롤 가능한 콘텐츠 영역 (Flex: 1) */}
      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>

        {/* 상단 썸네일 영역 */}
        <Image source={{ uri: thumbnail }} style={styles.thumbnail} />

        <View style={styles.infoContainer}>
          {/* 제목 및 제작자 */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.creator}>제작자: {creator}</Text>

          <Text style={styles.description}>{description}</Text>

          {/* 좋아요 수 및 평균 별점 표시 */}
          <View style={styles.ratingInfoRow}>
            <View style={styles.likeContainer}>
              <Text style={styles.likeText}>❤️ 좋아요: {likeCount.toLocaleString()}</Text>
            </View>

            {averageRating > 0 && (
              <View style={styles.averageRatingContainer}>
                <Text style={styles.averageRatingText}>
                  ⭐ 평균 별점: {averageRating} / 5.0
                </Text>
              </View>
            )}
          </View>


        </View>

        {/* 한 줄 평 섹션 */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>사용자 한 줄 평 ({reviews.length})</Text>

          {reviews.length === 0 ? (
            <Text style={styles.noReviews}>아직 한 줄 평이 없습니다.</Text>
          ) : (
            reviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))
          )}

        </View>

      </ScrollView>


      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>뒤로가기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.summaryBtn}
          onPress={handleSummaryPress}
        >
          <Text style={styles.summaryBtnText}>레시피 분석하기</Text>
        </TouchableOpacity>
      </View>

      <RecipeSummaryModal
        isVisible={isModalVisible}
        onComplete={() => {
          setIsModalVisible(false);
          navigation.navigate('RecipeSummary', { recipeId });
        }}
      />
    </SafeAreaView>
  );
};

export default SearchSummary;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 15 : 0
  },
  scrollArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  thumbnail: {
    width: '100%',
    height: 250,
    marginBottom: 10,
  },
  infoContainer: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  creator: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },

  ratingInfoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 10, 
  },
  likeContainer: {
    borderWidth: 1,
    borderColor: '#ff6b6b',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#fffafa',
  },
  likeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  averageRatingContainer: {
    borderWidth: 1,
    borderColor: '#ffc107',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#fffae6',
  },
  averageRatingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffc107',
  },
  description: {
    fontSize: 15,
    color: '#555',
    marginBottom: 10,
  },

  reviewsSection: {
    paddingHorizontal: 20,
    marginTop: 10,
    borderTopWidth: 8,
    borderTopColor: '#f7f7f7',
    paddingTop: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },

  noReviews: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    marginBottom: 30,
  },

  bottomButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  backBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#aaa',
    width: '48%',
  },
  backBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  summaryBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#FFC107',
    width: '48%',
  },
  summaryBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },

  // ------------------------------------
  // ✅ ReviewCard 스타일 (이전 reviewCardStyles 통합)
  // ------------------------------------
  reviewCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  reviewProfileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // 프로필 이미지와 정보 상단 정렬
    justifyContent: 'space-between', // 날짜를 오른쪽 끝으로 분리
    marginBottom: 10,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#ccc',
  },
  reviewUserInfo: {
    flex: 1, // 남은 공간을 차지하여 닉네임과 별점을 표시
    justifyContent: 'center',
  },
  reviewNickname: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  reviewDateText: {
    fontSize: 12,
    color: '#888',
    alignSelf: 'center', // 날짜를 가운데로 정렬
  },
  reviewContent: {
    fontSize: 15,
    color: '#555',
    lineHeight: 20,
    marginTop: 5,
  },
  // ✅ 별점 표시 스타일
  reviewRatingContainer: {
    flexDirection: 'row',
    marginTop: 2,
  },
  reviewStar: {
    fontSize: 18,
    marginHorizontal: 1,
  },
  reviewStarFilled: {
    color: '#ffc107', // 채워진 별 색상 (노란색)
  },
  reviewStarEmpty: {
    color: '#ccc', // 비어있는 별 색상 (회색)
  },
});
