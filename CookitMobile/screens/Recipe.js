// 단계별 요약화면


import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video } from 'expo-av';


const recipeSteps = [
  { title: '재료 준비하기', description: '모든 재료를 깨끗이 씻고 손질해 주세요.' },
  { title: '팬 예열하기', description: '팬을 중불에서 1분간 예열합니다.' },
  { title: '재료 볶기', description: '채소와 고기를 넣고 볶아주세요.' },
  { title: '양념 추가하기', description: '간장, 설탕, 참기름을 넣고 잘 섞습니다.' },
];

const Recipe = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSteps = recipeSteps.length;
  const currentStep = recipeSteps[currentIndex];

  const handleNext = () => {
    if (currentIndex < totalSteps - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.videoWrapper}>
          <Text style={{ color: '#555' }}>영상</Text>
    {/* <Video
      source={require('./assets/recipe.mp4')} // 경로는 실제 파일에 맞게 수정
      style={styles.video}
      useNativeControls
      resizeMode="contain"
    /> */}
  </View>
      <Text style={styles.stepIndicator}>Step {currentIndex + 1} / {totalSteps}</Text>

      <View style={styles.card}>
        <Text style={styles.title}>{currentStep.title}</Text>
        <Text style={styles.desc}>{currentStep.description}</Text>
      </View>

      <View style={styles.navButtons}>
        <TouchableOpacity onPress={handlePrev} disabled={currentIndex === 0} style={styles.button}>
          <Text style={styles.buttonText}>← 이전</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNext} disabled={currentIndex === totalSteps - 1} style={styles.button}>
          <Text style={styles.buttonText}>다음 →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Recipe;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  stepIndicator: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    padding: 20,
    backgroundColor: '#fef5e7',
    borderRadius: 10,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  desc: {
    fontSize: 16,
    color: '#555',
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#ffcc80',
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  videoWrapper: {
  height: 220,
  backgroundColor: '#e3f2fd', // 윤곽선 색상
  borderRadius: 12,
  overflow: 'hidden',
  marginBottom: 20,
  justifyContent: 'center',
  alignItems: 'center',
},

video: {
  width: '100%',
  height: '100%',
},
});
