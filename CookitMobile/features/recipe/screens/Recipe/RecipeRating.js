import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '@shared/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { saveRecipeComment } from '@features/community/services/commentsApi';

// 별점 컴포넌트 (별 모양을 터치하여 별점을 선택할 수 있게)
const StarRating = ({ rating, setRating }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <View style={styles.starContainer}>
      {stars.map((star) => (
        <TouchableOpacity key={star} onPress={() => setRating(star)}>
          <Text style={[styles.star, rating >= star && styles.filledStar]}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const RecipeRating = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { recipeId, recipe } = route.params || {};

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [recipeData, setRecipeData] = useState(recipe || null);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // 좋아요 상태 확인
        checkLikeStatus(user.id);
      } else {
        console.error('User not logged in!');
        Alert.alert('오류', '로그인이 필요합니다.');
      }
    };
    getUserId();
  }, [recipeId]);

  // recipe가 없으면 DB에서 불러오기
  useEffect(() => {
    const loadRecipe = async () => {
      if (recipeData || !recipeId) return;
      
      try {
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', recipeId)
          .single();

        if (error) throw error;
        if (data) {
          setRecipeData(data);
        }
      } catch (error) {
        console.error('레시피 로드 오류:', error);
      }
    };

    loadRecipe();
  }, [recipeId, recipeData]);

  // 썸네일 URL 가져오기
  const getThumbnailUrl = () => {
    const currentRecipe = recipeData || recipe;
    if (!currentRecipe) return null;

    // thumbnail이 있으면 사용
    if (currentRecipe.thumbnail) {
      return currentRecipe.thumbnail.startsWith('http') 
        ? currentRecipe.thumbnail 
        : supabase.storage.from('recipe-images').getPublicUrl(currentRecipe.thumbnail).data.publicUrl;
    }

    // image_urls 배열의 첫 번째 이미지 사용
    const imageUrl = currentRecipe.image_urls?.[0];
    if (!imageUrl) return null;

    // 이미 전체 URL이면 그대로 사용
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    // Supabase Storage 경로면 Public URL 생성
    const { data } = supabase.storage.from('recipe-images').getPublicUrl(imageUrl);
    return data.publicUrl;
  };

  // 좋아요 상태 확인
  const checkLikeStatus = async (userId) => {
    if (!recipeId) return;
    
    try {
      const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';
      const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${baseUrl}/recipe-likes/${recipeId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.success) {
        setIsLiked(result.liked);
      }
    } catch (error) {
      console.error('좋아요 상태 확인 오류:', error);
    }
  };

  const handleSave = async () => {
    if (!userId || !recipeId) {
      Alert.alert('오류', '사용자 또는 레시피 정보가 누락되었습니다.');
      return;
    }
    if (rating === 0) {
      Alert.alert('필수 입력', '별점을 선택해 주세요.');
      return;
    }

    setLoading(true);

    try {
      // 1. 별점 및 한 줄 평 (recipe_comments) 저장/업데이트
      await saveOrUpdateComment(recipeId, userId, comment, rating);

      // 2. 좋아요 (recipe_likes) 저장/삭제 - 서버 API 사용
      await updateRecipeLike(recipeId, isLiked);

      // 3. 요리 기록 작성 페이지로 이동
      Alert.alert(
        '평가 완료!',
        '요리 기록을 작성하시겠습니까?\n(건너뛰기 가능)',
        [
          { 
            text: '건너뛰기', 
            style: 'cancel',
            onPress: () => navigation.navigate('HomeTab')
          },
          { 
            text: '기록 작성', 
            onPress: () => navigation.replace('RecipeRecord', { recipeId, recipe })
          }
        ]
      );

    } catch (error) {
      console.error('저장 중 오류 발생:', error);
      Alert.alert('저장 실패', '데이터 저장 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 레시피 정보 헤더 */}
        <View style={styles.recipeHeader}>
          {getThumbnailUrl() ? (
            <Image 
              source={{ uri: getThumbnailUrl() }} 
              style={styles.recipeThumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Ionicons name="restaurant-outline" size={32} color="#ccc" />
            </View>
          )}
          <View style={styles.recipeInfo}>
            <Text style={styles.recipeTitle} numberOfLines={2}>
              {recipeData?.title || recipe?.title || '레시피'}
            </Text>
            <Text style={styles.recipeSubtitle}>요리 평가하기</Text>
          </View>
        </View>

        <Text style={styles.header}>요리 평가하기 ⭐</Text>
        <Text style={styles.subHeader}>Step 1. 별점 주기</Text>

        <StarRating rating={rating} setRating={setRating} />

        <Text style={styles.subHeader}>Step 2. 이 레시피가 마음에 드나요?</Text>
        <TouchableOpacity
          style={[styles.likeButton, isLiked && styles.likedButton]}
          onPress={() => setIsLiked(!isLiked)}
        >
          <Text style={styles.likeButtonText}>{isLiked ? '❤️ 좋아요 취소' : '🤍 좋아요'}</Text>
        </TouchableOpacity>

        <Text style={styles.subHeader}>Step 3. 한 줄 평 남기기 (선택)</Text>
        <TextInput
          style={styles.commentInput}
          multiline
          placeholder="레시피에 대한 솔직한 의견을 남겨주세요."
          placeholderTextColor="#999"
          value={comment}
          onChangeText={setComment}
          maxLength={60}
        />
        <Text style={styles.charCount}>{comment.length} / 60</Text>
      </ScrollView>

      <TouchableOpacity
        style={[styles.saveButton, (loading || rating === 0) && styles.disabledSaveButton]}
        onPress={handleSave}
        disabled={loading || rating === 0}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>평가 완료!</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const saveOrUpdateComment = async (recipeId, userId, content, rating) => {
  try {
    await saveRecipeComment(recipeId, rating, content);
  } catch (error) {
    throw new Error('Comment/Rating save failed: ' + error.message);
  }
};


// 서버 API를 통한 좋아요 업데이트
const updateRecipeLike = async (recipeId, isLiked) => {
  try {
    const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('로그인이 필요합니다.');
    }

    // isLiked가 true면 좋아요 추가, false면 취소
    const response = await fetch(`${baseUrl}/recipe-likes/${recipeId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ liked: isLiked }),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || '좋아요 처리 실패');
    }

    return result;
  } catch (error) {
    console.error('좋아요 업데이트 오류:', error);
    throw new Error('좋아요 처리 실패: ' + error.message);
  }
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  recipeHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  recipeThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  thumbnailPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  recipeSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 16,
    marginHorizontal: 20,
    color: '#333',
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
    marginHorizontal: 20,
    color: '#333',
  },
  commentInput: {
    marginHorizontal: 20,
    height: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    fontSize: 16,
  },
  charCount: {
    textAlign: 'right',
    marginHorizontal: 20,
    color: '#888',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  likeButton: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  likedButton: {
    backgroundColor: '#ffdddd',
    borderColor: '#ff5555',
  },
  likeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  disabledSaveButton: {
    backgroundColor: '#a5d6a7', // 비활성화 색상
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  star: {
    fontSize: 40,
    color: '#ccc',
    marginHorizontal: 5,
  },
  filledStar: {
    color: '#ffc107',
  },
});

export default RecipeRating;
