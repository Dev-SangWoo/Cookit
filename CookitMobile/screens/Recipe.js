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

  // 시간 문자열을 초로 변환 (HH:MM:SS -> seconds)
  const timeToSeconds = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  // YouTube iframe embed HTML 생성 (타임스탬프 지원 + 구간 반복)
  const getYouTubeHTML = (videoId, startTime = null, endTime = null) => {
    const startSeconds = startTime ? timeToSeconds(startTime) : 0;
    const endSeconds = endTime ? timeToSeconds(endTime) : 0;
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      margin: 0; 
      padding: 0; 
      background: #000; 
      overflow: hidden;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #player {
      width: 100%;
      height: 100%;
    }
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
</html>
    `;
  };

  // 레시피 데이터 가져오기
  useEffect(() => {
    const fetchRecipe = async () => {
      if (!recipeId) {
        console.log('❌ recipeId가 없습니다. route.params를 확인하세요.');
        Alert.alert('오류', '레시피 ID가 전달되지 않았습니다.');
        setLoading(false);
        return;
      }

      console.log('🔍 레시피 ID:', recipeId);
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', recipeId)
          .single();

        if (error) {
          console.error('❌ 레시피 조회 오류:', error);
          Alert.alert('오류', '레시피를 불러올 수 없습니다.');
          return;
        }

        setRecipe(data);
        setVideoUrl(data.video_url);
        setVideoError(false);
        
        // YouTube video ID 추출
        const extractedVideoId = extractVideoId(data.video_url);
        setVideoId(extractedVideoId);
        
        console.log('✅ 레시피 데이터 로드 완료');
        console.log('📋 레시피 제목:', data.title);
        console.log('📝 조리 단계 수:', data.instructions?.length || 0);
        console.log('📺 영상 URL:', data.video_url);
        console.log('🎬 Video ID:', extractedVideoId);
        console.log('🔍 Instructions 데이터:', JSON.stringify(data.instructions, null, 2));
      } catch (error) {
        console.error('❌ 레시피 조회 중 오류:', error);
        Alert.alert('오류', '레시피를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
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

  // 로딩 상태
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffcc80" />
          <Text style={styles.loadingText}>레시피를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* YouTube 영상 (단계별 타임스탬프 적용) */}
      <View style={styles.videoWrapper}>
        {videoId && !videoError ? (
          <WebView
            key={`video-${currentIndex}-${currentStep?.start_time || 'default'}`}  // 단계가 바뀔 때마다 WebView 새로 로드
            source={{ 
              html: getYouTubeHTML(
                videoId, 
                currentStep?.start_time,  // 현재 단계 시작 시간
                currentStep?.end_time     // 현재 단계 종료 시간 (구간 반복 구현)
              ) 
            }}
            style={styles.video}
            allowsFullscreenVideo={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onError={(error) => {
              console.error('❌ WebView 오류:', error);
              setVideoError(true);
            }}
            onLoadStart={() => {
              console.log(`🔄 YouTube 로딩 시작 (단계 ${currentIndex + 1})`);
              if (currentStep?.start_time) {
                const loopInfo = currentStep.end_time ? ' [구간 반복 ON]' : ' [반복 OFF]';
                console.log(`⏰ 영상 구간: ${currentStep.start_time} ~ ${currentStep.end_time || '끝'}${loopInfo}`);
              }
            }}
            onLoad={() => {
              console.log('✅ YouTube 로드 완료');
              setVideoError(false);
            }}
            onLoadEnd={() => {
              console.log('🎉 YouTube 렌더링 완료');
            }}
          />
        ) : (
          <View style={styles.noVideoContainer}>
            <Text style={styles.noVideoText}>
              {videoError ? '🚫 YouTube 영상 로딩 오류' : '📹 YouTube 영상이 없습니다'}
            </Text>
            {videoError && (
              <Text style={styles.errorText}>
                YouTube 영상을 불러올 수 없습니다.
              </Text>
            )}
            <Text style={styles.debugText}>Video ID: {videoId || 'null'}</Text>
            <Text style={styles.debugText}>영상 URL: {videoUrl || 'null'}</Text>
            
            {videoUrl && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => {
                    setVideoError(false);
                    console.log('🔄 재시도');
                  }}
                >
                  <Text style={styles.retryButtonText}>다시 시도</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.externalButton}
                  onPress={() => {
                    Linking.openURL(videoUrl);
                    console.log('🌐 외부 브라우저에서 열기');
                  }}
                >
                  <Text style={styles.externalButtonText}>브라우저에서 보기</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
      
      {/* 레시피 단계 */}
      <Text style={styles.stepIndicator}>
        Step {currentIndex + 1} / {totalSteps}
        {recipe && recipe.instructions?.length > 0 ? ' (DB)' : ' (기본값)'}
      </Text>

      <View style={styles.card}>
        {/* 디버깅: 레시피 데이터 확인 */}
        {!recipe && (
          <Text style={[styles.debugText, { marginBottom: 10 }]}>
            ⚠️ 레시피 데이터 로딩 중 또는 없음
          </Text>
        )}
        
        <Text style={styles.title}>
          {recipe ? currentStep?.title || currentStep?.instruction || '제목 없음' : currentStep?.title}
        </Text>
        <Text style={styles.desc}>
          {recipe ? currentStep?.instruction || currentStep?.description || '설명 없음' : currentStep?.description}
        </Text>
        
        {/* 타임스탬프 표시 */}
        {currentStep?.start_time && (
          <View style={styles.timestampContainer}>
            <Text style={styles.timestampText}>
              🔁 영상 구간: {currentStep.start_time}
              {currentStep.end_time && ` ~ ${currentStep.end_time}`}
            </Text>
            <Text style={styles.timestampNote}>
              {currentStep.end_time 
                ? '* 자동 재생되며, 해당 구간이 반복됩니다' 
                : '* 시작 시간부터 자동 재생됩니다'}
            </Text>
          </View>
        )}
      </View>

      {/* 네비게이션 버튼 */}
      <View style={styles.navButtons}>
        <TouchableOpacity 
          onPress={handlePrev} 
          disabled={currentIndex === 0} 
          style={[styles.button, currentIndex === 0 && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>← 이전</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleNext} 
          disabled={currentIndex === totalSteps - 1} 
          style={[styles.button, currentIndex === totalSteps - 1 && styles.buttonDisabled]}
        >
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
  videoWrapper: {
    height: 220,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  video: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  noVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  noVideoText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#e74c3c',
    marginTop: 8,
    textAlign: 'center',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#3498db',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  externalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#e74c3c',
    borderRadius: 6,
  },
  externalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  stepIndicator: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
    color: '#333',
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
    lineHeight: 24,
  },
  timestampContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0e5d8',
  },
  timestampText: {
    fontSize: 14,
    color: '#ff9800',
    fontWeight: '600',
  },
  timestampNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
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
  buttonDisabled: {
    backgroundColor: '#ddd',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});