// 선호 비선호 고르는 모달

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';

export default function SetupPreferenceModal({ visible, options, selected, onClose, onSelect, title }) {
  return (
    <Modal isVisible={visible} onBackdropPress={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title || '재료 선택'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.subtitle}>
          {selected.length > 0 ? `${selected.length}개 선택됨` : '항목을 선택해주세요'}
        </Text>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {options.map((item) => {
            const isSelected = selected.includes(item);
            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.option,
                  isSelected && styles.selected
                ]}
                onPress={() => {
                  const updated = isSelected
                    ? selected.filter(i => i !== item)
                    : [...selected, item];
                  onSelect(updated);
                }}
              >
                <Text style={[
                  styles.optionText,
                  isSelected && styles.selectedText
                ]}>
                  {item}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color="#FF8C00" />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        
        <TouchableOpacity style={styles.confirmButton} onPress={onClose}>
          <Text style={styles.confirmButtonText}>완료</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  scrollView: {
    maxHeight: 400,
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#f5f5f5',
  },
  selected: {
    backgroundColor: '#FFF4E6',
    borderColor: '#FF8C00',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedText: {
    fontWeight: '600',
    color: '#FF8C00',
  },
  confirmButton: {
    backgroundColor: '#FF8C00',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
