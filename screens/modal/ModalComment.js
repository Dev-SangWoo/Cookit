import React from 'react';
import { Modal, View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ModalComment = ({
  visible,
  onClose,
  comments,
  newComment,
  setNewComment,
  submitComment
}) => {
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>댓글</Text>

        <FlatList
          data={comments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.comment}>
              <Text style={styles.commentUser}>{item.user_id}</Text>
              <Text>{item.content}</Text>
            </View>
          )}
        />

        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="댓글을 입력하세요"
            value={newComment}
            onChangeText={setNewComment}
            returnKeyType="send"
            onSubmitEditing={submitComment}
          />
          <TouchableOpacity onPress={submitComment}>
            <Text style={styles.commentSubmit}>등록</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>닫기</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ModalComment;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12
  },
  comment: {
    marginBottom: 10
  },
  commentUser: {
    fontWeight: 'bold',
    marginBottom: 2
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  commentSubmit: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
  closeText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
