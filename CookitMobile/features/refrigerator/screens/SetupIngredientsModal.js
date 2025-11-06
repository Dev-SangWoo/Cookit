// 재료 추가/수정 모달

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WheelDatePicker from '@shared/components/WheelDatePicker';

const SetupIngredientsModal = ({ visible, onClose, onAddIngredient, isEditing, initialData }) => {
  const [ingredientName, setIngredientName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('개');
  const [selectedStorageType, setSelectedStorageType] = useState('냉장');

  const units = ['개', 'g', 'kg', 'ml', 'L', '봉', '팩', '컵', '캔', '통'];
  const storageTypes = ['냉장', '냉동', '실온'];


  useEffect(() => {
    if (isEditing && initialData) {
      setIngredientName(initialData.product_name || initialData.name);
      setQuantity(initialData.quantity?.toString() || '');
      setSelectedDate(initialData.expiry_date || initialData.expiration_date);
      setSelectedUnit(initialData.unit || '개');
      setSelectedStorageType(initialData.storage_type || '냉장');
    } else {
      setIngredientName('');
      setQuantity('');
      setSelectedDate('');
      setSelectedUnit('개');
      setSelectedStorageType('냉장');
    }
  }, [isEditing, initialData]);
  const handleAdd = () => {
    if (!ingredientName.trim() || !quantity.trim() || !selectedDate) {
      Alert.alert('오류', '재료 이름, 개수, 유통기한을 모두 입력하세요.');
      return;
    }

    onAddIngredient({
      name: ingredientName,
      quantity: quantity,
      unit: selectedUnit,
      expiry: selectedDate,
      storage_type: selectedStorageType
    });
    setIngredientName('');
    setQuantity('');
    setSelectedDate('');
    setSelectedUnit('개');
    setSelectedStorageType('냉장');
    onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '유통기한 선택';
    const [year, month, day] = dateString.split('/');
    return `${year}년 ${month}월 ${day}일`;
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={modalStyles.centeredView}
      >
        <View style={modalStyles.modalView}>
          {/* Header */}
          <View style={modalStyles.header}>
            <Text style={modalStyles.modalTitle}>
              <Ionicons name="basket-outline" size={24} color="#FF8C00" /> 재료 등록
            </Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <Ionicons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* 보관 방법 */}
            <View style={modalStyles.section}>
              <Text style={modalStyles.label}>
                <Ionicons name="snow-outline" size={16} color="#666" /> 보관 방법
              </Text>
              <View style={modalStyles.storageTypeContainer}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={modalStyles.storageTypeScrollContent}
                >
                  {storageTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        modalStyles.storageTypeButton,
                        selectedStorageType === type && modalStyles.storageTypeButtonSelected
                      ]}
                      onPress={() => setSelectedStorageType(type)}
                    >
                      <Text style={[
                        modalStyles.storageTypeButtonText,
                        selectedStorageType === type && modalStyles.storageTypeButtonTextSelected
                      ]}>
                        {type === '냉장' ? '❄️' : type === '냉동' ? '🧊' : '🏠'} {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* 재료 이름 */}
            <View style={modalStyles.section}>
              <Text style={modalStyles.label}>
                <Ionicons name="pricetag-outline" size={16} color="#666" /> 재료 이름
              </Text>
              <TextInput
                style={modalStyles.input}
                placeholder="예: 양파, 당근, 우유..."
                value={ingredientName}
                onChangeText={setIngredientName}
                placeholderTextColor="#999"
              />
            </View>

            {/* 수량 */}
            <View style={modalStyles.section}>
              <Text style={modalStyles.label}>
                <Ionicons name="scale-outline" size={16} color="#666" /> 수량
              </Text>
              <View style={modalStyles.quantityContainer}>
                <View style={modalStyles.quantityInputContainer}>
                  <TouchableOpacity
                    style={modalStyles.quantityButton}
                    onPress={() => {
                      const currentQty = parseInt(quantity) || 0;
                      if (currentQty > 0) {
                        setQuantity((currentQty - 1).toString());
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="remove" size={20} color="#FF8C00" />
                  </TouchableOpacity>
                  <TextInput
                    style={modalStyles.quantityInput}
                    placeholder="0"
                    value={quantity}
                    onChangeText={(text) => {
                      // 숫자만 입력 허용
                      const numericValue = text.replace(/[^0-9]/g, '');
                      setQuantity(numericValue);
                    }}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                    textAlign="center"
                  />
                  <TouchableOpacity
                    style={modalStyles.quantityButton}
                    onPress={() => {
                      const currentQty = parseInt(quantity) || 0;
                      setQuantity((currentQty + 1).toString());
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={20} color="#FF8C00" />
                  </TouchableOpacity>
                </View>
                <View style={modalStyles.unitSelector}>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={modalStyles.unitScrollContent}
                  >
                    {units.map((unit) => (
                      <TouchableOpacity
                        key={unit}
                        style={[
                          modalStyles.unitButton,
                          selectedUnit === unit && modalStyles.unitButtonSelected
                        ]}
                        onPress={() => setSelectedUnit(unit)}
                      >
                        <Text style={[
                          modalStyles.unitButtonText,
                          selectedUnit === unit && modalStyles.unitButtonTextSelected
                        ]}>
                          {unit}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>

            {/* 유통기한 */}
            <View style={modalStyles.section}>
              <Text style={modalStyles.label}>
                <Ionicons name="calendar-outline" size={16} color="#666" /> 유통기한
              </Text>
              
              {/* 빠른 날짜 선택 버튼 */}
              <View style={modalStyles.quickDateButtonsContainer}>
                {[15, 30, 60, 90].map((days) => {
                  return (
                    <TouchableOpacity
                      key={days}
                      style={modalStyles.quickDateButton}
                      onPress={() => {
                        // 현재 선택된 날짜 또는 오늘 날짜 기준으로 계산
                        let baseDate = new Date();
                        if (selectedDate) {
                          const separator = selectedDate.includes('/') ? '/' : '-';
                          const parts = selectedDate.split(separator);
                          if (parts.length >= 3) {
                            const year = parseInt(parts[0]);
                            const month = parseInt(parts[1]) - 1; // 월은 0부터 시작
                            const day = parseInt(parts[2]);
                            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                              baseDate = new Date(year, month, day);
                            }
                          }
                        }
                        
                        // 해당 일수만큼 더하기
                        baseDate.setDate(baseDate.getDate() + days);
                        const formattedDate = `${baseDate.getFullYear()}/${String(baseDate.getMonth() + 1).padStart(2, '0')}/${String(baseDate.getDate()).padStart(2, '0')}`;
                        setSelectedDate(formattedDate);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={modalStyles.quickDateButtonText}>
                        +{days}일
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              <View style={modalStyles.datePickerContainer}>
                <WheelDatePicker
                  onDateChange={setSelectedDate}
                  initialDate={selectedDate}
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={modalStyles.buttonContainer}>
            <TouchableOpacity 
              style={[modalStyles.button, modalStyles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={modalStyles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[modalStyles.button, modalStyles.addButton]} 
              onPress={handleAdd}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={modalStyles.addButtonText}>추가하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default SetupIngredientsModal;

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  quantityContainer: {
    gap: 12,
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  quantityButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  quantityInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    backgroundColor: 'transparent',
  },
  unitSelector: {
    marginTop: 8,
  },
  unitScrollContent: {
    gap: 8,
    paddingVertical: 4,
  },
  unitButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  unitButtonSelected: {
    backgroundColor: '#FFF4E6',
    borderColor: '#FF8C00',
  },
  unitButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  unitButtonTextSelected: {
    color: '#FF8C00',
    fontWeight: '700',
  },
  quickDateButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  quickDateButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFF4E6',
    borderWidth: 2,
    borderColor: '#FF8C00',
  },
  quickDateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8C00',
  },
  datePickerContainer: {
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: '#f9f9f9',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  storageTypeContainer: {
    marginTop: 8,
  },
  storageTypeScrollContent: {
    gap: 8,
    paddingVertical: 4,
  },
  storageTypeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  storageTypeButtonSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  storageTypeButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  storageTypeButtonTextSelected: {
    color: '#2196F3',
    fontWeight: '700',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 6,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#FF8C00',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

