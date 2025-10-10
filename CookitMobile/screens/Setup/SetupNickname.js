import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function SetupNickname({ navigation }) {
  const { user, updateUserProfile } = useAuth();
  const [nickname, setNickname] = useState(user?.name || '');
  const [cookingLevel, setCookingLevel] = useState(user?.cooking_level || '');

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

    if (!cookingLevel) {
      Alert.alert('오류', '요리 레벨을 선택해주세요.');
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
        cooking_level: cookingLevel,
        // bio: '닉네임이 설정되었습니다.',
      })
      .eq('id', user?.id);

    if (updateError) {
      Alert.alert('저장 오류', '닉네임 저장 중 문제가 발생했습니다.');
      return;
    }

    await updateUserProfile({
      display_name: nickname,
      cooking_level: cookingLevel,
    });

    navigation.replace('SetupProfile');
  };

  const cookingOptions = [
    { label: '초급 - 라면, 계란요리 정도 가능해요', value: 'beginner' },
    { label: '중급 - 기본적인 요리 가능해요', value: 'intermediate' },
    { label: '고급 - 복잡한 요리도 자신있어요', value: 'advanced' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.step}>1/4</Text>
      <Text style={styles.title}>닉네임, 요리 실력 설정</Text>
      <Text style={styles.titleText}>개인화된 레시피 추천을 위해{"\n"} 기본 정보를 입력해주세요</Text>
      <Text style={styles.sectionTitle}>닉네임</Text>
      <TextInput
        style={styles.input}
        placeholder={user?.name || "닉네임 입력"}
        onChangeText={setNickname}
        value={nickname}
      />
      <Text style={styles.sectionTitle}>요리 실력</Text>
      <View style={styles.optionGroup}>
        {cookingOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              cookingLevel === option.value && styles.optionSelected
            ]}
            onPress={() => setCookingLevel(option.value)}
          >
            <Text style={styles.optionText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.buttonWrapper}>
  <TouchableOpacity
    style={styles.buttonNext}
    onPress={handleNext}
  >
    <Text style={styles.buttonText}>다음</Text>
  </TouchableOpacity>
</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    padding: 20,
    paddingTop: 60,
  },
  step: {
    color: 'orange',
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  titleText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
    padding: 10,
    paddingVertical: 12,
    
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  optionGroup: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  optionSelected: {
    backgroundColor: '#ffcc80',
    borderColor: 'orange',
  },
  optionText: {
    color: '#333',
    textAlign: 'center',
  },
  buttonWrapper: {
    flex: 1,
    justifyContent: 'flex-end', // 내용을 아래쪽으로 정렬
    marginBottom: 50, // 화면 하단에서 조금 띄워줌
  },
  
  // 버튼 자체의 스타일
  buttonNext: {
    backgroundColor: 'orange',
    borderRadius: 50,
    width: '100%',
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold'
  },
});
