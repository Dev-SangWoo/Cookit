// 요약한 내용을 보여주는 곳 TEXT로 정리
// 재료랑 필요한 양이 나와있는데 원한다면 재료 구매 탭 만들기도 가능(쿠팡으로 보내기)
// 위쪽에는 요리 영상, 그 밑에는 요리 재료랑 단계들

import { ScrollView, Platform, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Linking, Dimensions, Switch } from 'react-native'
import React, { useState, useEffect, useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../lib/supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'
import recipeService from '../services/recipeService'
import YouTubePlayer from '../components/YouTubePlayer'

const { width } = Dimensions.get('window');

const Summary = () => {

  const insets = useSafeAreaInsets();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();
  
  // 파라미터들
  const receivedRecipeId = route?.params?.recipeId;
  const analysisId = route?.params?.analysisId;
  const isYouTubeAnalysis = route?.params?.isYouTubeAnalysis;
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [originalVideoUrl, setOriginalVideoUrl] = useState(null);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true); // 자동재생 옵션
  const [voiceControlEnabled, setVoiceControlEnabled] = useState(false); // 음성 제어 옵션
  
  const RECENT_VIEWED_KEY = '@recent_viewed_recipes';
  const MAX_RECENT_VIEWED = 10;

  // 이미지 URL 변환 함수
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const { data } = supabase.storage.from('recipe-images').getPublicUrl(imagePath);
    return data.publicUrl;
  };

  // 최근 조회한 레시피 저장
  const saveRecentViewedRecipe = async (recipeData) => {
    try {
      if (!recipeData || !recipeData.id) return;
      
      const stored = await AsyncStorage.getItem(RECENT_VIEWED_KEY);
      const history = stored ? JSON.parse(stored) : [];
      
      // 이미 존재하는 레시피는 제거하고 최상단에 추가
      const filtered = history.filter(r => r.recipe_id !== recipeData.id);
      
      // 이미지 URL 처리
      const thumbnailUrl = recipeData.image_urls?.[0] 
        ? getImageUrl(recipeData.image_urls[0])
        : null;
      
      // 새로운 레시피 정보 추가
      const newRecipe = {
        recipe_id: recipeData.id,
        title: recipeData.title,
        description: recipeData.description || null,
        thumbnail: thumbnailUrl,
        prep_time: recipeData.prep_time || null,
        cook_time: recipeData.cook_time || null,
        difficulty_level: recipeData.difficulty_level || null,
        last_viewed_at: new Date().toISOString(),
      };
      
      // 최대 10개까지만 저장
      const updated = [newRecipe, ...filtered].slice(0, MAX_RECENT_VIEWED);
      
      await AsyncStorage.setItem(RECENT_VIEWED_KEY, JSON.stringify(updated));
      console.log('✅ 최근 조회 레시피 저장 완료:', recipeData.title);
    } catch (error) {
      console.error('❌ 최근 조회 레시피 저장 실패:', error);
    }
  };


  // 외부 브라우저로 YouTube 열기
  const openInBrowser = async () => {
    if (originalVideoUrl) {
      try {
        await Linking.openURL(originalVideoUrl);
      } catch (error) {
        console.error('브라우저 열기 실패:', error);
      }
    }
  };

  // 디버깅 정보 출력
  const logDebugInfo = () => {
    console.log('🔍 디버깅 정보:');
    console.log('- 원본 URL:', originalVideoUrl);
    console.log('- 오류 상태:', videoError);
    console.log('- 자동재생:', autoplayEnabled);
  };

  // WebView에서 특정 시간으로 영상 이동
  const playVideoAtTime = (url, startTime) => {
    if (!url) {
      console.log('❌ URL이 없습니다');
      return;
    }
    
    console.log('🎬 영상 시간 이동:', { url, startTime, autoplay: autoplayEnabled });
    // YouTubePlayer 컴포넌트가 자동으로 처리하므로 별도 작업 불필요
      setVideoError(false); // 오류 상태 초기화
  };

  // YouTube 분석 결과 확인
  const checkAnalysisResult = async () => {
    try {
      setIsLoadingAnalysis(true);
      
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';
      const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
      const response = await fetch(`${baseUrl}/youtube-analysis/result/${analysisId}`);
      const data = await response.json();
      
      if (data.success && data.data.status === 'completed') {
        setAnalysisResult(data.data.result);
        const recipeData = data.data.result.recipe;
        setRecipe(recipeData);
        
        // 분석 결과에서도 영상 URL 설정
        const videoUrl = recipeData?.video_url || recipeData?.source_url;
        if (videoUrl) {
          setOriginalVideoUrl(videoUrl); // 원본 URL 저장
            console.log('🎥 분석 결과 영상 URL 설정:', videoUrl);
        }
        
        // 📊 YouTube 분석 결과 레시피 조회수 증가
        if (recipeData?.id) {
          console.log('📊 YouTube 분석 결과 조회수 증가 시도:', recipeData.id);
          recipeService.incrementViewCount(recipeData.id).catch(err => {
            console.warn('⚠️ YouTube 분석 결과 조회수 증가 실패:', err.message);
          });
          } else {
          console.warn('⚠️ YouTube 분석 결과에 recipe ID가 없습니다:', recipeData);
        }
      } else if (data.data.status === 'processing') {
        // 아직 처리 중이면 3초 후 다시 확인
        setTimeout(checkAnalysisResult, 3000);
      } else {
        console.error('분석 결과를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('분석 결과 확인 오류:', error);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // 레시피 데이터 가져오기
    const fetchRecipe = async () => {
      if (!receivedRecipeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Summary에서 레시피 로딩 시작:', receivedRecipeId);

        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', receivedRecipeId)
          .single();

        if (error) {
          console.error('❌ 레시피 로딩 오류:', error);
          return;
        }

        if (data) {
          setRecipe(data);
        // 초기 영상 URL 설정 - video_url 우선, 없으면 source_url 사용
        const videoUrl = data.video_url || data.source_url;
        if (videoUrl) {
          setOriginalVideoUrl(videoUrl); // 원본 URL 저장
          console.log('🔍 원본 URL:', videoUrl);
          console.log('📺 URL 타입:', videoUrl.includes('watch') ? 'watch 형식' : '다른 형식');
          }
          console.log('✅ Summary 레시피 데이터 로드 완료:', data.title);
        console.log('🎥 영상 URL:', videoUrl);
        
        // 레시피 조회 기록 저장 (YouTube 분석이 아닌 경우만)
        if (!isYouTubeAnalysis) {
          await saveRecentViewedRecipe(data);
        }
        
        // 📊 조회수 증가는 이미 Summary 진입 시 실행되었으므로 여기서는 중복 실행하지 않음
        // (receivedRecipeId가 있을 때만 첫 번째 useEffect에서 실행됨)
        }
      } catch (error) {
        console.error('❌ 레시피 로딩 예외:', error);
      } finally {
        setLoading(false);
      }
    };

  // Summary 화면 진입 시 조회수 증가 (가장 먼저 실행)
  useEffect(() => {
    const incrementViewOnMount = async () => {
      // 레시피 ID가 있으면 즉시 조회수 증가
      if (receivedRecipeId) {
        console.log('📊 Summary 진입 - 조회수 증가 시작:', receivedRecipeId);
        try {
          await recipeService.incrementViewCount(receivedRecipeId);
          console.log('✅ 조회수 증가 완료:', receivedRecipeId);
        } catch (error) {
          console.error('❌ 조회수 증가 실패:', error);
        }
      }
    };

    incrementViewOnMount();
  }, [receivedRecipeId]); // receivedRecipeId가 변경될 때만 실행

  // useEffect들
  useEffect(() => {
    if (isYouTubeAnalysis && analysisId) {
      checkAnalysisResult();
    } else if (!isYouTubeAnalysis && receivedRecipeId) {
    fetchRecipe();
    } else {
      setLoading(false);
    }
  }, [receivedRecipeId, analysisId, isYouTubeAnalysis]);

  const handleDelete = () => {
    navigation.replace("HomeTab");
  };
  const handleStart = () => {
    // recipeId가 있으면 해당 ID로 Recipe 화면으로 이동
    if (receivedRecipeId) {
      navigation.replace("Recipe", { 
        screen: 'RecipeMain',
        params: { 
          recipeId: receivedRecipeId,
          voiceControlEnabled: voiceControlEnabled // 음성 제어 옵션 전달
        }
      });
    } else {
      // Summary 화면에서 직접 접근한 경우 - 실제 레시피 ID 사용
      // 가장 최근 레시피 ID 사용 (데모용)
      const demoRecipeId = "73928ef2-12d2-4d17-9e51-f1dcccfaf878"; // 백종원 초간단 참치마요덮밥
      navigation.replace("Recipe", { 
        screen: 'RecipeMain',
        params: { 
          recipeId: demoRecipeId,
          voiceControlEnabled: voiceControlEnabled // 음성 제어 옵션 전달
        }
      });
    }
  }


  // 더미 데이터 (recipeId가 없을 때 사용)
  const dummyRecipe = {
    title: '크림 파스타 만들기',
    cook_time: '25분',
    prep_time: '10분',
    servings: '2인분',
    source_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    ingredients: [
      { name: '스파게티 면', quantity: '200', unit: 'g' },
      { name: '생크림', quantity: '150', unit: 'ml' },
      { name: '버터', quantity: '2', unit: '큰술' },
      { name: '마늘', quantity: '3', unit: '쪽' },
      { name: '파마산 치즈', quantity: '50', unit: 'g' },
    ],
    instructions: [
      { 
        step: 1, 
        title: '마늘 준비', 
        instruction: '마늘을 다져주세요',
        start_time: '00:00',
        end_time: '00:30'
      },
      { 
        step: 2, 
        title: '마늘 볶기', 
        instruction: '팬에 버터를 녹이고 마늘을 볶아주세요',
        start_time: '00:30',
        end_time: '02:00'
      },
      { 
        step: 3, 
        title: '크림 소스', 
        instruction: '생크림을 넣고 졸인 뒤 면과 함께 버무려주세요',
        start_time: '02:00',
        end_time: '05:00'
      },
    ],
  };

  // 더미 데이터 사용 시 초기 영상 URL 설정
  useEffect(() => {
    if (!recipe && dummyRecipe.source_url && !originalVideoUrl) {
      setOriginalVideoUrl(dummyRecipe.source_url); // 원본 URL 저장
      }
  }, [recipe, originalVideoUrl]);

  // 표시할 레시피 데이터 결정
  const displayRecipe = recipe || dummyRecipe;

  // 로딩 상태
  if (loading || isLoadingAnalysis) {
    return (
      <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 15 : 0 }}>
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffcc80" />
            <Text style={styles.loadingText}>
              {isLoadingAnalysis ? '영상을 분석하는 중입니다...' : '레시피를 불러오는 중...'}
            </Text>
            {isLoadingAnalysis && (
              <Text style={styles.loadingSubText}>잠시만 기다려주세요</Text>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 15 : 0 }}>
      <View style={styles.container}>
        <Text style={styles.title}>레시피 요약</Text>
        
        {/* YouTube 영상 - 맨 위에 고정 */}
        {originalVideoUrl && (
          <View style={styles.videoSection}>
            <View style={styles.videoHeader}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="play-circle-outline" size={20} color="#FF6B35" /> 요리 영상
            </Text>
              
              {/* 자동재생 토글 버튼 */}
              <TouchableOpacity 
                style={styles.autoplayToggle}
                onPress={() => {
                  setAutoplayEnabled(!autoplayEnabled);
                }}
              >
                <Ionicons 
                  name={autoplayEnabled ? "play-circle" : "play-circle-outline"} 
                  size={24} 
                  color={autoplayEnabled ? "#FF6B35" : "#666"} 
                />
                <Text style={[
                  styles.autoplayText, 
                  { color: autoplayEnabled ? "#FF6B35" : "#666" }
                ]}>
                  {autoplayEnabled ? "자동재생 ON" : "자동재생 OFF"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.videoContainer}>
              <YouTubePlayer
                videoUrl={originalVideoUrl}
                startTime={null}
                autoplay={autoplayEnabled}
                webviewKey={`webview-${autoplayEnabled ? 'autoplay' : 'no-autoplay'}`}
                onLoadStart={() => {
                  console.log('🔄 YouTube 로딩 시작');
                }}
                onLoad={() => {
                  console.log('✅ YouTube 로드 완료');
                  setVideoError(false);
                }}
                onError={(error) => {
                  console.error('❌ WebView 오류:', error);
                  setVideoError(true);
                }}
                height={220}
                showErrorUI={true}
              />
            </View>
            
            {/* 오류 발생 시 대체 버튼 */}
            {videoError && originalVideoUrl && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>🚫 YouTube 영상 로딩 오류</Text>
                <Text style={styles.errorSubText}>
                  YouTube 영상을 불러올 수 없습니다.
                </Text>
                <Text style={styles.debugInfo}>
                  Google YouTube API 서비스 약관 요구사항 미충족으로 인한 문제일 수 있습니다.
                </Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={() => {
                      setVideoError(false);
                      logDebugInfo();
                      console.log('🔄 재시도');
                    }}
                  >
                    <Text style={styles.retryButtonText}>다시 시도</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.browserButton}
                    onPress={openInBrowser}
                  >
                    <Text style={styles.browserButtonText}>브라우저에서 보기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        <ScrollView 
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* 레시피 제목 */}
          <Text style={styles.recipeTitle}>
            {displayRecipe.title}
          </Text>

          {/* YouTube 분석 결과 추가 정보 */}
          {isYouTubeAnalysis && analysisResult && (
            <View style={styles.youtubeInfo}>
              <Text style={styles.youtubeChannel}>📺 {analysisResult.videoInfo.channelTitle}</Text>
              <Text style={styles.youtubeDuration}>⏱ {analysisResult.videoInfo.duration}</Text>
            </View>
          )}

          {/* 레시피 정보 */}
          {(displayRecipe.cook_time || displayRecipe.prep_time || displayRecipe.servings) && (
            <View style={styles.recipeInfo}>
              {displayRecipe.prep_time && (
                <View style={styles.infoItem}>
                  <Ionicons name="time-outline" size={16} color="#FF6B35" />
                  <Text style={styles.infoText}>준비: {displayRecipe.prep_time}</Text>
                </View>
              )}
              {displayRecipe.cook_time && (
                <View style={styles.infoItem}>
                  <Ionicons name="timer-outline" size={16} color="#FF6B35" />
                  <Text style={styles.infoText}>조리: {displayRecipe.cook_time}</Text>
                </View>
              )}
              {displayRecipe.servings && (
                <View style={styles.infoItem}>
                  <Ionicons name="people-outline" size={16} color="#FF6B35" />
                  <Text style={styles.infoText}>{displayRecipe.servings}</Text>
                </View>
              )}
            </View>
          )}

          {/* 재료 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="list-outline" size={20} color="#FF6B35" /> 재료
            </Text>
            <View style={styles.ingredientsList}>
              {displayRecipe.ingredients?.map((item, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.ingredientInfo}>
                    <Text style={styles.ingredientName}>{item.name}</Text>
                    <Text style={styles.ingredientAmount}>
                      {item.quantity} {item.unit}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* 요리 과정 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="restaurant-outline" size={20} color="#FF6B35" /> 요리 과정
            </Text>
            <View style={styles.stepsList}>
              {displayRecipe.instructions?.map((step, stepIndex) => (
                <View key={stepIndex} style={styles.stepGroup}>
                  {/* 단계 제목 */}
                  <View style={styles.stepGroupHeader}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{step.step}</Text>
                    </View>
                    <Text style={styles.stepGroupTitle}>{step.title}</Text>
                  </View>
                  
                  {/* 단계별 액션들 */}
                  {step.actions?.map((action, actionIndex) => (
                    <TouchableOpacity 
                      key={actionIndex} 
                      style={styles.actionItem}
                      onPress={() => action.start_time && playVideoAtTime(originalVideoUrl, action.start_time)}
                    >
                      <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>{action.action}</Text>
                        <Text style={styles.actionDescription}>{action.description}</Text>
                        
                        {/* 재료 정보 */}
                        {action.ingredients && action.ingredients.length > 0 && (
                          <View style={styles.ingredientsContainer}>
                            <Text style={styles.ingredientsLabel}>재료:</Text>
                            <View style={styles.ingredientsRow}>
                              {action.ingredients.map((ingredient, ingIndex) => (
                                <View key={ingIndex} style={styles.ingredientTag}>
                                  <Text style={styles.ingredientTagText}>
                                    {ingredient.name} {ingredient.quantity}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}
                        
                        {/* 시간 정보 */}
                        {action.start_time && (
                          <View style={styles.timeContainer}>
                            <Ionicons name="time-outline" size={14} color="#666" />
                            <Text style={styles.timeText}>
                              {action.start_time}
                            </Text>
                          </View>
                        )}
                      </View>
                      {action.start_time && (
                        <Ionicons name="play-circle-outline" size={24} color="#FF6B35" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )) || displayRecipe.instructions?.map((step, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.stepItem}
                  onPress={() => step.start_time && playVideoAtTime(originalVideoUrl, step.start_time)}
                >
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{step.step || index + 1}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepInstruction}>{step.instruction}</Text>
                    {step.start_time && (
                      <View style={styles.timeContainer}>
                        <Ionicons name="time-outline" size={14} color="#666" />
                        <Text style={styles.timeText}>
                          {step.start_time} - {step.end_time}
                        </Text>
                      </View>
                    )}
                  </View>
                  {step.start_time && (
                    <Ionicons name="play-circle-outline" size={24} color="#FF6B35" />
                  )}
                </TouchableOpacity>
              )) || displayRecipe.steps?.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepInstruction}>{step}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* 하단 버튼들 */}
        <View style={[styles.Buttoncontainer, { paddingBottom: Math.min(insets.bottom, 10) }]}>
          {/* 음성 제어 토글 */}
          <View style={styles.voiceControlToggleContainer}>
            <View style={styles.voiceControlToggle}>
              <Ionicons 
                name={voiceControlEnabled ? "mic" : "mic-off"} 
                size={20} 
                color={voiceControlEnabled ? "#4CAF50" : "#999"} 
              />
              <Text style={[
                styles.voiceControlText,
                { color: voiceControlEnabled ? "#4CAF50" : "#999" }
              ]}>
                음성 제어
              </Text>
              <Switch
                value={voiceControlEnabled}
                onValueChange={setVoiceControlEnabled}
                trackColor={{ false: '#ccc', true: '#4CAF50' }}
                thumbColor={voiceControlEnabled ? '#fff' : '#f4f3f4'}
                style={styles.switch}
              />
            </View>
            {voiceControlEnabled && (
              <Text style={styles.voiceControlHint}>
                "다음", "이전", "타이머 3분" 등 말하기
              </Text>
            )}
          </View>

          <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonHome} onPress={handleDelete}>
            <Ionicons name="home-outline" size={20} color="#FF6B35" />
            <Text style={styles.homeText}>홈으로</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.buttonStart}
            onPress={handleStart}
          >
            <Ionicons name="play-outline" size={20} color="#fff" />
            <Text style={styles.startText}>요리 시작하기</Text>
          </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Summary

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
    color: '#333',
  },
  recipeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  recipeInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  videoContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    height: 220,
  },
  webview: {
    height: 220,
    backgroundColor: '#000',
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  webviewLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  ingredientsList: {
    gap: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ingredientInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ingredientName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  ingredientAmount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  stepsList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  stepInstruction: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  stepGroup: {
    backgroundColor: '#fff',
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  stepGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    padding: 16,
  },
  stepGroupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
    flex: 1,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionContent: {
    flex: 1,
    marginRight: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  ingredientsContainer: {
    marginBottom: 12,
  },
  ingredientsLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
    fontWeight: '600',
  },
  ingredientsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ingredientTag: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  ingredientTagText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  Buttoncontainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  voiceControlToggleContainer: {
    marginBottom: 12,
  },
  voiceControlToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  voiceControlText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
    marginRight: 8,
    flex: 1,
  },
  voiceControlHint: {
    fontSize: 11,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '500',
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  buttonHome: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF6B35',
    width: '45%',
    justifyContent: 'center',
  },
  homeText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  buttonStart: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: '#FF6B35',
    width: '45%',
    justifyContent: 'center',
  },
  startText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  youtubeInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginHorizontal: 20,
  },
  youtubeChannel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  youtubeDuration: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    color: '#e74c3c',
    marginBottom: 8,
    textAlign: 'center',
  },
  debugInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#3498db',
    borderRadius: 6,
    marginRight: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  browserButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#e74c3c',
    borderRadius: 6,
    marginLeft: 8,
  },
  browserButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  autoplayToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  autoplayText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
})