// 요약할지 말지 정하는 곳
// 요약하기 버튼을 누르면 요약 시작
// 진행도는 
// 0~40%: "영상 분석중"
// 40~70%: "재료 정리중"
// 70~90%: "타임라인 만들기"
// 90~100%: "마지막 정리중" 이런식?
// 예상 시간을 받아올 수 있는지는 모르겠는데 받아올 수 있으면 좋긴하다



import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ModalSummary from './modal/ModalSummary';
import { useState } from 'react';

const SummaryChoice = ({ route, navigation }) => {
  const { thumbnail, title, creator } = route.params;
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSummaryPress = () => {
    setIsModalVisible(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 15 : 0 }}>
      <View style={styles.container}>
        <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.creator}>제작자: {creator}</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: '#ff6b6b' }]}
            onPress={handleSummaryPress}
          >
            <Text style={styles.btnText}>요약하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
            <Text style={styles.btnText}>뒤로가기</Text>
          </TouchableOpacity>

        </View>
      </View>

      <ModalSummary
        isVisible={isModalVisible}
        onComplete={() => {
          setIsModalVisible(false);
          navigation.navigate('Summary', { title, thumbnail });
        }}
      />
    </SafeAreaView>
  );
};

export default SummaryChoice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8
  },
  creator: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF'
  },
  btnText: {
    color: '#fff',
    fontSize: 16
  }
});
