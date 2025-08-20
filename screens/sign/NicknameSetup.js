// NicknameSetup.js
import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function NicknameSetup({ navigation, route }) {
  // ✅ userId와 email을 route.params에서 가져옵니다.
  const { userId, email, googleName, googleAvatar } = route.params;
  const [nickname, setNickname] = useState('');

  const handleNext = async () => {
    // 닉네임 중복 확인
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('display_name', nickname);

    if (existing?.length > 0) {
      Alert.alert('중복된 닉네임', '다른 닉네임을 사용해주세요');
      return;
    }

    // ✅ 변경된 부분: supabase.auth.getUser() 호출을 제거합니다.
    const { error } = await supabase
      .from('user_profiles')
      .insert([{
        id: userId, // 👈 route.params에서 받은 userId를 바로 사용
        email,      // 👈 route.params에서 받은 email을 바로 사용
        display_name: nickname || googleName,
        avatar_url: googleAvatar || '',
      }]);

    if (error) {
      Alert.alert('저장 오류', '닉네임 저장 중 문제가 발생했습니다');
      console.error('닉네임 저장 오류:', error);
      return;
    }

    navigation.replace('ProfileSetup', {
      userId,
      email,
      display_name: nickname || googleName,
      googleAvatar: googleAvatar || ''
    });
  };

  return (
    <View style={styles.container}>
      <Text>닉네임을 입력해주세요</Text>
      <TextInput
        style={styles.input}
        placeholder={googleName || '닉네임 입력'}
        value={nickname}
        onChangeText={setNickname}
      />
      <Button title="다음" onPress={handleNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, justifyContent:'center', padding:20 },
  input:{ borderWidth:1, borderColor:'#ccc', borderRadius:5, marginBottom:20, padding:10 }
});