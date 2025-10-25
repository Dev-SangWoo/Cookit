import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';

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
  const recipeId = route.params?.recipeId;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        console.error('User not logged in!');
        Alert.alert('오류', '로그인이 필요합니다.');
      }
    };
    getUserId();
  }, []);

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

      // 2. 좋아요 (recipe_likes) 저장/삭제
      await updateRecipeLike(recipeId, userId, isLiked);

      Alert.alert('저장 완료', '소중한 의견 감사합니다!', [
        { text: '확인', onPress: () => navigation.navigate('HomeTab') }
      ]);

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
      <Text style={styles.header}>요리 평가하기 </Text>
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
        value={comment}
        onChangeText={setComment}
        maxLength={60}
      />
      <Text style={styles.charCount}>{comment.length} / 60</Text>


      <TouchableOpacity
        style={[styles.saveButton, (loading || rating === 0) && styles.disabledSaveButton]}
        onPress={handleSave}
        disabled={loading || rating === 0} // 별점이 0이면 저장 비활성화
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
  const { error } = await supabase
    .from('recipe_comments')
    .upsert(
      { recipe_id: recipeId, user_id: userId, content: content, rating: rating },
      { onConflict: 'user_id, recipe_id' } 
    );

  if (error) throw new Error('Comment/Rating save failed: ' + error.message);
};


const updateRecipeLike = async (recipeId, userId, isLiked) => {
  if (isLiked) {
    const { error } = await supabase
      .from('recipe_likes')
      .upsert(
        { recipe_id: recipeId, user_id: userId },
        { onConflict: 'user_id, recipe_id' }
      );

    if (error) throw new Error('Like save failed: ' + error.message);
  } else {
    const { error } = await supabase
      .from('recipe_likes')
      .delete()
      .eq('recipe_id', recipeId)
      .eq('user_id', userId);

    if (error) throw new Error('Like remove failed: ' + error.message);
  }
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#333',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
    color: '#e67e22',
  },
  commentInput: {
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
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },
  likeButton: {
    backgroundColor: '#eee',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
    borderColor: '#ccc',
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
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 'auto',
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
