import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView, Modal } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import SetupIngredientsModal from '../Setup/SetupIngredientsModal';
import { useNavigation } from '@react-navigation/native';
import notificationService from '../../services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Ingredients() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSelectionModalVisible, setIsSelectionModalVisible] = useState(false);
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
    // 🚨 날짜 파싱 안정성을 위해 형식 변환 로직을 추가합니다. (이전 대화에서 다룬 내용)
    const dateToParse = expiryDate ? expiryDate.replace(/\//g, '-') : ''; 

    const today = new Date();
    const expiry = new Date(dateToParse);

    // 날짜 파싱 실패 방지
    if (!dateToParse || isNaN(expiry.getTime())) {
        return { diffDays: NaN, text: 'D-??', color: 'gray' };
    }
    
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let text;
    let color;
    
    if (diffDays > 0) {
        text = `D-${diffDays}`;
        color = 'green';
    } else if (diffDays === 0) {
        text = 'D-Day';
        color = 'orange'; 
    } else {
        text = `D+${Math.abs(diffDays)}`;
        color = 'red';
    }
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
      // 유통기한 알림 스케줄링
      await scheduleExpiryNotification(newIngredient.name, newIngredient.expiry);
      fetchIngredients();
    }
  };
  

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
      fetchIngredients(); 
      setIsEditModalVisible(false); 
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


  const openEditModal = (item) => {
    setSelectedItem(item);
    setIsEditModalVisible(true);
  };

  // 선택 모달 열기
  const openSelectionModal = () => {
    setIsSelectionModalVisible(true);
  };

  // 수동 입력 선택
  const handleManualInput = () => {
    setIsSelectionModalVisible(false);
    setIsModalVisible(true);
  };

  // 영수증 OCR 선택
  const handleReceiptOcr = () => {
    setIsSelectionModalVisible(false);
    navigation.navigate('Receipt', { screen: 'ReceiptMain' });
  };

  // 유통기한 알림 스케줄링
  const scheduleExpiryNotification = async (ingredientName, expiryDate) => {
    try {
      // 알림 설정 확인
      const settings = await AsyncStorage.getItem('notificationSettings');
      if (settings) {
        const { expiryNotifications, expiryHoursBefore } = JSON.parse(settings);
        if (expiryNotifications) {
          await notificationService.scheduleExpiryNotification(
            ingredientName,
            expiryDate,
            expiryHoursBefore || 24
          );
        }
      }
    } catch (error) {
      console.error('유통기한 알림 스케줄링 실패:', error);
    }
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
        onPress={openSelectionModal}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <SetupIngredientsModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAddIngredient={handleAddIngredient}
      />


      <SetupIngredientsModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onAddIngredient={handleEditIngredient} 
        isEditing={true} 
        initialData={selectedItem}
      />

      {/* 선택 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSelectionModalVisible}
        onRequestClose={() => setIsSelectionModalVisible(false)}
      >
        <View style={styles.selectionModalOverlay}>
          <View style={styles.selectionModalContent}>
            <Text style={styles.selectionModalTitle}>재료 추가 방법</Text>
            <Text style={styles.selectionModalSubtitle}>어떤 방법으로 재료를 추가하시겠습니까?</Text>
            
            <TouchableOpacity 
              style={styles.selectionButton}
              onPress={handleManualInput}
            >
              <Text style={styles.selectionButtonIcon}>✏️</Text>
              <Text style={styles.selectionButtonTitle}>수동 입력</Text>
              <Text style={styles.selectionButtonSubtitle}>직접 재료 정보를 입력합니다</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.selectionButton}
              onPress={handleReceiptOcr}
            >
              <Text style={styles.selectionButtonIcon}>📷</Text>
              <Text style={styles.selectionButtonTitle}>영수증 촬영</Text>
              <Text style={styles.selectionButtonSubtitle}>영수증을 촬영하여 자동으로 추가합니다</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.selectionCancelButton}
              onPress={() => setIsSelectionModalVisible(false)}
            >
              <Text style={styles.selectionCancelButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  // 선택 모달 스타일
  selectionModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  selectionModalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  selectionModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  selectionModalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
    textAlign: 'center',
  },
  selectionButton: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectionButtonIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  selectionButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  selectionButtonSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  selectionCancelButton: {
    width: '100%',
    backgroundColor: '#6c757d',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  selectionCancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});