// AI 분석 화면 (비동기 Polling 기반)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import recipeService from '../services/recipeService';

// ✅ .env 파일의 EXPO_PUBLIC_API_URL 불러오기
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const AIAnalyze = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('분석을 시작합니다...');
  const [videoId, setVideoId] = useState(null);
  const { videoUrl, analysisType = 'youtube' } = route.params || {};

  useEffect(() => {
    if (!videoUrl) {
      Alert.alert('오류', '비디오 URL이 제공되지 않았습니다.');
      navigation.goBack();
      return;
    }
    performAnalysis();
  }, [videoUrl]);

  const performAnalysis = async () => {
    try {
      setLoading(true);
      setProgress(10);
      setStatus('AI 분석을 준비 중입니다...');

      // ---------------------------------
      // 1️⃣ 분석 요청 전송
      // ---------------------------------
      const res = await axios.post(`${API_BASE_URL}/ai/analyze-youtube`, { url: videoUrl });
      if (res.status !== 202 && res.data.status !== 'completed')
        throw new Error('AI 분석 요청에 실패했습니다.');

      // ✅ videoId 저장
      const id = res.data.videoId;
      setVideoId(id);
      setProgress(30);

      // ---------------------------------
      // 2️⃣ 이미 분석 완료된 영상이면 즉시 결과 표시
      // ---------------------------------
      if (res.data.status === 'completed' && res.data.recipe) {
        console.log('✅ 이미 분석된 영상 — 즉시 결과 표시');
        setProgress(100);
        setStatus('분석 완료!');
        setTimeout(() => {
          navigation.replace('RecipeSummary', {
            recipeId: res.data.recipe.id,
            recipe: res.data.recipe,
          });
        }, 800);
        return;
      }

      setStatus('AI 분석이 백그라운드에서 진행 중입니다...');

      // ---------------------------------
      // 3️⃣ Polling (15초 간격으로 상태 확인)
      // ---------------------------------
      const interval = setInterval(async () => {
        try {
          const check = await axios.get(`${API_BASE_URL}/ai/status/${id}`);
          console.log('📡 상태 확인:', check.data.status);

          if (check.data.status === 'completed') {
            clearInterval(interval);
            setProgress(90);
            setStatus('분석 완료! 결과를 불러오는 중입니다...');

            // ✅ 결과 데이터 가져오기 (백엔드가 recipe로 반환)
            const recipeData = check.data.recipe;
            if (recipeData?.id || recipeData?.title) {
              setProgress(100);
              setTimeout(() => {
                navigation.replace('RecipeSummary', {
                  recipeId: recipeData.id,
                  recipe: recipeData,
                });
              }, 800);
            } else {
              Alert.alert('결과 오류', '분석 결과 데이터를 불러올 수 없습니다.');
              setLoading(false);
            }
          } else {
            // 아직 진행 중일 때
            setProgress((p) => (p < 80 ? p + 5 : p));
            setStatus('AI 분석이 계속 진행 중입니다...');
          }
        } catch (err) {
          console.warn('상태 확인 중 오류:', err.message);
        }
      }, 15000); // 🔁 15초마다 polling
    } catch (error) {
      console.error('AI 분석 오류:', error);
      setLoading(false);
      setStatus('분석 중 오류가 발생했습니다.');

      Alert.alert(
        '분석 실패',
        error.message || '비디오 분석 중 오류가 발생했습니다.',
        [
          { text: '다시 시도', onPress: () => performAnalysis() },
          { text: '취소', onPress: () => navigation.goBack() },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🤖</Text>
        </View>

        <Text style={styles.title}>AI 레시피 분석</Text>
        <Text style={styles.subtitle}>AI가 영상을 분석 중입니다...</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>

        <Text style={styles.statusText}>{status}</Text>

        {loading && <ActivityIndicator size="large" color="#FF6B35" style={styles.loader} />}
      </View>
    </SafeAreaView>
  );
};

// ---------------------------------------------
// 기존 스타일 그대로 유지
// ---------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: { marginBottom: 30 },
  icon: { fontSize: 80, textAlign: 'center' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  progressContainer: { width: '100%', marginBottom: 20 },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 4,
  },
  progressText: { fontSize: 14, color: '#666', textAlign: 'center' },
  statusText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  loader: { marginTop: 20 },
});

export default AIAnalyze;
