// npx expo install expo-image-picker

import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

const CreatePost = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState(null);

const pickImageFromGallery = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaType.Images, 
    allowsMultipleSelection: false,
    quality: 1,
  });

  if (!result.canceled) {
    setImageUri(result.assets[0].uri);
  }
};

  const handleSubmit = async () => {
    // 실제로는 imageUri를 Supabase Storage에 업로드 후 URL을 받아야 함
    const { error } = await supabase.from('user_posts').insert([
      {
        title,
        content,
        image_urls: [imageUri],
      },
    ]);

    if (!error) {
      navigation.goBack();
    } else {
      Alert.alert('업로드 실패', '게시물 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        placeholder="제목"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="내용"
        value={content}
        onChangeText={setContent}
        style={[styles.input, { height: 100 }]}
        multiline
      />
      <Button title="갤러리에서 사진 선택" onPress={pickImageFromGallery} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      <Button title="게시하기" onPress={handleSubmit} />
    </SafeAreaView>
  );
};

export default CreatePost;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: {
    borderBottomWidth: 1,
    marginBottom: 15,
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 200,
    marginVertical: 10,
  },
});

