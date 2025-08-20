// 닉네임 입력

import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function NicknameSetup({ navigation, route }) {
  const { userId, email, googleName, googleAvatar } = route.params;
  const [nickname, setNickname] = useState('');

const handleNext = async () => {
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('display_name', nickname);

  if (existing?.length > 0) {
    Alert.alert('중복된 닉네임', '다른 닉네임을 사용해주세요');
    return;
  }

  const { error } = await supabase
    .from('user_profiles')
    .insert([{
      id: userId,
      email,
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
