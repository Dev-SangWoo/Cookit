// 단계별 요약화면


import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video } from 'expo-av';
import { useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase'




const Recipe = () => {
  const [instructions, setInstructions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const route = useRoute();
const recipeId = route.params?.recipeId;

useEffect(() => {
  const fetchInstructions = async () => {
    const { data, error } = await supabase
      .from('recipes')
      .select('instructions')
      .eq('id', recipeId)
      .single();

    if (data?.instructions) {
      setInstructions(data.instructions);
    }
  };

  fetchInstructions();
}, []);

const totalSteps = instructions.length;
const currentStep = instructions.length > 0 && instructions[currentIndex]
  ? instructions[currentIndex]
  : null;


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
      source={{ uri: '주소'}} // 경로는 실제 파일에 맞게 수정
      style={styles.video}
      useNativeControls
      resizeMode="contain"
    /> */}
  </View>
{instructions.length === 0 ? (
  <Text style={{ textAlign: 'center', marginTop: 40 }}>레시피를 불러오는 중입니다...</Text>
) : (
  <>
    <Text style={styles.stepIndicator}>Step {currentIndex + 1} / {totalSteps}</Text>

{currentStep && currentStep.title && (
  <View style={styles.card}>
    <Text style={styles.title}>{currentStep.title}</Text>
    <Text style={styles.desc}>{currentStep.instruction}</Text>
    <Text style={{ fontStyle: 'italic', color: '#888' }}>⏱ {currentStep.time}</Text>
    <Text style={{ color: '#aaa' }}>💡 {currentStep.tips}</Text>
  </View>
)}

    <View style={styles.navButtons}>
      <TouchableOpacity onPress={handlePrev} disabled={currentIndex === 0} style={styles.button}>
        <Text style={styles.buttonText}>← 이전</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleNext} disabled={currentIndex === totalSteps - 1} style={styles.button}>
        <Text style={styles.buttonText}>다음 →</Text>
      </TouchableOpacity>
    </View>
  </>
)}
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
