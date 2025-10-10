// 단계별 요약화면

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { supabase } from '../lib/supabase';


const recipeSteps = [
  { title: '재료 준비하기', description: '모든 재료를 깨끗이 씻고 손질해 주세요.' },
  { title: '팬 예열하기', description: '팬을 중불에서 1분간 예열합니다.' },
  { title: '재료 볶기', description: '채소와 고기를 넣고 볶아주세요.' },
  { title: '양념 추가하기', description: '간장, 설탕, 참기름을 넣고 잘 섞습니다.' },
];

const Recipe = ({ route }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoError, setVideoError] = useState(false);
  const [videoId, setVideoId] = useState(null);
  
  // route.params에서 recipeId 가져오기 (id, recipe_id, recipeId 모두 지원)
  const recipeId = route?.params?.recipeId || route?.params?.recipe_id || route?.params?.id;
  
  const totalSteps = recipe?.instructions?.length || recipeSteps.length;
  const currentStep = recipe?.instructions?.[currentIndex] || recipeSteps[currentIndex];
  
  // 디버깅: recipeId 확인
  useEffect(() => {
    console.log('📍 받은 recipeId:', recipeId);
    console.log('📍 route.params:', JSON.stringify(route?.params, null, 2));
    if (!recipeId) {
      console.error('⚠️ recipeId가 전달되지 않았습니다!');
    }
  }, [recipeId, route?.params]);

  // YouTube URL에서 video ID 추출
  const extractVideoId = (url) => {
    if (!url) return null;
    
    let id = '';
    
    if (url.includes('youtube.com/shorts/')) {
      id = url.split('youtube.com/shorts/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/watch?v=')) {
      id = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      id = url.split('youtu.be/')[1]?.split('?')[0];
    }
    
    return id || null;
  };

  // 레시피 데이터 로드
  useEffect(() => {
    const loadRecipe = async () => {
      if (!recipeId) {
        setLoading(false);
        return;
      }

      // 더미 데이터인 경우 route.params에서 recipe 객체 사용
      if (recipeId === "summary-demo-recipe" && route?.params?.recipe) {
        setLoading(true);
        console.log('🔍 더미 레시피 로딩 시작:', recipeId);
        
        const demoRecipe = route.params.recipe;
        setRecipe(demoRecipe);
        console.log('✅ 더미 레시피 로딩 성공:', demoRecipe.title);
        
        // YouTube URL이 있으면 video ID 추출
        if (demoRecipe.video_url) {
          const extractedId = extractVideoId(demoRecipe.video_url);
          if (extractedId) {
            setVideoId(extractedId);
            setVideoUrl(demoRecipe.video_url);
            console.log('🎥 YouTube Video ID (더미):', extractedId);
          }
        }
        
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 레시피 로딩 시작:', recipeId);

        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('recipe_id', recipeId)
          .single();

        if (error) {
          console.error('❌ 레시피 로딩 오류:', error);
          Alert.alert('오류', '레시피를 불러올 수 없습니다.');
          return;
        }

        if (data) {
          setRecipe(data);
          console.log('✅ 레시피 로딩 성공:', data.title);
          
          // YouTube URL이 있으면 video ID 추출
          if (data.video_url) {
            const extractedId = extractVideoId(data.video_url);
            if (extractedId) {
              setVideoId(extractedId);
              setVideoUrl(data.video_url);
              console.log('🎥 YouTube Video ID:', extractedId);
            }
          }
        }
      } catch (error) {
        console.error('❌ 레시피 로딩 예외:', error);
        Alert.alert('오류', '레시피를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [recipeId]);

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

  // 현재 단계의 시간 정보 가져오기
  const getCurrentStepTimes = () => {
    if (!recipe?.instructions?.[currentIndex]) {
      return { startTime: 0, endTime: 0 };
    }
    
    const instruction = recipe.instructions[currentIndex];
    const startTime = instruction.start_time || 0;
    const endTime = instruction.end_time || 0;
    
    return { startTime, endTime };
  };

  // 시간을 초 단위로 변환 (HH:MM:SS -> seconds)
  const timeToSeconds = (timeString) => {
    if (!timeString) return 0;
    
    const parts = timeString.split(':');
    if (parts.length === 3) {
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      const seconds = parseInt(parts[2]) || 0;
      return hours * 3600 + minutes * 60 + seconds;
    } else if (parts.length === 2) {
      const minutes = parseInt(parts[0]) || 0;
      const seconds = parseInt(parts[1]) || 0;
      return minutes * 60 + seconds;
    }
    
    return parseInt(timeString) || 0;
  };

  // YouTube 구간 반복 재생을 위한 HTML 생성
  const generateYouTubeHTML = () => {
    const { startTime, endTime } = getCurrentStepTimes();
    const startSeconds = timeToSeconds(startTime);
    const endSeconds = timeToSeconds(endTime);
    
    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { margin: 0; padding: 0; background: #000; }
      #player { width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <div id="player"></div>
    
    <script src="https://www.youtube.com/iframe_api"></script>
    <script>
      let player;
      const startTime = ${startSeconds};
      const endTime = ${endSeconds};
      const videoId = '${videoId}';
      
      function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
          videoId: videoId,
          playerVars: {
            'autoplay': 1,
            'controls': 1,
            'rel': 0,
            'modestbranding': 1,
            'playsinline': 1,
            'start': startTime
          },
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
      }
      
      function onPlayerReady(event) {
        console.log('YouTube Player Ready');
        event.target.playVideo();
      }
      
      function onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.PLAYING && endTime > 0) {
          checkTime();
        }
      }
      
      function checkTime() {
        if (!player || typeof player.getCurrentTime !== 'function') return;
        
        const currentTime = player.getCurrentTime();
        
        // 종료 시간에 도달하면 시작 시간으로 돌아가기 (구간 반복)
        if (endTime > 0 && currentTime >= endTime) {
          console.log('구간 반복: ' + startTime + '초로 이동');
          player.seekTo(startTime, true);
        }
        
        // 재생 중일 때만 계속 체크
        if (player.getPlayerState() === YT.PlayerState.PLAYING) {
          setTimeout(checkTime, 500); // 0.5초마다 체크
        }
      }
    </script>
  </body>
  </html>`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>레시피를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 레시피 제목 */}
      {recipe && (
        <View style={styles.header}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          {recipe.description && (
            <Text style={styles.recipeDescription}>{recipe.description}</Text>
          )}
        </View>
      )}

      {/* YouTube 비디오 */}
      {videoId && (
        <View style={styles.videoWrapper}>
          <WebView
            source={{ html: generateYouTubeHTML() }}
            style={styles.webview}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView 오류:', nativeEvent);
              setVideoError(true);
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('HTTP 오류:', nativeEvent);
            }}
          />
          {videoError && (
            <View style={styles.videoErrorContainer}>
              <Text style={styles.videoErrorText}>
                비디오를 불러올 수 없습니다.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setVideoError(false);
                }}
              >
                <Text style={styles.retryButtonText}>다시 시도</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      <Text style={styles.stepIndicator}>Step {currentIndex + 1} / {totalSteps}</Text>

      <View style={styles.card}>
        <Text style={styles.title}>{currentStep.title}</Text>
        <Text style={styles.desc}>{currentStep.instruction || currentStep.description}</Text>
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
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  videoWrapper: {
    height: 220,
    backgroundColor: '#000',
    marginBottom: 10,
  },
  webview: {
    flex: 1,
  },
  videoErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  videoErrorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FF6B35',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  stepIndicator: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  card: {
    margin: 20,
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
    lineHeight: 22,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingHorizontal: 20,
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
});
