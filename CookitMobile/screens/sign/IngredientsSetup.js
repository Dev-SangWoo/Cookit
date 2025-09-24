import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import ModalInput from '../modal/ModalInput';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function IngredientsSetup() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [ingredients, setIngredients] = useState([]);

  const handleAddIngredient = (newIngredient) => {
    setIngredients([...ingredients, newIngredient]);
  };

  const handleRemoveIngredient = (ingredientToRemove) => {
    setIngredients(ingredients.filter(ing => ing.name !== ingredientToRemove.name || ing.quantity !== ingredientToRemove.quantity));
  };
  
  const handleStart = async () => {
    if (ingredients.length === 0) {
      Alert.alert('오류', '재료를 하나 이상 등록해주세요.');
      return;
    }

    const receiptItems = ingredients.map(ing => ({
      user_id: user?.id,
      product_name: ing.name,
      quantity: ing.quantity,
    }));
    
    const { error } = await supabase
      .from('receipt_items')
      .insert(receiptItems);

    if (error) {
      Alert.alert('저장 실패', error.message);
      return;
    }

    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeTab' }],
    });
  };

 return (
    <View style={styles.container}>
      <Text style={styles.step}>4/4</Text>
      <Text style={styles.title}>냉장고 등록</Text>
      <Text style={styles.titleText}>현재 보유한 재료와{"\n"}유통기한을 등록해 주세요</Text>
      <Text style={styles.sectionTitle}>현재 보유한 재료</Text>

      <View style={styles.tagWrapper}>
        <ScrollView style={styles.scrollArea}>
          {ingredients.map((ingredient, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.ingredientTag}
              onPress={() => handleRemoveIngredient(ingredient)}
            >
              <Text style={styles.ingredientName}>{ingredient.name}</Text>
              <Text style={styles.ingredientQuantity}>{ingredient.quantity}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ModalInput
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAddIngredient={handleAddIngredient}
      />
      
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={styles.buttonNext}
          onPress={handleStart}
        >
          <Text style={styles.buttonText}>시작하기</Text>
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
 tagWrapper: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 120,
    flex: 1, 
    flexDirection: 'column', 
  },
  scrollArea: {
    flex: 1, 
    marginBottom: 10,
  },
  ingredientTag: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#ffcc80',
    borderColor: 'orange',
    borderWidth: 1,
    marginBottom: 8, 
  },
  ingredientName: {
    fontWeight: 'bold',
    color: '#333'
  },
  ingredientQuantity: {
    color: '#555',
  },
  addButton: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 20,
    color: '#333',
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
    fontWeight: 'bold',
  },
});