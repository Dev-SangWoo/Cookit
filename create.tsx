import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { getRecipes } from '@/services/recipesApi';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';

export default function CreatePostScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getRecipes();
        setRecipes(data);
      } catch (err) {
        console.error('레시피 목록 불러오기 실패:', err);
      }
    };
    fetchRecipes();
  }, []);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets]);
    }
  };

  const uploadImages = async () => {
    const uploadedUrls: string[] = [];

    for (const image of images) {
      try {
        const fileExt = image.uri.split('.').pop();
        const fileName = `${uuid()}.${fileExt}`;
        const filePath = `posts/${user?.id}/${fileName}`;

        const base64 = await FileSystem.readAsStringAsync(image.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const contentType = image.mimeType || 'image/jpeg';

        const { error } = await supabase.storage
          .from('user-post-images')
          .upload(filePath, Buffer.from(base64, 'base64'), {
            contentType,
            upsert: true,
          });

        if (error) {
          console.error('이미지 업로드 실패:', error);
          Alert.alert('이미지 업로드 실패', error.message);
          return [];
        }

        const { data } = supabase.storage.from('user-post-images').getPublicUrl(filePath);
        uploadedUrls.push(data.publicUrl);
      } catch (err) {
        console.error('이미지 처리 중 오류 발생:', err);
        Alert.alert('이미지 처리 실패', '이미지를 업로드하는 중 오류가 발생했습니다.');
        return [];
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (!title || !content) {
      Alert.alert('오류', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    const imageUrls = await uploadImages();

    const { error } = await supabase.from('user_posts').insert({
      user_id: user.id,
      title,
      content,
      image_urls: imageUrls,
      recipe_id: selectedRecipeId,
    });

    if (error) {
      console.error('게시글 등록 실패:', error);
      Alert.alert('게시글 등록 실패', error.message);
    } else {
      Alert.alert('등록 완료', '게시글이 등록되었습니다.');
      router.back();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        style={[styles.input, { color: 'white' }]}
        placeholder="제목"
        placeholderTextColor="#aaa"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.textarea, { color: 'white' }]}
        placeholder="내용"
        placeholderTextColor="#aaa"
        value={content}
        onChangeText={setContent}
        multiline
      />

      <Text style={{ color: 'white', marginBottom: 6 }}>레시피 선택:</Text>
      {recipes.map((recipe) => (
        <Button
          key={recipe.id}
          title={recipe.title}
          color={recipe.id === selectedRecipeId ? 'skyblue' : 'gray'}
          onPress={() => setSelectedRecipeId(recipe.id)}
        />
      ))}

      <Button title="이미지 선택" onPress={handlePickImage} />

      <View style={styles.preview}>
        {images.map((img, idx) => (
          <Image
            key={idx}
            source={{ uri: img.uri }}
            style={{ width: 100, height: 100, margin: 5, borderRadius: 8 }}
          />
        ))}
      </View>

      <Button title="등록하기" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'black',
    flexGrow: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 8,
    padding: 10,
    height: 120,
    marginBottom: 10,
    textAlignVertical: 'top',
  },
  preview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
});
