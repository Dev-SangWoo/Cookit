import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ModalLogout({ visible, onConfirm, onCancel }) {
  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.text}>정말 로그아웃 하시겠어요?</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.logout} onPress={onConfirm}>
              <Text style={styles.buttonText}>로그아웃</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancel} onPress={onCancel}>
              <Text style={styles.buttonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    text: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
buttonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
  textAlign: 'center',
},
cancel: {
  paddingVertical: 10,
  paddingHorizontal: 20,
  backgroundColor: '#aaa',
  borderRadius: 8,
},
logout: {
  paddingVertical: 10,
  paddingHorizontal: 20,
  backgroundColor: 'orange',
  borderRadius: 8,
},
});
