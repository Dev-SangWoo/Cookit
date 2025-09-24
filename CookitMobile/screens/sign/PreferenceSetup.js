import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import ModalSelect from '../modal/ModalSelect';
import { useAuth } from '../../contexts/AuthContext'; // ⭐️ useAuth import
import { useNavigation } from '@react-navigation/native';

export default function PreferenceSetup({ navigation }) {
  const { user, updateUserProfile } = useAuth(); // ⭐️ user와 updateUserProfile 함수 가져오기
  const [isCuisineModalVisible, setCuisineModalVisible] = useState(false);
  const [isAllergenModalVisible, setAllergenModalVisible] = useState(false);

  const allergenOptions = [
    '우유', '계란', '밀', '콩', '땅콩', '견과류', '갑각류', '생선', '조개류'
  ];

  const [favoriteOptions, setFavoriteOptions] = useState([]);
  const [favoriteCuisines, setFavoriteCuisines] = useState(user?.favorite_cuisines || []);
  const [dietaryRestrictions, setDietaryRestrictions] = useState(user?.dietary_restrictions || []);

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
  const handleNext = async () => {
    // 1. Supabase에 데이터 저장
    const { error: saveError } = await supabase
      .from('user_profiles')
      .update({
        favorite_cuisines: favoriteCuisines,
        dietary_restrictions: dietaryRestrictions
      })
      .eq('id', user?.id);

    if (saveError) {
      Alert.alert('저장 실패', saveError.message);
      return;
    }

    // 2. AuthProvider의 상태를 업데이트합니다.
    await updateUserProfile({
      favorite_cuisines: favoriteCuisines,
      dietary_restrictions: dietaryRestrictions
    });

    // 3. 다음 화면으로 이동
    navigation.replace('ManageSetup'); // 'ManageSetup'은 다음 화면의 이름으로 가정합니다.
  };


  const handleRemoveCuisine = (cuisineToRemove) => {
    setFavoriteCuisines(favoriteCuisines.filter(cuisine => cuisine !== cuisineToRemove));
  };

  const handleRemoveAllergen = (allergenToRemove) => {
    setDietaryRestrictions(dietaryRestrictions.filter(allergen => allergen !== allergenToRemove));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.step}>3/4</Text>
      <Text style={styles.title}>취향을 알려주세요</Text>
      <Text style={styles.titleText}>레시피 추천할 때 참고할게요</Text>

      <Text style={styles.sectionTitle}>선호하는 재료</Text>
      <View style={styles.tagContainer}>
        {favoriteCuisines.map((cuisine) => (
          <TouchableOpacity
            key={cuisine}
            style={[styles.tagButton, styles.favoriteTag]}
            onPress={() => handleRemoveCuisine(cuisine)}
          >
            <Text style={[styles.tagText, styles.favoriteText]}>{cuisine}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setCuisineModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ModalSelect
        visible={isCuisineModalVisible}
        options={favoriteOptions}
        selected={favoriteCuisines}
        onClose={() => setCuisineModalVisible(false)}
        onSelect={setFavoriteCuisines}
      />

      <Text style={styles.sectionTitle}>비선호하는 재료</Text>
      <View style={styles.tagContainer}>
        {dietaryRestrictions.map((allergen) => (
          <TouchableOpacity
            key={allergen}
            style={[styles.tagButton, styles.dietaryTag]}
            onPress={() => handleRemoveAllergen(allergen)}
          >
            <Text style={[styles.tagText, styles.dietaryText]}>{allergen}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setAllergenModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <ModalSelect
        visible={isAllergenModalVisible}
        options={allergenOptions}
        selected={dietaryRestrictions}
        onClose={() => setAllergenModalVisible(false)}
        onSelect={setDietaryRestrictions}
      />

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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 120, // 최소 높이 설정
    alignItems: 'flex-start',
    gap: 8, // 태그 사이의 간격
  },
  favoriteTag: {
    backgroundColor: '#e6f7e9',
    borderColor: '#38a169',
  },
  favoriteText: {
    color: '#38a169',
  },

  // ⭐️ 비선호하는 재료 태그 스타일 (붉은색 느낌)
  dietaryTag: {
    backgroundColor: '#fde8e8',
    borderColor: '#e53e3e',
  },
  dietaryText: {
    color: '#e53e3e',
  },
  tagButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: {
    color: '#333',
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 20,
    color: '#ccc',
    lineHeight: 20,
  },


  buttonWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 50,
  },
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
