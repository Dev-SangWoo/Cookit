// 앱을 켰을 때 제일 처음 보게될 화면. 
// 지금은 버튼 누르면 바로 Home으로 넘어가지만 
// 목표는 첫 로그인을 안했으면 로그인 화면으로, 
// 했다면 자동 로그인 된 느낌으로 바로 Home으로 이동하도록
// 3개의 카드??를 누르면 모달창이 나오도록 만들었는데 간단한 설명같은 것을
// 캡쳐같은 것으로 넣어주면 괜찮을지도 모르겠다.
// ex) 비디오 레시피 분석 => 요약하는 화면을 보여준다던가.. 요약된 부분을 보여준다던가
//     AI 단계별 가이드 => 타임라인 부분을 보여준다?
// 모달 창 손 봐야함



import { StyleSheet, Text, TouchableOpacity, View, Image, Modal } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react'
import ModalVideo from './modal/ModalVideo'
import ModalAi from './modal/ModalAi'
import ModalSave from './modal/ModalSave'

const OnBoard = () => {
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(null); // 'one', 'two', 'three' 중 하나

  const handleStart = () => {
    navigation.replace("HomeTab")
  }

  const closeModal = () => setModalVisible(null);

  return (
    <>
      <View style={styles.container}>
        <Image source={require('../assets/signature.png')} style={styles.signature} />
        <Text style={styles.pageTitle}>Cookit</Text>
        <Text style={styles.titleText}>영상 한 편이면 요리는 끝!</Text>

        <TouchableOpacity onPress={() => setModalVisible('one')}>
          <View style={styles.listBox}>
            <Text style={styles.listIcon}>📽️</Text>
            <View style={styles.listTextGroup}>
              <Text style={styles.listTitle}>비디오 레시피 분석</Text>
              <Text style={styles.listText}>영상에서 자동으로 레시피를 추출하고 분석해요</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setModalVisible('two')}>
          <View style={styles.listBox}>
            <Text style={styles.listIcon}>🤖</Text>
            <View style={styles.listTextGroup}>
              <Text style={styles.listTitle}>AI 단계별 가이드</Text>
              <Text style={styles.listText}>AI가 맞춤형 요리 가이드를 단계별로 제공해요</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setModalVisible('three')}>
          <View style={styles.listBox}>
            <Text style={styles.listIcon}>💾</Text>
            <View style={styles.listTextGroup}>
              <Text style={styles.listTitle}>레시피 저장 & 공유</Text>
              <Text style={styles.listText}>좋아하는 레시피를 저장하고 친구들과 공유해요</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.buttonContiner}>
          <TouchableOpacity
            style={styles.buttonStart}
            onPress={handleStart}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible !== null}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {modalVisible === 'one' && <ModalVideo onClose={closeModal} /> }
            {modalVisible === 'two' && <ModalAi onClose={closeModal} />}
            {modalVisible === 'three' && <ModalSave onClose={closeModal} />}
            
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.closeText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  )
}

export default OnBoard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24   
  },
  signature: {
    width:120,
    height:120
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 25
  },
  titleText: {
    fontSize: 17,
    marginBottom: 20,
    opacity: 0.5
  },
  listBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(235, 192, 141, 0.65)',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    width: '100%',
    paddingVertical: 25
  },
  listIcon: {
    fontSize: 30,                       
    marginRight: 12
  },
  listTextGroup: {
    flex: 1                            
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  listText: {
    fontSize: 13,
    opacity: 0.5
  },
  buttonContiner: {
    width:'100%',
  },
  buttonStart: {
    backgroundColor: 'orange',
    borderRadius: 50,
    width: '100%',
    paddingVertical: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold'
  },
  // ✨ 모달 스타일 추가
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center'
  },
  modalText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center'
  },
  closeText: {
    fontSize: 14,
    color: 'orange',
    fontWeight: 'bold'
  }
});
