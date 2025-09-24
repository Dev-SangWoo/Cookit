import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import DatePicker from 'react-native-modern-datepicker';

const ModalInput = ({ visible, onClose, onAddIngredient, isEditing, initialData }) => {
  const [ingredientName, setIngredientName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('개');
  const [isUnitPickerVisible, setUnitPickerVisible] = useState(false);

  const units = ['개', 'ml', 'g', 'L', 'kg', '봉', '컵', '팩', '캔', '통'];


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

  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit);
    setUnitPickerVisible(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.centeredView}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={modalStyles.modalView}
        >
          <Text style={modalStyles.modalTitle}>재료 등록</Text>
          <TextInput
            style={modalStyles.input}
            placeholder="재료 이름"
            value={ingredientName}
            onChangeText={setIngredientName}
          />

          <View style={modalStyles.quantityContainer}>
            <TextInput
              style={modalStyles.quantityInput}
              placeholder="개수"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={modalStyles.unitPickerButton}
              onPress={() => setUnitPickerVisible(true)}
            >
              <Text style={modalStyles.unitText}>{selectedUnit}</Text>
            </TouchableOpacity>
          </View>

          <Text style={modalStyles.datePickerLabel}>유통기한 선택</Text>
          <DatePicker
            mode="calendar"
            onDateChange={setSelectedDate}
            onSelectedChange={() => { }}
            options={{
              mainColor: '#FFC107',
              locale: {
                months: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
                days: ['일', '월', '화', '수', '목', '금', '토']
              }
            }}
            isGregorian={true}
          />

          <View style={modalStyles.buttonContainer}>
            <TouchableOpacity style={modalStyles.cancelButton} onPress={onClose}>
              <Text style={modalStyles.buttonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.addButton} onPress={handleAdd}>
              <Text style={modalStyles.buttonText}>추가</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Unit Picker Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isUnitPickerVisible}
        onRequestClose={() => setUnitPickerVisible(false)}
      >
        <TouchableOpacity
          style={modalStyles.unitPickerOverlay}
          onPress={() => setUnitPickerVisible(false)}
        >
          <View style={modalStyles.unitPickerContainer}>
            {units.map((unit, index) => (
              <TouchableOpacity
                key={index}
                style={modalStyles.unitPickerItem}
                onPress={() => handleUnitSelect(unit)}
              >
                <Text style={modalStyles.unitPickerText}>{unit}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  datePickerLabel: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 10,
  },
  addButton: {
    backgroundColor: 'orange',
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  quantityInput: {
    flex: 0.8,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 10,
    marginRight: -1,
  },
  unitPickerButton: {
    flex: 0.2,
    height: 40,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  unitText: {
    fontWeight: 'bold',
  },
  unitPickerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  unitPickerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    width: 200,
  },
  unitPickerItem: {
    padding: 10,
    alignItems: 'center',
  },
  unitPickerText: {
    fontSize: 16,
  },
});

export default ModalInput;