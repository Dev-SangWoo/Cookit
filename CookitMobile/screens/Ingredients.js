import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ModalInput from './modal/ModalInput';

export default function Ingredients() {
  const { user } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  
  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    const { data, error } = await supabase
      .from('receipt_items')
      .select('*')
      .eq('user_id', user?.id)
      .order('expiry_date', { ascending: true }); 

    if (error) {
      Alert.alert('오류', '재료를 불러오는 데 실패했습니다.');
    } else {
      setIngredients(data);
    }
  };

  const calculateExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const text = diffDays >= 0 ? `D+${diffDays}` : `D-${Math.abs(diffDays)}`;
    const color = diffDays >= 0 ? 'green' : 'red';
    
    return { diffDays, text, color };
  };

  const handleAddIngredient = async (newIngredient) => {
    const { error } = await supabase
      .from('receipt_items')
      .insert({
        user_id: user.id,
        product_name: newIngredient.name,
        quantity: parseInt(newIngredient.quantity, 10),
        unit: newIngredient.unit,
        expiry_date: newIngredient.expiry,
      });

    if (error) {
      Alert.alert('저장 실패', error.message);
    } else {
      fetchIngredients();
    }
  };
  
  // New function to handle ingredient editing
  const handleEditIngredient = async (updatedIngredient) => {
    const { error } = await supabase
      .from('receipt_items')
      .update({
        product_name: updatedIngredient.name,
        quantity: parseInt(updatedIngredient.quantity, 10),
        unit: updatedIngredient.unit,
        expiry_date: updatedIngredient.expiry,
      })
      .eq('id', selectedItem.id);

    if (error) {
      Alert.alert('수정 실패', error.message);
    } else {
      fetchIngredients(); // Refresh the list
      setIsEditModalVisible(false); // Close the modal
    }
  };

  const handleRemoveIngredient = async (item) => {
    const { error } = await supabase
      .from('receipt_items')
      .delete()
      .eq('id', item.id); 

    if (error) {
      Alert.alert('삭제 실패', error.message);
    } else {
      setIngredients(ingredients.filter(ing => ing.id !== item.id));
    }
  };

  const getTagColor = (diffDays) => {
    if (diffDays < 0) {
      return '#FFCDD2';
    } else if (diffDays <= 3) {
      return '#FFECB3';
    } else {
      return '#C8E6C9';
    }
  };

  const expiredIngredients = ingredients.filter(item => calculateExpiry(item.expiry_date).diffDays < 0);
  const freshIngredients = ingredients.filter(item => calculateExpiry(item.expiry_date).diffDays >= 0);

  // Function to open the edit modal
  const openEditModal = (item) => {
    setSelectedItem(item);
    setIsEditModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>내 냉장고</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {expiredIngredients.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: '#FF0000' }]}> 유통기한 지난 재료</Text>
            {expiredIngredients.map((ingredient, index) => {
              const expiryInfo = calculateExpiry(ingredient.expiry_date);
              return (
                <TouchableOpacity 
                  key={ingredient.id || index}
                  style={[styles.ingredientTag, { backgroundColor: getTagColor(expiryInfo.diffDays) }]}
                  onPress={() => handleRemoveIngredient(ingredient)}
                >
                  <Text style={styles.ingredientName}>{ingredient.product_name}</Text>
                  <Text style={styles.ingredientQuantity}>{ingredient.quantity}{ingredient.unit}</Text>
                  <Text style={[styles.ingredientExpiry, { color: expiryInfo.color }]}>
                    {expiryInfo.text}
                  </Text>
                  <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(ingredient)}>
                    <Text style={styles.editButtonText}>✏️</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {freshIngredients.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: '#008000' }]}> 신선한 재료</Text>
            {freshIngredients.map((ingredient, index) => {
              const expiryInfo = calculateExpiry(ingredient.expiry_date);
              return (
                <TouchableOpacity 
                  key={ingredient.id || index}
                  style={[styles.ingredientTag, { backgroundColor: getTagColor(expiryInfo.diffDays) }]}
                  onPress={() => handleRemoveIngredient(ingredient)}
                >
                  <Text style={styles.ingredientName}>{ingredient.product_name}</Text>
                  <Text style={styles.ingredientQuantity}>{ingredient.quantity}{ingredient.unit}</Text>
                  <Text style={[styles.ingredientExpiry, { color: expiryInfo.color }]}>
                    {expiryInfo.text}
                  </Text>
                  <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(ingredient)}>
                    <Text style={styles.editButtonText}>✏️</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <ModalInput
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAddIngredient={handleAddIngredient}
      />


      <ModalInput
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onAddIngredient={handleEditIngredient} 
        isEditing={true} 
        initialData={selectedItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  ingredientTag: {
    width: '48%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    alignItems: 'flex-start',
    position: 'relative',
  },
  ingredientName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  ingredientQuantity: {
    fontSize: 14,
    color: '#666',
  },
  ingredientExpiry: {
    marginTop: 5,
    fontWeight: 'bold',
  },
  editButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    padding: 5,
  },
  editButtonText: {
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'orange',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 30,
    lineHeight: 30,
  },
  sectionHeader: {
    width: '100%',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
});