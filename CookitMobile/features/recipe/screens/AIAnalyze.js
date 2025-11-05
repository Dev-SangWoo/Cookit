// AI 분석 화면
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import recipeService from '@features/recipe/services/recipeService';

const AIAnalyze = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('분석을 시작합니다...');

  const { videoUrl, analysisType = 'youtube' } = route.params || {};
  const [pollTimer, setPollTimer] = useState(null);

  useEffect(() => {
    if (!videoUrl) {
      Alert.alert('오류', '비디오 URL이 제공되지 않았습니다.');
      navigation.goBack();
      return;
    }

    performAnalysis();
    return () => {
      if (pollTimer) {
        clearInterval(pollTimer);
      }
    };
  }, [videoUrl]);

  const performAnalysis = async () => {
    try {
      setLoading(true);
      setProgress(10);
      setStatus('비디오를 분석하고 있습니다...');

      let response;
      
      if (analysisType === 'youtube') {
        setProgress(30);
        setStatus('YouTube 비디오에서 레시피를 추출하고 있습니다...');
        
        response = await recipeService.analyzeYouTubeVideo(videoUrl);
      } else {
        // 다른 분석 타입들 (업로드된 비디오 등)
        setProgress(30);
        setStatus('업로드된 비디오를 분석하고 있습니다...');
        
        // TODO: 업로드된 비디오 분석 API 호출
        throw new Error('업로드된 비디오 분석은 아직 구현되지 않았습니다.');
      }

      if (!response || !response.success) {
        throw new Error(response?.error || '분석 요청 실패');
      }

      // 즉시 완료된 경우 (이미 분석된 영상)
      if (response.status === 'completed' && response.recipe) {
        setProgress(95);
        setStatus('완료! 레시피 화면으로 이동합니다...');
        const recipeId = response.recipe.id || response.recipe.recipe_id || response.recipeId;
        if (!recipeId) throw new Error('레시피 ID를 찾을 수 없습니다.');
        setTimeout(() => {
          navigation.replace('Recipe', { 
            recipeId,
            recipe: response.recipe
          });
        }, 600);
        return;
      }

      // 비동기 처리: status 폴링
      const videoId = response.videoId;
      if (!videoId) throw new Error('videoId를 확인할 수 없습니다.');

      setProgress(50);
      setStatus('분석이 진행 중입니다... 잠시만 기다려주세요.');

      let elapsed = 0;
      const intervalMs = 4000;
      const timeoutMs = 5 * 60 * 1000; // 5분 타임아웃

      const timerId = setInterval(async () => {
        try {
          elapsed += intervalMs;
          // 진행률을 50→90 사이에서 점진 증가
          setProgress(p => Math.min(90, p + 5));

          const statusRes = await recipeService.getAnalysisStatus(videoId);
          if (statusRes?.success && statusRes.status === 'completed' && statusRes.recipe) {
            clearInterval(timerId);
            setProgress(98);
            setStatus('분석 완료! 레시피 화면으로 이동합니다...');
            const rid = statusRes.recipe.id || statusRes.recipe.recipe_id;
            if (!rid) throw new Error('레시피 ID를 찾을 수 없습니다.');
            setTimeout(() => {
              navigation.replace('Recipe', { recipeId: rid, recipe: statusRes.recipe });
            }, 600);
          } else if (elapsed >= timeoutMs) {
            clearInterval(timerId);
            throw new Error('분석이 예상보다 오래 걸립니다. 잠시 후 다시 시도해주세요.');
          }
        } catch (pollError) {
          clearInterval(timerId);
          throw pollError;
        }
      }, intervalMs);

      setPollTimer(timerId);

    } catch (error) {
      console.error('AI 분석 오류:', error);
      setLoading(false);
      setStatus('분석 중 오류가 발생했습니다.');
      
      Alert.alert(
        '분석 실패',
        error.message || '비디오 분석 중 오류가 발생했습니다.',
        [
          {
            text: '다시 시도',
            onPress: () => performAnalysis()
          },
          {
            text: '취소',
            onPress: () => navigation.goBack()
          }
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
        <Text style={styles.subtitle}>잠시만 기다려주세요...</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progress}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
        
        <Text style={styles.statusText}>{status}</Text>
        
        {loading && (
          <ActivityIndicator 
            size="large" 
            color="#FF6B35" 
            style={styles.loader}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 30,
  },
  icon: {
    fontSize: 80,
    textAlign: 'center',
  },
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
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
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
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  loader: {
    marginTop: 20,
  },
});

export default AIAnalyze;
