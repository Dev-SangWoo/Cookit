import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Button, Image, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import 'react-native-get-random-values';
import { SafeAreaView } from 'react-native-safe-area-context';
import { v4 as uuid } from 'uuid';
import { useNavigation } from '@react-navigation/native'; // ✅ expo-router 대신 react-navigation 훅을 import
import React, { useState } from 'react';

const decode = (str: string) => {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'base64');
  } else {
    const binaryString = atob(str);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
};

export default function CreatePost() {
  const { user } = useAuth();
  const navigation = useNavigation(); // ✅ useRouter() 대신 useNavigation() 사용

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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
    setIsUploading(true);

    for (const image of images) {
      try {
        const fileExt = image.uri.split('.').pop();
        const fileName = `${uuid()}.${fileExt}`;
        const filePath = `posts/${user?.id}/${fileName}`;

        const base64 = await FileSystem.readAsStringAsync(image.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const contentType = image.mimeType || 'image/jpeg';
        const binaryData = decode(base64);

        const { error } = await supabase.storage
          .from('user-post-images')
          .upload(filePath, binaryData, {
            contentType,
            upsert: true,
          });

        if (error) {
          console.error('이미지 업로드 실패:', error);
          Alert.alert('이미지 업로드 실패', error.message);
          setIsUploading(false);
          return [];
        }

        const { data } = supabase.storage.from('user-post-images').getPublicUrl(filePath);
        uploadedUrls.push(data.publicUrl);
      } catch (err) {
        console.error('이미지 처리 중 오류 발생:', err);
        Alert.alert('이미지 처리 실패', '이미지를 업로드하는 중 오류가 발생했습니다.');
        setIsUploading(false);
        return [];
      }
    }
    setIsUploading(false);
    return uploadedUrls;
  };

const handleSubmit = async () => {
    if (!user) return;
    setIsUploading(true);

    if (!title || !content) {
      Alert.alert('오류', '제목과 내용을 모두 입력해주세요.');
      setIsUploading(false);
      return;
    }

    const imageUrls = await uploadImages();
    if (imageUrls.length !== images.length) {
      setIsUploading(false);
      return;
    }

    const { error } = await supabase.from('user_posts').insert({
      user_id: user.id,
      title,
      content,
      image_urls: imageUrls,
    });

    if (error) {
      console.error('게시글 등록 실패:', error);
      Alert.alert('게시글 등록 실패', error.message);
    } else {
      Alert.alert(
        '등록 완료',
        '게시글이 등록되었습니다.',
        [
          {
            text: '확인',
            onPress: () => {
              console.log('확인 버튼이 눌렸습니다. 이전 화면으로 돌아갑니다.');
              navigation.goBack(); // ✅ router.back() 대신 navigation.goBack() 사용
            },
          },
        ]
      );
    }
    setIsUploading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
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

      <Button title="이미지 선택" onPress={handlePickImage} disabled={isUploading} />

      <ScrollView horizontal contentContainerStyle={styles.preview}>
        {images.map((img, idx) => (
          <Image
            key={idx}
            source={{ uri: img.uri }}
            style={{ width: 100, height: 100, margin: 5, borderRadius: 8 }}
          />
        ))}
      </ScrollView>

      <Button
        title={isUploading ? "등록 중..." : "등록하기"}
        onPress={handleSubmit}
        disabled={isUploading || images.length === 0}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'black',
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  textarea: { // ✅ 이 부분이 누락되었습니다.
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 8,
    padding: 10,
    height: 120,
    marginBottom: 10,
    textAlignVertical: 'top',
  },
  preview: { // ✅ 이 부분도 누락되었습니다.
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
});