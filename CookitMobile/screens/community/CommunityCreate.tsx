import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import 'react-native-get-random-values';
import { SafeAreaView } from 'react-native-safe-area-context';
import { v4 as uuid } from 'uuid';
import { useNavigation } from '@react-navigation/native';
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

export default function CommunityCreate() {
  const { user } = useAuth();
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '앨범 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets]);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
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
        const contentType = image.mimeType || 'image/jpeg';

        const base64 = await FileSystem.readAsStringAsync(image.uri, {
          encoding: 'base64',
        });
        
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
              navigation.goBack();
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
        style={styles.input}
        placeholder="제목"
        placeholderTextColor="#999"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.textarea}
        placeholder="내용"
        placeholderTextColor="#999"
        value={content}
        onChangeText={setContent}
        multiline
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.imageButton} onPress={handlePickImage} disabled={isUploading}>
          <Text style={styles.imageButtonText}>앨범에서 선택</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.imageButton} onPress={handleTakePhoto} disabled={isUploading}>
          <Text style={styles.imageButtonText}>사진 촬영</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal contentContainerStyle={styles.preview}>
        {images.map((img, idx) => (
          <Image
            key={idx}
            source={{ uri: img.uri }}
            style={styles.previewImage}
          />
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.submitButton, isUploading || images.length === 0 && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={isUploading || images.length === 0}
      >
        <Text style={styles.submitButtonText}>{isUploading ? "등록 중..." : "등록하기"}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
    color: '#333',
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    height: 150,
    marginBottom: 15,
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  imageButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#FFC107',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
    resizeMode: 'cover',
  },
  submitButton: {
    backgroundColor: '#FFC107',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});