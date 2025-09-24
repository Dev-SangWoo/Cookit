// 선호 비선호 고르는 모달

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Button, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';

export default function ModalSelect({ visible, options, selected, onClose, onSelect }) {
  return (
    <Modal isVisible={visible}>
      <View style={styles.container}>
        <Text style={styles.title}>선택하세요</Text>
        <ScrollView>
          {options.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.option,
                selected.includes(item) && styles.selected
              ]}
              onPress={() => {
                const updated = selected.includes(item)
                  ? selected.filter(i => i !== item)
                  : [...selected, item];
                onSelect(updated);
              }}
            >
              <Text style={styles.optionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Button title="확인" onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  option: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  selected: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    color: '#333',
  },
});
