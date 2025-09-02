// screens/sign/NicknameSetup.js

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function NicknameSetup({ navigation }) {
  const { user } = useAuth();
  const [nickname, setNickname] = useState(user?.name || '');

 
  useEffect(() => {
    if (user?.name) {
      setNickname(user.name);
    }
  }, [user]);

  const handleNext = async () => {
    if (!nickname.trim()) {
      Alert.alert('닉네임 오류', '닉네임을 입력해주세요.');
      return;
    }

    const { data: existingProfiles } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('display_name', nickname);

    if (existingProfiles && existingProfiles.length > 0) {
      Alert.alert('중복된 닉네임', '이미 사용 중인 닉네임입니다.');
      return;
    }

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        display_name: nickname,
        bio: '닉네임이 설정되었습니다.',
      })
      .eq('id', user?.id);

    if (updateError) {
      Alert.alert('저장 오류', '닉네임 저장 중 문제가 발생했습니다.');
      return;
    }

    Alert.alert('성공', '닉네임이 성공적으로 설정되었습니다!');

    // ⭐️ 닉네임 설정 완료 후 'ProfileSetup' 화면으로 이동
  navigation.navigate('ProfileSetup');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>닉네임을 입력해주세요</Text>
      <TextInput
        style={styles.input}
        placeholder={user?.name || "닉네임 입력"} 
        onChangeText={setNickname}
        value={nickname}
      />
      <Button title="다음" onPress={handleNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
    padding: 10,
  },
});