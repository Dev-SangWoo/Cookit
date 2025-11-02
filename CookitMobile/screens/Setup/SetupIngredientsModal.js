// 재료 추가/수정 모달

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WheelDatePicker from '../../components/WheelDatePicker';

const SetupIngredientsModal = ({ visible, onClose, onAddIngredient, isEditing, initialData }) => {
  const [ingredientName, setIngredientName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('개');

  const units = ['개', 'g', 'kg', 'ml', 'L', '봉', '팩', '컵', '캔', '통'];


  useEffect(() => {
    if (isEditing && initialData) {
      setIngredientName(initialData.product_name);
      setQuantity(initialData.quantity.toString());
      setSelectedDate(initialData.expiry_date);
      setSelectedUnit(initialData.unit);
    } else {

      setIngredientName('');
      setQuantity('');
      setSelectedDate('');
      setSelectedUnit('개');
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
      expiry: selectedDate
    });
    setIngredientName('');
    setQuantity('');
    setSelectedDate('');
    setSelectedUnit('개');
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
                <TextInput
                  style={modalStyles.quantityInput}
                  placeholder="예: 100"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
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
  quantityInput: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
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
  datePickerContainer: {
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: '#f9f9f9',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
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

