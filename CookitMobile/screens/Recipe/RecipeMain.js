// 레시피 설명 화면 타임라인, 타이머 ...
// 영상 재생은 확인해야 함(제대로 안보여짐)
// 타이머 완료 시 재생될 소리를 파일로 추가해야 함

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, Audio } from 'expo-av';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';

// 알림 소리 파일 필요(소리를 사용할 경우)
// const alarmSound = require('./assets/alarm.mp3'); 

const RecipeMain = () => {
  const [instructions, setInstructions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  // ✅ 영상 URL 상태 추가
  const [videoUrl, setVideoUrl] = useState(null);

  // 타이머 상태
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isTimerFinished, setIsTimerFinished] = useState(false); // ✅ 타이머 완료 상태
  const intervalRef = useRef(null);
  const videoRef = useRef(null); // ✅ Video 컴포넌트 Ref 추가

  const route = useRoute();
  const navigation = useNavigation();
  const recipeId = route.params?.recipeId;
  const soundObject = useRef(new Audio.Sound()); // 사운드 객체 생성

  const currentStep = instructions.length > 0 && instructions[currentIndex]
    ? instructions[currentIndex]
    : null;

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (timerSeconds > 0) {
      setIsRunning(prev => !prev);
    }
  };

  const resetTimer = () => {
    if (currentStep?.time > 0) {
      const initialTimeInSeconds = currentStep.time * 60;
      setTimerSeconds(initialTimeInSeconds);
      setIsRunning(false);
      setIsTimerFinished(false);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // 소리 재생 중지 (혹시 모를 상황 대비)
      soundObject.current.stopAsync();
    }
  };

  // ✅ 타이머 완료 처리 함수 (소리 및 진동 알림)
  const handleTimerCompletion = async () => {
    setIsRunning(false);
    setIsTimerFinished(true);

    // 1. 진동 알림 (2초 진동) / 정상
    Vibration.vibrate(2000);

    // 2. 사운드 알림 (실제 사용 시 URI 주석을 풀고 사용)
    try {
      await soundObject.current.loadAsync(
        // NOTE: 실제 알림 사운드 URI를 여기에 넣으세요. 현재는 임시 URL입니다.
        { uri: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/notosanskr/NotoSansKR-Regular.ttf' },
        { shouldPlay: true, isLooping: true }
      );
      await soundObject.current.playAsync();
      // 5초 후 소리 자동 정지 (사용자가 수동으로 닫을 수도 있음)
      setTimeout(() => {
        soundObject.current.stopAsync();
      }, 5000);

    } catch (error) {
      console.warn("사운드 로드 또는 재생 실패:", error);
    }
  };

  // 1. 레시피 단계가 변경되거나 로드될 때 타이머 초기 설정
  useEffect(() => {
    
    if (currentStep?.time > 0) {
      resetTimer();
    } else {
      setTimerSeconds(0);
      setIsRunning(false);
      setIsTimerFinished(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
  }, [currentIndex, instructions.length]);

  // 2. 타이머 카운트다운 로직
  useEffect(() => {
    if (isRunning && timerSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((prevSeconds) => {
          if (prevSeconds <= 1) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;

            handleTimerCompletion();

            return 0;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      soundObject.current.unloadAsync();
    };
  }, [isRunning, timerSeconds]);


  useEffect(() => {
    const fetchInstructions = async () => {
      // ✅ video_url 컬럼도 함께 select 합니다.
      const { data, error } = await supabase
        .from('recipes')
        .select('instructions, video_url')
        .eq('id', recipeId)
        .single();

      if (data) {
        setInstructions(Array.isArray(data.instructions) ? data.instructions : []);
        // ✅ video_url 상태 업데이트
        setVideoUrl(data.video_url || null);
      } else if (error) {
        console.error('Error fetching recipe data:', error);
      }
    };

    fetchInstructions();
  }, [recipeId]);

  const totalSteps = instructions.length;
  const isLastStep = currentIndex === totalSteps - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentIndex(currentIndex + 1);
      setIsTimerFinished(false);
    } else {
      handleFinishCooking();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsTimerFinished(false);
    }
  };

  const handleFinishCooking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    soundObject.current.stopAsync();
    navigation.navigate('RecipeRating', { recipeId: recipeId });
  };

  const hasTime = currentStep && currentStep.time > 0;
  const isTimerAtInitialValue = timerSeconds === (currentStep?.time * 60) && !isRunning;


  const closeAlert = () => {
    setIsTimerFinished(false);
    soundObject.current.stopAsync(); 
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.videoWrapper}>
        {/* ✅ videoUrl이 있을 경우 Video 컴포넌트를 사용하여 영상을 재생합니다. */}
        {videoUrl ? (
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={styles.video}
            useNativeControls
            resizeMode="contain" 
            isLooping 
          />
        ) : (
          <Text style={{ color: '#555' }}>영상 로딩 중 또는 영상 없음</Text>
        )}
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
              {currentStep.time > 0 && (
                <Text style={{ fontStyle: 'italic', color: '#888', marginBottom: 5 }}>
                  ⏱ {currentStep.time}분
                </Text>
              )}
              <Text style={{ color: '#aaa' }}>💡 {currentStep.tips}</Text>
            </View>
          )}

          {/* 타이머 UI */}
          {hasTime && (
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>{formatTime(timerSeconds)}</Text>
              <View style={styles.timerControls}>
                {/* 일시정지/재개 버튼 */}
                <TouchableOpacity
                  onPress={toggleTimer}
                  style={[styles.timerButton, { backgroundColor: isRunning ? '#e74c3c' : '#f39c12' }]}
                >
                  <Text style={styles.timerButtonText}>{isRunning ? '❚❚ 멈춤' : '▶ 시작'}</Text>
                </TouchableOpacity>
                {/* 초기화 버튼 */}
                <TouchableOpacity
                  onPress={resetTimer}
                  style={[styles.timerButton, styles.resetButton, isTimerAtInitialValue && styles.disabledTimerButton]}
                  disabled={isTimerAtInitialValue}
                >
                  <Text style={styles.timerButtonText}>↻ 초기화</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}


          <View style={styles.navButtons}>
            <TouchableOpacity
              onPress={handlePrev}
              disabled={currentIndex === 0}
              style={[styles.button, currentIndex === 0 && styles.disabledButton]}
            >
              <Text style={styles.buttonText}>← 이전</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              style={[styles.button, isLastStep && styles.finishButton]}
            >
              <Text style={[styles.buttonText, isLastStep && styles.finishButtonText]}>
                {isLastStep ? '요리 완료 👍' : '다음 →'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ✅ 타이머 완료 알림 UI */}
      {isTimerFinished && (
        <View style={styles.overlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>🔔 타이머 완료!</Text>
            <Text style={styles.alertMessage}>
              현재 단계 ({currentStep?.title})의 시간이 끝났습니다.
            </Text>
            <TouchableOpacity onPress={closeAlert} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>확인 및 소리 끄기</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default RecipeMain;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  stepIndicator: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  card: {
    padding: 20,
    backgroundColor: '#fef5e7',
    borderRadius: 10,
    elevation: 2,
    minHeight: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#795548',
  },
  desc: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  // 타이머 스타일
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#fffbe9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffcc80',
    elevation: 2,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ff6f00',
    marginBottom: 15,
    letterSpacing: 2,
  },
  timerControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  timerButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  timerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: '#3498db',
  },
  disabledTimerButton: {
    backgroundColor: '#95a5a6',
    opacity: 0.7,
  },
  // 탐색 버튼 스타일
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    marginTop: 'auto',
    marginBottom: 0,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#ffcc80',
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#444',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  finishButton: {
    backgroundColor: '#2ecc71',
    shadowColor: '#2ecc71',
    shadowOpacity: 0.5,
  },
  finishButtonText: {
    color: '#fff',
    fontWeight: '900',
  },
  // 영상 관련 스타일
  videoWrapper: {
    height: 220,
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: { // 이 스타일이 Video 컴포넌트의 크기를 정의합니다.
    width: '100%',
    height: '100%',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  alertBox: {
    width: '80%',
    padding: 25,
    backgroundColor: '#fff',
    borderRadius: 15,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  alertTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 15,
  },
  alertMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
  },
  closeButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    width: '100%',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});