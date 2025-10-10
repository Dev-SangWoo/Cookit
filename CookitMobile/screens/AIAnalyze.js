// AI 분석 화면
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import recipeService from '../services/recipeService';

const AIAnalyze = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('분석을 시작합니다...');

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

      setProgress(70);
      setStatus('레시피를 생성하고 있습니다...');

      if (response && response.success) {
        setProgress(90);
        setStatus('완료! 레시피 화면으로 이동합니다...');

        // AI 분석 결과에서 recipeId 추출
        const recipeId = response.recipe?.recipe_id || response.recipeId;
        
        if (recipeId) {
          // 1초 후 Recipe 화면으로 이동
          setTimeout(() => {
            navigation.replace('Recipe', { 
              recipeId: recipeId,
              recipe: response.recipe 
            });
          }, 1000);
        } else {
          throw new Error('레시피 ID를 찾을 수 없습니다.');
        }
      } else {
        throw new Error(response?.error || '분석에 실패했습니다.');
      }

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
