// 요약이 진행중임을 알리는 모달

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Modal from 'react-native-modal';


const RecipeSummaryModal = ({ isVisible, onComplete }) => {


  return (
    <Modal isVisible={isVisible}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalText}>요약 중입니다...</Text>

        <TouchableOpacity
          onPress={
            onComplete
          }
          style={styles.completeBtn}>
          <Text style={{ color: '#fff', textAlign: 'center' }}>요약 완료 → 이동</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default RecipeSummaryModal;

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '80%'
  },
  modalText: {
    fontSize: 18,
    marginBottom: 12
  },
  completeBtn: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    width: '100%'
  }
});