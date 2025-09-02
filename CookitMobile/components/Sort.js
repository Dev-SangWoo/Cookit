import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, } from 'react-native';

const SortDropdown = ({ sortBy, setSortBy }) => {
  const [visible, setVisible] = useState(false);
  const options = ['인기순', '최신순', '구독자순'];

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.dropdownText}>{sortBy} ▼</Text>
      </TouchableOpacity>

      <Modal transparent visible={visible} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        >
          <View style={styles.menu}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.menuItem}
                onPress={() => {
                  setSortBy(option);
                  setVisible(false);
                }}
              >
                <Text style={styles.menuText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default SortDropdown;

const styles = StyleSheet.create({
  dropdownContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 10,
    
  },
  dropdownButton: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    width: 140,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 14,
    color: '#333',
  },
});
