import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext'; 
import { useNavigation } from '@react-navigation/native';
import SetupPreferenceModal from './SetupPreferenceModal';
import { getRecipeCategoryNames, updateProfile } from '../../services/userApi';

export default function SetupPreference({ navigation }) {
  const { user, updateUserProfile } = useAuth(); 
  const [isCuisineModalVisible, setCuisineModalVisible] = useState(false);
  const [isAllergenModalVisible, setAllergenModalVisible] = useState(false);

  const allergenOptions = [
    '우유', '계란', '밀', '콩', '땅콩', '견과류', '갑각류', '생선', '조개류'
  ];

  const [favoriteOptions, setFavoriteOptions] = useState([]);
  const [favoriteCuisines, setFavoriteCuisines] = useState(user?.favorite_cuisines || []);
  const [dietaryRestrictions, setDietaryRestrictions] = useState(user?.dietary_restrictions || []);

  const handleBack = () => {
    navigation.goBack();
  };

  // ✅ recipe_categories 불러오기 (서버 API 사용)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryNames = await getRecipeCategoryNames();
        setFavoriteOptions(categoryNames);
      } catch (error) {
        console.error('카테고리 불러오기 오류:', error);
        Alert.alert('카테고리 불러오기 실패', error.message);
      }
    };

    fetchCategories();
  }, []);

  // ✅ 사용자 정보 저장 (서버 API 사용)
  const handleNext = async () => {
    try {
      // 1. 서버 API를 통해 프로필 업데이트
      await updateProfile({
        favorite_cuisines: favoriteCuisines,
        dietary_restrictions: dietaryRestrictions
      });

      // 2. AuthProvider의 상태를 업데이트합니다.
      await updateUserProfile({
        favorite_cuisines: favoriteCuisines,
        dietary_restrictions: dietaryRestrictions
      });

      // 3. 다음 화면으로 이동
      navigation.navigate('SetupIngredients');
    } catch (error) {
      console.error('저장 오류:', error);
      Alert.alert('저장 실패', error.message || '정보 저장 중 문제가 발생했습니다.');
    }
  };


  const handleRemoveCuisine = (cuisineToRemove) => {
    setFavoriteCuisines(favoriteCuisines.filter(cuisine => cuisine !== cuisineToRemove));
  };

  const handleRemoveAllergen = (allergenToRemove) => {
    setDietaryRestrictions(dietaryRestrictions.filter(allergen => allergen !== allergenToRemove));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>
      <Text style={styles.step}>3/4</Text>
      <Text style={styles.title}>취향을 알려주세요</Text>
      <Text style={styles.titleText}>레시피 추천할 때 참고할게요</Text>

      <Text style={styles.sectionTitle}>선호하는 재료</Text>
      <Text style={styles.sectionDescription}>좋아하는 재료를 선택하면 맞춤 레시피를 추천해드려요</Text>
      
      <View style={styles.tagContainer}>
        {favoriteCuisines.length > 0 ? (
          favoriteCuisines.map((cuisine) => (
            <TouchableOpacity
              key={cuisine}
              style={[styles.tagButton, styles.favoriteTag]}
              onPress={() => handleRemoveCuisine(cuisine)}
            >
              <Text style={[styles.tagText, styles.favoriteText]}>{cuisine}</Text>
              <Ionicons name="close-circle" size={18} color="#38a169" style={styles.tagIcon} />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>선택된 재료가 없습니다</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setCuisineModalVisible(true)}
      >
        <Ionicons name="add-circle-outline" size={24} color="orange" />
        <Text style={styles.selectButtonText}>선호 재료 선택하기</Text>
      </TouchableOpacity>

      <SetupPreferenceModal
        visible={isCuisineModalVisible}
        options={favoriteOptions}
        selected={favoriteCuisines}
        onClose={() => setCuisineModalVisible(false)}
        onSelect={setFavoriteCuisines}
        title="선호하는 재료 선택"
      />
      

      <Text style={styles.sectionTitle}>비선호하는 재료</Text>
      <Text style={styles.sectionDescription}>알러지가 있거나 싫어하는 재료를 선택해주세요</Text>
      
      <View style={styles.tagContainer}>
        {dietaryRestrictions.length > 0 ? (
          dietaryRestrictions.map((allergen) => (
            <TouchableOpacity
              key={allergen}
              style={[styles.tagButton, styles.dietaryTag]}
              onPress={() => handleRemoveAllergen(allergen)}
            >
              <Text style={[styles.tagText, styles.dietaryText]}>{allergen}</Text>
              <Ionicons name="close-circle" size={18} color="#e53e3e" style={styles.tagIcon} />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>선택된 재료가 없습니다</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setAllergenModalVisible(true)}
      >
        <Ionicons name="add-circle-outline" size={24} color="orange" />
        <Text style={styles.selectButtonText}>비선호 재료 선택하기</Text>
      </TouchableOpacity>

      <SetupPreferenceModal
        visible={isAllergenModalVisible}
        options={allergenOptions}
        selected={dietaryRestrictions}
        onClose={() => setAllergenModalVisible(false)}
        onSelect={setDietaryRestrictions}
        title="비선호하는 재료 선택"
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  step: {
    color: 'orange',
    fontSize: 16,
    marginBottom: 10,
    marginTop: 40,
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
    marginTop: 24,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    backgroundColor: '#f9f9f9',
    gap: 8,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
    alignSelf: 'center',
    marginVertical: 8,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 2,
  },
  tagText: {
    fontSize: 15,
    fontWeight: '500',
  },
  tagIcon: {
    marginLeft: 6,
  },
  favoriteTag: {
    backgroundColor: '#e6f7e9',
    borderColor: '#38a169',
  },
  favoriteText: {
    color: '#38a169',
  },
  dietaryTag: {
    backgroundColor: '#fde8e8',
    borderColor: '#e53e3e',
  },
  dietaryText: {
    color: '#e53e3e',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF4E6',
    borderWidth: 2,
    borderColor: 'orange',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 12,
    gap: 8,
  },
  selectButtonText: {
    color: 'orange',
    fontSize: 16,
    fontWeight: '600',
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
