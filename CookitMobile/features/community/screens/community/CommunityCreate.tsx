import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import RecipeSelectModal from '@features/recipe/components/RecipeSelectModal';
import { useAuth } from '@features/auth/contexts/AuthContext';
import { createPost } from '@features/community/services/postsApi';

interface Recipe {
  id: string;
  recipe_id: string;
  title: string;
  image_urls?: string[];
  thumbnail?: string;
}

export default function CommunityCreate() {
  const { user } = useAuth();
  const navigation = useNavigation();

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // 게시글 작성 관련 state
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeModalVisible, setIsRecipeModalVisible] = useState(false);

  useEffect(() => {
    if (user) {
      setUserId(user.id);
    }
  }, [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 라이브러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setSelectedImages(prev => [...prev, ...newImages].slice(0, 5)); // 최대 5장
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newImage = result.assets[0].uri;
      setSelectedImages(prev => [...prev, newImage].slice(0, 5)); // 최대 5장
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!userId) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }

    if (!postTitle.trim()) {
      Alert.alert('필수 입력', '제목을 입력해 주세요.');
      return;
    }

    if (!selectedRecipe) {
      Alert.alert('필수 입력', '레시피를 선택해 주세요.');
      return;
    }

    setLoading(true);

    try {
      // 서버 API를 통해 게시글 생성 (이미지 업로드는 postsApi 내부에서 처리)
      await createPost({
        title: postTitle,
        content: postContent,
        recipe_id: selectedRecipe.recipe_id || selectedRecipe.id,
        images: selectedImages,
        user_id: userId,
        tags: '01', // 커뮤니티 게시글
      });

      Alert.alert('저장 완료', '게시글이 저장되었습니다!', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);

    } catch (error: any) {
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
        {/* 레시피 정보 헤더 (레시피 선택 시 표시) */}
        {selectedRecipe && (
          <View style={styles.recipeHeader}>
            {selectedRecipe.thumbnail || selectedRecipe.image_urls?.[0] ? (
              <Image 
                source={{ uri: selectedRecipe.thumbnail || selectedRecipe.image_urls?.[0] }} 
                style={styles.recipeThumbnail} 
              />
            ) : (
              <View style={styles.thumbnailPlaceholder}>
                <Ionicons name="restaurant-outline" size={32} color="#ccc" />
              </View>
            )}
            <View style={styles.recipeInfo}>
              <Text style={styles.recipeTitle} numberOfLines={2}>
                {selectedRecipe.title}
              </Text>
              <Text style={styles.recipeSubtitle}>연결된 레시피</Text>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedRecipe(null)}
              style={styles.removeRecipeButton}
            >
              <Ionicons name="close-circle" size={24} color="#F44336" />
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.header}>게시글 작성 📝</Text>

        {/* 레시피 선택 */}
        <Text style={styles.subHeader}>레시피 연결 *</Text>
        <TouchableOpacity
          style={styles.recipeSelectButton}
          onPress={() => setIsRecipeModalVisible(true)}
        >
          <Ionicons 
            name={selectedRecipe ? "checkmark-circle" : "add-circle-outline"} 
            size={20} 
            color={selectedRecipe ? "#4CAF50" : "#999"} 
          />
          <Text style={[styles.recipeSelectText, selectedRecipe && styles.recipeSelectedText]}>
            {selectedRecipe ? selectedRecipe.title : '레시피 선택하기'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        {/* 제목 입력 */}
        <Text style={styles.subHeader}>제목 *</Text>
        <TextInput
          style={styles.titleInput}
          placeholder="게시글 제목을 입력해주세요"
          placeholderTextColor="#999"
          value={postTitle}
          onChangeText={setPostTitle}
          maxLength={50}
        />
        <Text style={styles.charCount}>{postTitle.length} / 50</Text>

        {/* 내용 입력 */}
        <Text style={styles.subHeader}>내용 (선택)</Text>
        <TextInput
          style={styles.contentInput}
          multiline
          placeholder="게시글 내용을 입력해주세요"
          placeholderTextColor="#999"
          value={postContent}
          onChangeText={setPostContent}
          maxLength={500}
        />
        <Text style={styles.charCount}>{postContent.length} / 500</Text>

        {/* 사진 추가 */}
        <Text style={styles.subHeader}>사진 추가 (선택, 최대 5장)</Text>
        <View style={styles.imagePickerRow}>
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
            <Ionicons name="images-outline" size={24} color="#FF6B35" />
            <Text style={styles.imagePickerText}>앨범에서 선택</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.imagePickerButton} onPress={takePhoto}>
            <Ionicons name="camera-outline" size={24} color="#FF6B35" />
            <Text style={styles.imagePickerText}>사진 촬영</Text>
          </TouchableOpacity>
        </View>

        {/* 선택된 이미지 미리보기 */}
        {selectedImages.length > 0 && (
          <FlatList
            data={selectedImages}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `image-${index}`}
            renderItem={({ item, index }) => (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: item }} style={styles.imagePreview} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={styles.imageList}
          />
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, (loading || !postTitle.trim() || !selectedRecipe) && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading || !postTitle.trim() || !selectedRecipe}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>저장하기</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 레시피 선택 모달 */}
      <RecipeSelectModal
        visible={isRecipeModalVisible}
        onClose={() => setIsRecipeModalVisible(false)}
        onSelect={(recipe) => setSelectedRecipe(recipe)}
      />
    </SafeAreaView>
  );
}

// decode 함수는 더 이상 필요 없음 (postsApi에서 처리)

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
  removeRecipeButton: {
    padding: 4,
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
  recipeSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
    gap: 12,
  },
  recipeSelectText: {
    flex: 1,
    fontSize: 16,
    color: '#999',
  },
  recipeSelectedText: {
    color: '#333',
    fontWeight: '500',
  },
  titleInput: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  contentInput: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 4,
  },
  charCount: {
    textAlign: 'right',
    marginHorizontal: 20,
    color: '#888',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  imagePickerRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 12,
  },
  imagePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderStyle: 'dashed',
    gap: 8,
  },
  imagePickerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF6B35',
  },
  imageList: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  imagePreviewContainer: {
    marginRight: 12,
    position: 'relative',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#F44336',
    borderRadius: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#a5d6a7',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
