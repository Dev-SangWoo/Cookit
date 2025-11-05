import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@features/auth/contexts/AuthContext';
import SetupIngredientsModal from '@features/refrigerator/screens/SetupIngredientsModal';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import notificationService from '@shared/services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReceiptItems, addReceiptItem, updateReceiptItem, deleteReceiptItem } from '@features/refrigerator/services/receiptItemsApi';

export default function Ingredients() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSelectionModalVisible, setIsSelectionModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]); // 전체 재료 목록
  const [selectedLocation, setSelectedLocation] = useState('all'); // 'all', '냉장', '냉동', '실온'
  
  // 화면이 focus될 때마다 재료 목록을 새로고침
  useFocusEffect(
    useCallback(() => {
      fetchIngredients();
    }, [])
  );

  const fetchIngredients = async () => {
    try {
      const data = await getReceiptItems();
      // expiry_date 기준으로 정렬 (서버에서 반환하는 expiry_date 또는 expiration_date 사용)
      const sortedData = data.sort((a, b) => {
        const dateA = a.expiry_date || a.expiration_date;
        const dateB = b.expiry_date || b.expiration_date;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return new Date(dateA) - new Date(dateB);
      });
      setAllIngredients(sortedData);
      filterIngredientsByLocation(sortedData, selectedLocation);
    } catch (error) {
      console.error('재료 조회 오류:', error);
      Alert.alert('오류', error.message || '재료를 불러오는 데 실패했습니다.');
    }
  };

  // storage_type에 따른 필터링 함수
  const filterIngredientsByLocation = (data, location) => {
    if (location === 'all') {
      setIngredients(data);
    } else {
      const locationMap = {
        'fridge': '냉장',
        'freezer': '냉동',
        'room': '실온'
      };
      const filtered = data.filter(item => item.storage_type === locationMap[location]);
      setIngredients(filtered);
    }
  };

  // 위치 변경 시 필터링
  useEffect(() => {
    if (allIngredients.length > 0) {
      filterIngredientsByLocation(allIngredients, selectedLocation);
    }
  }, [selectedLocation, allIngredients]);

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
    try {
      await addReceiptItem({
        name: newIngredient.name,
        quantity: parseInt(newIngredient.quantity, 10),
        unit: newIngredient.unit,
        expiration_date: newIngredient.expiry,
        storage_type: newIngredient.storage_type || '냉장',
      });

      // 유통기한 알림 스케줄링
      await scheduleExpiryNotification(newIngredient.name, newIngredient.expiry);
      fetchIngredients();
    } catch (error) {
      console.error('재료 추가 오류:', error);
      Alert.alert('저장 실패', error.message || '재료 추가 중 오류가 발생했습니다.');
    }
  };
  

  const handleEditIngredient = async (updatedIngredient) => {
    try {
      await updateReceiptItem(selectedItem.id, {
        name: updatedIngredient.name,
        quantity: parseInt(updatedIngredient.quantity, 10),
        unit: updatedIngredient.unit,
        expiration_date: updatedIngredient.expiry,
        storage_type: updatedIngredient.storage_type || '냉장',
      });

      fetchIngredients(); 
      setIsEditModalVisible(false);
    } catch (error) {
      console.error('재료 수정 오류:', error);
      Alert.alert('수정 실패', error.message || '재료 수정 중 오류가 발생했습니다.');
    }
  };

  const handleRemoveIngredient = async (item) => {
    try {
      await deleteReceiptItem(item.id);
      setIngredients(ingredients.filter(ing => ing.id !== item.id));
    } catch (error) {
      console.error('재료 삭제 오류:', error);
      Alert.alert('삭제 실패', error.message || '재료 삭제 중 오류가 발생했습니다.');
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

  const expiredIngredients = ingredients.filter(item => {
    const expiryDate = item.expiry_date || item.expiration_date;
    return calculateExpiry(expiryDate).diffDays < 0;
  });
  const freshIngredients = ingredients.filter(item => {
    const expiryDate = item.expiry_date || item.expiration_date;
    return calculateExpiry(expiryDate).diffDays >= 0;
  });


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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>내 냉장고</Text>
      </View>

      {/* 위치 탭 */}
      <View style={styles.locationTabs}>
        <TouchableOpacity 
          style={[styles.locationTab, selectedLocation === 'all' && styles.locationTabActive]}
          onPress={() => setSelectedLocation('all')}
          activeOpacity={0.7}
        >
          <Text style={[styles.locationTabText, selectedLocation === 'all' && styles.locationTabTextActive]}>
            🗂️ 전체
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.locationTab, selectedLocation === 'fridge' && styles.locationTabActive]}
          onPress={() => setSelectedLocation('fridge')}
          activeOpacity={0.7}
        >
          <Text style={[styles.locationTabText, selectedLocation === 'fridge' && styles.locationTabTextActive]}>
            ❄️ 냉장
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.locationTab, selectedLocation === 'freezer' && styles.locationTabActive]}
          onPress={() => setSelectedLocation('freezer')}
          activeOpacity={0.7}
        >
          <Text style={[styles.locationTabText, selectedLocation === 'freezer' && styles.locationTabTextActive]}>
            🧊 냉동
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.locationTab, selectedLocation === 'room' && styles.locationTabActive]}
          onPress={() => setSelectedLocation('room')}
          activeOpacity={0.7}
        >
          <Text style={[styles.locationTabText, selectedLocation === 'room' && styles.locationTabTextActive]}>
            🏠 실온
          </Text>
        </TouchableOpacity>
      </View>

      {/* 재료 그리드 */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {ingredients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>재료가 없습니다</Text>
            <Text style={styles.emptySubText}>+ 버튼을 눌러 재료를 추가해보세요</Text>
          </View>
        ) : (
          <View style={styles.ingredientGrid}>
            {ingredients.map((ingredient, index) => {
              const expiryDate = ingredient.expiry_date || ingredient.expiration_date;
              const expiryInfo = calculateExpiry(expiryDate);
              const productName = ingredient.product_name || ingredient.name;
              // 각 행의 마지막 항목(3의 배수 - 1)은 오른쪽 마진 제거
              const isLastInRow = (index + 1) % 3 === 0;
              return (
                <TouchableOpacity 
                  key={ingredient.id || index}
                  style={[
                    styles.ingredientCard,
                    isLastInRow && styles.ingredientCardLastInRow
                  ]}
                  onPress={() => openEditModal(ingredient)}
                  activeOpacity={0.8}
                >
                  {/* 유통기한 배지 */}
                  <View style={[styles.expiryBadge, { backgroundColor: getTagColor(expiryInfo.diffDays) }]}>
                    <Text style={[styles.expiryBadgeText, { color: expiryInfo.color }]}>
                      {expiryInfo.text}
                    </Text>
                  </View>

                  {/* 재료 정보 */}
                  <View style={styles.ingredientContent}>
                    <Text style={styles.ingredientName} numberOfLines={2}>
                      {productName}
                    </Text>
                    <Text style={styles.ingredientQuantity}>
                      {ingredient.quantity}{ingredient.unit}
                    </Text>
                  </View>

                  {/* 삭제 버튼 */}
                  <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={(e) => {
                      e.stopPropagation();
                      Alert.alert(
                        '재료 삭제',
                        `${productName}을(를) 삭제하시겠습니까?`,
                        [
                          { text: '취소', style: 'cancel' },
                          { text: '삭제', onPress: () => handleRemoveIngredient(ingredient), style: 'destructive' }
                        ]
                      );
                    }}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  // 헤더
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
  },
  // 위치 탭
  locationTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  locationTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  locationTabActive: {
    backgroundColor: '#FF6B35',
  },
  locationTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C757D',
  },
  locationTabTextActive: {
    color: '#FFFFFF',
  },
  // 스크롤 영역
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  // 빈 상태
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6C757D',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#ADB5BD',
  },
  // 재료 그리드
  ingredientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  ingredientCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
    marginRight: '5%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  ingredientCardLastInRow: {
    marginRight: 0,
  },
  expiryBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  expiryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  ingredientContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ingredientName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 4,
  },
  ingredientQuantity: {
    fontSize: 11,
    color: '#6C757D',
    fontWeight: '500',
  },
  deleteButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  // 추가 버튼
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 32,
    lineHeight: 32,
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