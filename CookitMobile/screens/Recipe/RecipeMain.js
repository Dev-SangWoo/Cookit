// 단계별 요약화면

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';

const recipeSteps = [
  { title: '재료 준비하기', description: '모든 재료를 깨끗이 씻고 손질해 주세요.' },
  { title: '팬 예열하기', description: '팬을 중불에서 1분간 예열합니다.' },
  { title: '재료 볶기', description: '채소와 고기를 넣고 볶아주세요.' },
  { title: '양념 추가하기', description: '간장, 설탕, 참기름을 넣고 잘 섞습니다.' },
];

const Recipe = ({ route }) => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ route.params에서 전달된 recipe 사용
  const recipeId = route?.params?.recipeId || route?.params?.recipe_id || route?.params?.id;
  const initialRecipe = route?.params?.recipe || null;

  const [recipe, setRecipe] = useState(initialRecipe);
  const [loading, setLoading] = useState(!initialRecipe); // 전달받은 recipe가 없을 때만 로딩
  const [videoUrl, setVideoUrl] = useState(initialRecipe?.video_url || null);
  const [videoError, setVideoError] = useState(false);
  const [videoId, setVideoId] = useState(null);

  const totalSteps = recipe?.instructions?.length || recipeSteps.length;
  const currentStep = recipe?.instructions?.[currentIndex] || recipeSteps[currentIndex];

  // ✅ YouTube URL에서 video ID 추출
  const extractVideoId = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/shorts/')) return url.split('youtube.com/shorts/')[1]?.split('?')[0];
    if (url.includes('youtube.com/watch?v=')) return url.split('v=')[1]?.split('&')[0];
    if (url.includes('youtu.be/')) return url.split('youtu.be/')[1]?.split('?')[0];
    return null;
  };

  // ✅ 전달받은 recipe의 video_url에서 바로 videoId 추출
  useEffect(() => {
    if (videoUrl) {
      const id = extractVideoId(videoUrl);
      setVideoId(id);
    }
  }, [videoUrl]);

  // ✅ Supabase에서 recipe 가져오기 (없을 경우만)
  useEffect(() => {
    const fetchRecipe = async () => {
      if (recipe) return; // 이미 있으면 요청 생략

      if (!recipeId) {
        Alert.alert('오류', '레시피 ID가 전달되지 않았습니다.');
        setLoading(false);
        return;
      }

      console.log('🔍 Supabase에서 레시피 불러오는 중...', recipeId);
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
        const id = extractVideoId(data.video_url);
        setVideoId(id);

        console.log('✅ 레시피 데이터 로드 완료');
      } catch (err) {
        console.error('❌ 레시피 조회 중 오류:', err);
        Alert.alert('오류', '레시피를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  // YouTube 타임스탬프 처리
  const timeToSeconds = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

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
          autoplay: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          start: startTime
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange
        }
      });
    }
    function onPlayerReady(event) {
      event.target.playVideo();
    }
    function onPlayerStateChange(event) {
      if (event.data === YT.PlayerState.PLAYING && endTime > 0) checkTime();
    }
    function checkTime() {
      if (!player || typeof player.getCurrentTime !== 'function') return;
      const currentTime = player.getCurrentTime();
      if (endTime > 0 && currentTime >= endTime) player.seekTo(startTime, true);
      if (player.getPlayerState() === YT.PlayerState.PLAYING) setTimeout(checkTime, 500);
    }
  </script>
</body>
</html>`;
  };

  const handleNext = () => {
    if (currentIndex < totalSteps - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  // 로딩 상태 표시
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
      {/* ✅ YouTube 영상 */}
      <View style={styles.videoWrapper}>
        {videoId && !videoError ? (
          <WebView
            key={`video-${currentIndex}-${currentStep?.start_time || 'default'}`}
            source={{
              html: getYouTubeHTML(
                videoId,
                currentStep?.start_time,
                currentStep?.end_time
              ),
            }}
            style={styles.video}
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            javaScriptEnabled
            domStorageEnabled
            onError={(error) => {
              console.error('❌ WebView 오류:', error);
              setVideoError(true);
            }}
          />
        ) : (
          <View style={styles.noVideoContainer}>
            <Text style={styles.noVideoText}>
              {videoError ? '🚫 영상 로딩 오류' : '📹 영상이 없습니다'}
            </Text>
            {videoUrl && (
              <TouchableOpacity
                style={styles.externalButton}
                onPress={() => Linking.openURL(videoUrl)}
              >
                <Text style={styles.externalButtonText}>브라우저에서 보기</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* ✅ 단계 표시 */}
      <Text style={styles.stepIndicator}>
        Step {currentIndex + 1} / {totalSteps}
      </Text>

      <View style={styles.card}>
        <Text style={styles.title}>
          {currentStep?.title || currentStep?.instruction || '제목 없음'}
        </Text>
        <Text style={styles.desc}>
          {currentStep?.instruction || currentStep?.description || '설명 없음'}
        </Text>

        {currentStep?.start_time && (
          <View style={styles.timestampContainer}>
            <Text style={styles.timestampText}>
              🔁 영상 구간: {currentStep.start_time}
              {currentStep.end_time && ` ~ ${currentStep.end_time}`}
            </Text>
          </View>
        )}
      </View>

      {/* 단계 네비게이션 */}
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

      {/* ✅ 요약 보기 버튼 */}
      <View style={styles.summaryButtonContainer}>
        <TouchableOpacity
          style={styles.summaryButton}
          onPress={() => {
            navigation.navigate('Recipe', {   // ✅ 중첩 네비게이터 접근
              screen: 'RecipeSummary',        // ✅ 내부 스택의 실제 화면 이름
              params: {
                recipeId,
                recipe,
              },
            });
          }}
        >
          <Text style={styles.summaryButtonText}>📋 요약 보기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Recipe;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  videoWrapper: { height: 220, backgroundColor: '#000', borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  video: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
  noVideoContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 20 },
  noVideoText: { fontSize: 16, color: '#999', marginBottom: 10 },
  externalButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#ff9800', borderRadius: 6 },
  externalButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  stepIndicator: { fontSize: 16, textAlign: 'center', marginBottom: 20, fontWeight: '600', color: '#333' },
  card: { padding: 20, backgroundColor: '#fef5e7', borderRadius: 10, elevation: 2 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  desc: { fontSize: 16, color: '#555', lineHeight: 24 },
  timestampContainer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0e5d8' },
  timestampText: { fontSize: 14, color: '#ff9800', fontWeight: '600' },
  navButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  button: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#ffcc80', borderRadius: 8 },
  buttonDisabled: { backgroundColor: '#ddd' },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#333' },
  summaryButtonContainer: { marginTop: 20, alignItems: 'center' },
  summaryButton: { backgroundColor: '#ff9800', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 25 },
  summaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
