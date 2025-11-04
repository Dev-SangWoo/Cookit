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
  Switch,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { createPost } from '../../services/postsApi';

const RecipeRecord = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { recipeId, recipe } = route.params || {};

  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // 게시글 작성 관련 state
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [isPublic, setIsPublic] = useState(false); // false=비공개(00), true=공개(01)
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        console.error('User not logged in!');
        Alert.alert('오류', '로그인이 필요합니다.');
      }
    };
    getUserId();
  }, []);

  const pickImage = async () => {
    // 이미지 선택 권한 요청
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 라이브러리 접근 권한이 필요합니다.');
      return;
    }

    // 이미지 선택
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
    // 카메라 권한 요청
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
      return;
    }

    // 카메라 촬영
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

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!userId || !recipeId) {
      Alert.alert('오류', '사용자 또는 레시피 정보가 누락되었습니다.');
      return;
    }

    if (!postTitle.trim()) {
      Alert.alert('필수 입력', '제목을 입력해 주세요.');
      return;
    }

    setLoading(true);

    try {
      // 서버 API를 통해 게시글 생성 (이미지 업로드는 postsApi 내부에서 처리)
      // RecipeRecord는 공개/비공개로 구분 (isPublic: true = '01', false = '00')
      const tags = isPublic ? '01' : '00';

      await createPost({
        title: postTitle,
        content: postContent,
        recipe_id: recipeId,
        images: selectedImages,
        user_id: userId,
        tags: tags,
      });

      Alert.alert('저장 완료', '요리 기록이 저장되었습니다!', [
        { text: '확인', onPress: () => navigation.navigate('HomeTab') }
      ]);

    } catch (error) {
      console.error('저장 중 오류 발생:', error);
      Alert.alert('저장 실패', '데이터 저장 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const skipRecord = () => {
    Alert.alert(
      '기록 건너뛰기',
      '요리 기록을 작성하지 않고 홈으로 이동하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '확인', onPress: () => navigation.navigate('HomeTab') }
      ]
    );
  };

  if (!userId) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 레시피 정보 헤더 */}
        <View style={styles.recipeHeader}>
          {recipe?.thumbnail || recipe?.image_urls?.[0] ? (
            <Image 
              source={{ uri: recipe.thumbnail || recipe.image_urls?.[0] }} 
              style={styles.recipeThumbnail} 
            />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Ionicons name="restaurant-outline" size={32} color="#ccc" />
            </View>
          )}
          <View style={styles.recipeInfo}>
            <Text style={styles.recipeTitle} numberOfLines={2}>
              {recipe?.title || '레시피'}
            </Text>
            <Text style={styles.recipeSubtitle}>요리 기록 작성</Text>
          </View>
        </View>

        <Text style={styles.header}>요리 기록하기 📝</Text>

        {/* 공개 설정 */}
        <View style={styles.publicToggle}>
          <View style={styles.publicToggleLeft}>
            <Ionicons 
              name={isPublic ? "eye" : "eye-off"} 
              size={20} 
              color={isPublic ? "#4CAF50" : "#999"} 
            />
            <Text style={styles.publicToggleLabel}>
              {isPublic ? '커뮤니티 공개' : '나만 보기'}
            </Text>
          </View>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: '#ccc', true: '#4CAF50' }}
            thumbColor={isPublic ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            {isPublic ? '커뮤니티 탭에서 다른 사용자들이 볼 수 있습니다.' : '나만 볼 수 있는 요리 기록으로 저장됩니다.'}
          </Text>
        </View>

        {/* 제목 입력 */}
        <Text style={styles.subHeader}>제목 *</Text>
        <TextInput
          style={styles.titleInput}
          placeholder="예) 남편이 극찬한 소갈비찜!"
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
          placeholder="요리 후기, 팁, 개선점 등을 자유롭게 작성해주세요!"
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
            style={styles.skipButton}
            onPress={skipRecord}
          >
            <Text style={styles.skipButtonText}>건너뛰기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, (loading || !postTitle.trim()) && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading || !postTitle.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>저장하기</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// 이미지 업로드와 게시글 생성은 postsApi.ts에서 처리

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
  publicToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  publicToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  publicToggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#E67E22',
    lineHeight: 18,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
    marginHorizontal: 20,
    color: '#333',
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
  skipButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  skipButtonText: {
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

export default RecipeRecord;

