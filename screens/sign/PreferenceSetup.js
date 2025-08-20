import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import ModalSelect from '../modal/ModalSelect';

export default function PreferenceSetup({ navigation, route }) {
  const [isCuisineModalVisible, setCuisineModalVisible] = useState(false);
  const [isAllergenModalVisible, setAllergenModalVisible] = useState(false);

  const {
    userId, email, display_name,
    avatar_url, bio, cooking_level
  } = route.params;

  const allergenOptions = [
    '우유', '계란', '밀', '콩', '땅콩', '견과류', '갑각류', '생선', '조개류'
  ];

  const [favoriteOptions, setFavoriteOptions] = useState([]);
  const [favoriteCuisines, setFavoriteCuisines] = useState([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);

  // ✅ recipe_categories 불러오기
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error: categoryError } = await supabase
        .from('recipe_categories')
        .select('name');

      if (categoryError) {
        Alert.alert('카테고리 불러오기 실패', categoryError.message);
        return;
      }

      setFavoriteOptions(data.map(item => item.name));
    };

    fetchCategories();
  }, []);

  // ✅ 사용자 정보 저장
  const handleSave = async () => {
    const { error: saveError } = await supabase.from('user_profiles').insert({
      id: userId,
      email,
      display_name,
      avatar_url,
      bio,
      cooking_level,
      favorite_cuisines: favoriteCuisines,
      dietary_restrictions: dietaryRestrictions
    });

    if (saveError) {
      Alert.alert('저장 실패', saveError.message);
      return;
    }

    navigation.replace('HomeTab');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>선호 요리 선택</Text>
      <Button title="선호 요리 선택" onPress={() => setCuisineModalVisible(true)} />
      <ModalSelect
        visible={isCuisineModalVisible}
        options={favoriteOptions}
        selected={favoriteCuisines}
        onClose={() => setCuisineModalVisible(false)}
        onSelect={setFavoriteCuisines}
      />

      <Text style={styles.label}>알레르기 음식 선택</Text>
      <Button title="알레르기 선택" onPress={() => setAllergenModalVisible(true)} />
      <ModalSelect
        visible={isAllergenModalVisible}
        options={allergenOptions}
        selected={dietaryRestrictions}
        onClose={() => setAllergenModalVisible(false)}
        onSelect={setDietaryRestrictions}
      />

      <View style={styles.summaryBox}>
        <Text>선호 요리: {favoriteCuisines.join(', ') || '선택 안됨'}</Text>
        <Text>알레르기: {dietaryRestrictions.join(', ') || '없음'}</Text>
      </View>

      <Button title="저장" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  label: {
    marginVertical: 10,
    fontSize: 16
  },
  summaryBox: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
});
