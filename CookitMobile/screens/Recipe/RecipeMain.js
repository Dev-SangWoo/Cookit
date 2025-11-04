// 단계별 요약화면

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Linking, ScrollView, Animated, Platform, PermissionsAndroid } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { RhinoManager } from '@picovoice/rhino-react-native';

const recipeSteps = [
  { title: '재료 준비하기', description: '모든 재료를 깨끗이 씻고 손질해 주세요.' },
  { title: '팬 예열하기', description: '팬을 중불에서 1분간 예열합니다.' },
  { title: '재료 볶기', description: '채소와 고기를 넣고 볶아주세요.' },
  { title: '양념 추가하기', description: '간장, 설탕, 참기름을 넣고 잘 섞습니다.' },
];

const Recipe = ({ route }) => {
  const navigation = useNavigation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoError, setVideoError] = useState(false);
  const [videoId, setVideoId] = useState(null);
  
  // Picovoice 음성 인식 관련 상태
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(route?.params?.voiceControlEnabled || false);
  const [isListening, setIsListening] = useState(false);
  const rhinoManagerRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // 타이머 관련 상태
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerInterval = useRef(null);
  
  // route.params에서 recipeId 가져오기 (id, recipe_id, recipeId 모두 지원)
  const recipeId = route?.params?.recipeId || route?.params?.recipe_id || route?.params?.id;
  
  const totalSteps = recipe?.instructions?.length || recipeSteps.length;
  const currentStep = recipe?.instructions?.[currentStepIndex] || recipeSteps[currentStepIndex];
  
  // 현재 action 계산
  const currentAction = currentStep?.actions?.[currentActionIndex];
  
  // 전체 action 수 계산
  const totalActions = recipe?.instructions?.reduce((total, step) => {
    return total + (step.actions?.length || 1);
  }, 0) || recipeSteps.length;
  
  // 현재 전체 진행도 계산 (step + action 기준)
  const currentProgress = recipe?.instructions?.slice(0, currentStepIndex).reduce((total, step) => {
    return total + (step.actions?.length || 1);
  }, 0) + currentActionIndex + 1;
  
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

  // Google 공식 문서 기반 YouTube HTML 생성 (HTTP Referer 헤더 요구사항 충족)
  const getYouTubeHTML = (videoId, startTime = null, endTime = null, autoplay = true) => {
    if (!videoId) return null;
    
    console.log('📺 Video ID:', videoId);
    console.log('⏰ Start Time:', startTime);
    console.log('⏹️ End Time:', endTime);
    console.log('▶️ Autoplay:', autoplay);
    console.log('📋 Google 공식 요구사항 적용');
    
    // 앱의 Bundle ID 형태로 Referer 설정 (Google 문서 요구사항)
    const bundleId = 'com.cookit.app'; // 실제 앱의 Bundle ID로 변경 필요
    const referrer = `https://${bundleId}`;
    
    // 시작 시간을 초로 변환
    const startSeconds = startTime ? timeToSeconds(startTime) : 0;
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta name="referrer-policy" content="strict-origin-when-cross-origin">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      margin: 0; 
      padding: 0; 
      background: #000; 
      overflow: hidden;
      height: 100vh;
    }
    .video-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .error-message {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      text-align: center;
      font-family: Arial, sans-serif;
    }
  </style>
</head>
<body>
  <div class="video-wrapper">
    <iframe 
      id="youtube-player"
      src="https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&controls=1&rel=0&modestbranding=1&playsinline=1&fs=1&cc_load_policy=0&iv_load_policy=3&disablekb=0&enablejsapi=1&start=${startSeconds}"
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
      allowfullscreen
      loading="lazy"
      referrerpolicy="strict-origin-when-cross-origin">
    </iframe>
    <div class="error-message" id="error-message" style="display: none;">
      <h3>영상 로딩 실패</h3>
      <p>YouTube API 서비스 약관 요구사항 미충족으로 인한 문제일 수 있습니다.</p>
    </div>
  </div>
  
  <script>
    // Google 공식 문서 요구사항 적용
    const iframe = document.getElementById('youtube-player');
    const errorMessage = document.getElementById('error-message');
    
    // Google 문서에서 요구하는 Bundle ID 기반 Referer 설정
    Object.defineProperty(document, 'referrer', {
      value: '${referrer}',
      writable: false
    });
    
    // 로딩 타임아웃 설정 (10초)
    const loadingTimeout = setTimeout(() => {
      console.log('⏰ 로딩 타임아웃 - Google API 요구사항 미충족 가능성');
      errorMessage.style.display = 'block';
    }, 10000);
    
    // 성공적으로 로드되면 타임아웃 해제
    iframe.addEventListener('load', () => {
      console.log('✅ YouTube iframe 로드 완료 (Google 요구사항 충족)');
      clearTimeout(loadingTimeout);
    });
    
    // 오류 발생 시 처리
    iframe.addEventListener('error', () => {
      console.log('❌ YouTube iframe 오류 (API 서비스 약관 위반 가능성)');
      clearTimeout(loadingTimeout);
      errorMessage.style.display = 'block';
    });
    
    // YouTube API 관련 오류 감지
    window.addEventListener('error', (e) => {
      if (e.message.includes('youtube') || e.message.includes('153') || e.message.includes('referrer') || e.message.includes('api')) {
        console.log('❌ YouTube API 서비스 약관 관련 오류 감지:', e.message);
        clearTimeout(loadingTimeout);
        errorMessage.style.display = 'block';
      }
    });
    
    // Google 요구사항 확인 로그
    console.log('🔍 Google API 요구사항 확인:');
    console.log('- Referer:', document.referrer);
    console.log('- Referrer Policy:', document.querySelector('meta[name="referrer-policy"]')?.content);
    console.log('- Bundle ID 기반 Referer:', '${referrer}');
    
    // 구간반복 기능 (endTime이 있을 때만)
    ${endTime ? `
    const startSeconds = ${startSeconds};
    const endSeconds = ${timeToSeconds(endTime)};
    let loopInterval = null;
    let player = null;
    
    console.log('🔄 구간반복 설정:', startSeconds + '초 ~ ' + endSeconds + '초');
    
    // YouTube API 로드 대기
    function onYouTubeIframeAPIReady() {
      player = new YT.Player('youtube-player', {
        events: {
          'onReady': function(event) {
            console.log('✅ YouTube Player 준비 완료 - 구간반복 활성화');
            
            // 구간반복 체크 함수
            function checkLoop() {
              if (player && player.getCurrentTime) {
                const currentTime = player.getCurrentTime();
                if (currentTime >= endSeconds) {
                  console.log('🔄 구간 끝 - 자연스럽게 처음으로 돌아가기');
                  // 부드러운 전환을 위해 약간의 지연 후 이동
                  setTimeout(() => {
                    player.seekTo(startSeconds, true);
                  }, 100);
                }
              }
            }
            
            // 0.2초마다 구간반복 체크 (더 자연스러운 반복)
            loopInterval = setInterval(checkLoop, 200);
            
            // 재생 상태 변경 시에도 체크
            event.target.addEventListener('onStateChange', function(e) {
              if (e.data === YT.PlayerState.PLAYING) {
                console.log('▶️ 재생 시작 - 구간반복 모니터링 활성화');
                if (!loopInterval) {
                  loopInterval = setInterval(checkLoop, 200);
                }
              } else if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED) {
                console.log('⏸️ 일시정지/종료 - 구간반복 모니터링 일시정지');
                if (loopInterval) {
                  clearInterval(loopInterval);
                  loopInterval = null;
                }
              }
            });
          }
        }
      });
    }
    
    // 페이지 언로드 시 인터벌 정리
    window.addEventListener('beforeunload', function() {
      if (loopInterval) {
        clearInterval(loopInterval);
        loopInterval = null;
      }
    });
    
    // YouTube API 스크립트 로드
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    ` : ''}
  </script>
</body>
</html>
    `;
  };

  // 다음 액션의 시작 시간을 가져오는 함수 (구간반복용)
  const getNextActionStartTime = () => {
    if (!currentStep?.actions) return null;
    
    const currentActions = currentStep.actions;
    const nextActionIndex = currentActionIndex + 1;
    
    // 현재 단계 내에서 다음 액션이 있으면 그 액션의 시작 시간 반환
    if (nextActionIndex < currentActions.length) {
      return currentActions[nextActionIndex].start_time;
    }
    
    // 현재 단계의 마지막 액션이면 다음 단계의 첫 번째 액션 시간 반환
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < totalSteps && recipe?.instructions?.[nextStepIndex]?.actions?.[0]?.start_time) {
      return recipe.instructions[nextStepIndex].actions[0].start_time;
    }
    
    // 마지막 액션이면 null 반환 (구간반복 안함)
    return null;
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
        // source_url만 사용
        const videoUrl = data.source_url;
        setVideoUrl(videoUrl);
        setVideoError(false);
        
        // YouTube video ID 추출
        const extractedVideoId = extractVideoId(videoUrl);
        setVideoId(extractedVideoId);
        
        console.log('✅ 레시피 데이터 로드 완료');
        console.log('📋 레시피 제목:', data.title);
        console.log('📝 조리 단계 수:', data.instructions?.length || 0);
        console.log('📺 영상 URL:', videoUrl);
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

  const handleNext = useCallback(() => {
    setCurrentStepIndex((prevStepIndex) => {
      setCurrentActionIndex((prevActionIndex) => {
        const currentStepData = recipe?.instructions?.[prevStepIndex];
        const actionsLength = currentStepData?.actions?.length || 1;
        const totalStepsCount = recipe?.instructions?.length || 0;
        
        console.log('🔍 handleNext 호출됨');
        console.log('🔍 현재 상태:', { 
          stepIndex: prevStepIndex, 
          actionIndex: prevActionIndex, 
          totalSteps: totalStepsCount, 
          actionsLength 
        });
        
        // 현재 step의 다음 action이 있는지 확인
        if (prevActionIndex < actionsLength - 1) {
          // 같은 step 내에서 다음 action으로
          const nextActionIndex = prevActionIndex + 1;
          console.log('▶️ 같은 step 내에서 다음 action으로 이동:', nextActionIndex);
          return nextActionIndex;
        } else if (prevStepIndex < totalStepsCount - 1) {
          // 다음 step의 첫 번째 action으로
          const nextStepIndex = prevStepIndex + 1;
          console.log('▶️ 다음 step으로 이동:', nextStepIndex);
          // stepIndex는 아래에서 업데이트
          return 0; // 다음 step의 첫 번째 action
        } else {
          console.log('⚠️ 이미 마지막 단계입니다');
          return prevActionIndex;
        }
      });
      
      // stepIndex 업데이트 (action이 마지막이고 다음 step이 있을 때만)
      const currentStepData = recipe?.instructions?.[prevStepIndex];
      const actionsLength = currentStepData?.actions?.length || 1;
      const totalStepsCount = recipe?.instructions?.length || 0;
      
      if (currentActionIndex < actionsLength - 1) {
        return prevStepIndex; // stepIndex는 변경 안 함
      } else if (prevStepIndex < totalStepsCount - 1) {
        return prevStepIndex + 1; // 다음 step으로
      }
      
      return prevStepIndex;
    });
  }, [recipe, currentActionIndex]);

  // 마지막 단계인지 확인하는 함수
  const isLastStep = () => {
    return currentStepIndex === totalSteps - 1 && 
           currentActionIndex === (currentStep?.actions?.length || 1) - 1;
  };

  // 요리 완성 버튼 클릭 핸들러
  const handleCompleteCooking = () => {
    navigation.navigate('RecipeRating', { 
      recipeId: recipeId,
      recipe: recipe 
    });
  };

  const handlePrev = useCallback(() => {
    setCurrentStepIndex((prevStepIndex) => {
      setCurrentActionIndex((prevActionIndex) => {
        const totalStepsCount = recipe?.instructions?.length || 0;
        
        console.log('🔍 handlePrev 호출됨');
        console.log('🔍 현재 상태:', { 
          stepIndex: prevStepIndex, 
          actionIndex: prevActionIndex,
          totalSteps: totalStepsCount 
        });
        
        // 현재 step의 이전 action이 있는지 확인
        if (prevActionIndex > 0) {
          // 같은 step 내에서 이전 action으로
          const prevActionIndexNew = prevActionIndex - 1;
          console.log('◀️ 같은 step 내에서 이전 action으로 이동:', prevActionIndexNew);
          return prevActionIndexNew;
        } else if (prevStepIndex > 0) {
          // 이전 step의 마지막 action으로
          const prevStepData = recipe?.instructions?.[prevStepIndex - 1];
          const prevStepActionsLength = prevStepData?.actions?.length || 1;
          console.log('◀️ 이전 step으로 이동:', prevStepIndex - 1, '마지막 action:', prevStepActionsLength - 1);
          // stepIndex는 아래에서 업데이트
          return prevStepActionsLength - 1;
        } else {
          console.log('⚠️ 이미 첫 번째 단계입니다');
          return prevActionIndex;
        }
      });
      
      // stepIndex 업데이트 (action이 첫 번째이고 이전 step이 있을 때만)
      const currentStepData = recipe?.instructions?.[prevStepIndex];
      const actionsLength = currentStepData?.actions?.length || 1;
      
      if (currentActionIndex > 0) {
        return prevStepIndex; // stepIndex는 변경 안 함
      } else if (prevStepIndex > 0) {
        return prevStepIndex - 1; // 이전 step으로
      }
      
      return prevStepIndex;
    });
  }, [recipe, currentActionIndex]);

  // ===== Picovoice 음성 인식 관련 함수들 =====
  
  // 맥박 애니메이션
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Android 마이크 권한 요청
  const requestMicrophonePermission = async () => {
    if (Platform.OS !== 'android') {
      return true; // iOS는 자동으로 권한 요청됨
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: '마이크 권한 필요',
          message: '음성 명령을 인식하려면 마이크 권한이 필요합니다.',
          buttonNeutral: '나중에',
          buttonNegative: '거부',
          buttonPositive: '허용',
        }
      );
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('✅ 마이크 권한 허용됨');
        return true;
      } else {
        console.log('❌ 마이크 권한 거부됨');
        Alert.alert(
          '권한 필요',
          '음성 인식을 사용하려면 마이크 권한이 필요합니다.',
          [
            { 
              text: '음성 인식 끄기', 
              onPress: () => setIsVoiceEnabled(false)
            },
            { text: '확인' }
          ]
        );
        return false;
      }
    } catch (error) {
      console.error('권한 요청 오류:', error);
      return false;
    }
  };

  // 음성 명령 처리 (useCallback으로 최신 state 참조 보장)
  const processInference = useCallback((inference) => {
    if (!inference.isUnderstood) {
      console.log('🎤 명령어를 인식하지 못했습니다');
      return;
    }

    const { intent, slots } = inference;
    console.log('🗣️ 인식된 명령:', intent, slots);

    // Context 파일에서 반환되는 intent 이름에 맞게 처리
    // 한국어 intent 이름: "다음", "이전", "타이머", "중지" 등
    // 영어 intent 이름도 지원: 'next', 'previous', 'timer', 'stop'
    switch (intent) {
      case 'next':
      case '다음':
        console.log('▶️ 다음 단계로 이동 - processInference에서 호출');
        handleNext();
        console.log('✅ handleNext 호출 완료');
        Alert.alert('음성 명령', '다음 단계로 이동합니다', [{ text: '확인' }], { cancelable: true });
        break;
      
      case 'previous':
      case '이전':
        console.log('◀️ 이전 단계로 이동 - processInference에서 호출');
        handlePrev();
        console.log('✅ handlePrev 호출 완료');
        Alert.alert('음성 명령', '이전 단계로 이동합니다', [{ text: '확인' }], { cancelable: true });
        break;
      
      case 'timer':
      case '타이머':
        // slots는 { [key: string]: string } 형태 (API 문서 참고)
        // Context에서 정의한 slot 이름에 따라 다를 수 있음
        let minutes = 1;
        if (slots && slots.number) {
          // 숫자 문자열 매핑 (일, 이, 삼...)
          const numberMap = {
            '일': 1, '이': 2, '삼': 3, '사': 4, '오': 5,
            '육': 6, '칠': 7, '팔': 8, '구': 9, '십': 10
          };
          minutes = numberMap[slots.number] || parseInt(slots.number) || 1;
        } else if (slots && slots.minutes) {
          minutes = parseInt(slots.minutes) || 1;
        }
        console.log(`⏱️ 타이머 ${minutes}분 시작`);
        startTimer(minutes * 60);
        Alert.alert('음성 명령', `타이머 ${minutes}분 시작`, [{ text: '확인' }], { cancelable: true });
        break;
      
      case 'stop':
      case '중지':
      case '정지':
        console.log('⏹️ 타이머 중지');
        stopTimer();
        Alert.alert('음성 명령', '타이머를 중지했습니다', [{ text: '확인' }], { cancelable: true });
        break;
      
      default:
        console.log('❓ 알 수 없는 명령:', intent);
        console.log('💡 사용 가능한 명령: "다음", "이전", "타이머 3분", "중지"');
    }
  }, [currentStepIndex, currentActionIndex, currentStep, totalSteps, recipe, handleNext, handlePrev, startTimer, stopTimer]);

  // 타이머 시작
  const startTimer = (seconds) => {
    // 기존 타이머가 있으면 정리
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    
    setTimerSeconds(seconds);
    setTimerActive(true);
    
    timerInterval.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval.current);
          setTimerActive(false);
          Alert.alert('⏰ 타이머 종료', '설정한 시간이 끝났습니다!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 타이머 중지
  const stopTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    setTimerActive(false);
    setTimerSeconds(0);
  };

  // Rhino 초기화 및 관리 (공식 문서 기반)
  // 참고: https://picovoice.ai/docs/quick-start/rhino-react-native/
  useEffect(() => {
    let rhinoManager = null;

    const initRhino = async () => {
      if (!isVoiceEnabled) return;

      try {
        // Android 마이크 권한 요청
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) {
          setIsVoiceEnabled(false);
          return;
        }

        // Access Key 확인
        const accessKey = process.env.EXPO_PUBLIC_PICOVOICE_ACCESS_KEY;
        
        if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
          Alert.alert(
            'Picovoice Access Key 필요',
            '.env 파일에 EXPO_PUBLIC_PICOVOICE_ACCESS_KEY를 설정해주세요.\n\n자세한 내용은 PICOVOICE_SETUP.md를 참고하세요.',
            [
              { 
                text: '음성 인식 끄기', 
                onPress: () => setIsVoiceEnabled(false)
              },
              { text: '확인' }
            ]
          );
          setIsVoiceEnabled(false);
          return;
        }

        // RhinoManager 모듈 확인
        if (!RhinoManager || typeof RhinoManager.create !== 'function') {
          throw new Error('RhinoManager 모듈을 사용할 수 없습니다. Development Build가 필요합니다.');
        }

        // Context 파일 경로
        // Android: ./android/app/src/main/assets/rhino_ko_android_v3_0_0.rhn
        // iOS: 번들 리소스로 포함
        const contextFileName = 'rhino_ko_android_v3_0_0.rhn';
        let contextPath;
        if (Platform.OS === 'android') {
          // Android: assets 폴더의 파일은 번들에 포함되어 있음
          contextPath = contextFileName;
        } else {
          // iOS: 번들 리소스 경로
          contextPath = contextFileName;
        }
        
        // 한국어 모델 파일 경로 (Context와 같은 언어여야 함)
        // 한국어 모델 파일: ko_android_v3_0_0.pv 또는 ko.pv
        // Picovoice GitHub에서 다운로드: https://github.com/Picovoice/rhino/tree/master/lib/common
        const modelFileName = 'ko_android_v3_0_0.pv'; // 또는 'ko.pv'
        let modelPath;
        if (Platform.OS === 'android') {
          modelPath = modelFileName;
        } else {
          modelPath = modelFileName;
        }
        
        console.log('📁 Context 파일 경로:', contextPath);
        console.log('📁 Model 파일 경로:', modelPath);

        // inference callback 정의
        // 참고: RhinoManager는 inference 발생 시 자동으로 오디오 캡처를 중지함
        // 계속 인식하려면 다시 process()를 호출해야 함
        const inferenceCallback = async (inference) => {
          console.log('🎤 Rhino inference:', inference);
          if (inference.isUnderstood) {
            processInference(inference);
          } else {
            console.log('🎤 명령어를 인식하지 못했습니다');
          }
          
          // inference 처리 후 다시 음성 인식 시작 (계속 인식하기 위해)
          try {
            if (rhinoManagerRef.current && isVoiceEnabled) {
              // 약간의 지연 후 다시 시작 (명령 처리 시간 확보)
              setTimeout(async () => {
                try {
                  await rhinoManagerRef.current.process();
                  console.log('🔄 음성 인식 재시작');
                } catch (error) {
                  console.error('❌ 음성 인식 재시작 실패:', error);
                  setIsListening(false);
                }
              }, 500);
            }
          } catch (error) {
            console.error('❌ inference callback 오류:', error);
          }
        };

        // process error callback 정의 (선택적)
        const processErrorCallback = (error) => {
          console.error('❌ Rhino 처리 오류:', error);
          Alert.alert(
            '음성 인식 오류',
            error.message || '오디오 처리 중 오류가 발생했습니다.',
            [{ text: '확인' }]
          );
        };

        // RhinoManager 생성 (공식 문서 방식)
        // RhinoManager.create(accessKey, contextPath, inferenceCallback, processErrorCallback?, modelPath?)
        // modelPath를 지정하여 한국어 모델 사용 (Context와 같은 언어여야 함)
        // 참고: https://picovoice.ai/docs/api/rhino-react-native/
        rhinoManager = await RhinoManager.create(
          accessKey,
          contextPath,
          inferenceCallback,
          processErrorCallback,
          modelPath  // 한국어 모델 파일 경로
        );

        console.log('✅ RhinoManager 생성 완료');

        rhinoManagerRef.current = rhinoManager;

        // RhinoManager.process() 호출하면 자동으로 오디오 캡처 시작
        await rhinoManager.process();

        setIsListening(true);
        startPulseAnimation();
        console.log('🎤 Picovoice 음성 인식 시작');

      } catch (error) {
        console.error('❌ Rhino 초기화 실패:', error);
        console.error('❌ 오류 타입:', error.constructor?.name);
        console.error('❌ 오류 상세:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        console.error('❌ 오류 스택:', error.stack);
        
        let errorMessage = error.message || error.toString() || '알 수 없는 오류가 발생했습니다.';
        
        // RhinoError 특별 처리
        if (error.name === 'RhinoError' || error.message?.includes('RhinoError')) {
          if (error.message?.includes('context') || error.message?.includes('file') || error.message?.includes('path')) {
            errorMessage = 'Context 파일 오류:\n\n' + 
              '1. android/app/src/main/assets/rhino_context.rhn 파일이 있는지 확인\n' +
              '2. Picovoice Console에서 학습된 파일인지 확인\n' +
              '3. 파일이 번들에 포함되었는지 확인';
          } else if (error.message?.includes('access') || error.message?.includes('key') || error.message?.includes('invalid')) {
            errorMessage = 'Access Key 오류:\n\n' +
              '1. .env 파일에 EXPO_PUBLIC_PICOVOICE_ACCESS_KEY가 설정되었는지 확인\n' +
              '2. Access Key가 올바른지 확인\n' +
              '3. 앱을 재시작 (npx expo start --clear)';
          } else {
            errorMessage = 'Rhino 오류:\n\n' + error.message + '\n\n' +
              'Picovoice Console과 공식 문서를 확인하세요:\n' +
              'https://picovoice.ai/docs/quick-start/rhino-react-native/';
          }
        } else if (error.message?.includes('null') || error.message?.includes('create') || error.message?.includes('undefined')) {
          errorMessage = '네이티브 모듈 로드 실패:\n\n' +
            '1. Development Build로 빌드했는지 확인\n' +
            '2. npx expo run:android 또는 eas build --profile development\n' +
            '3. Expo Go로는 작동하지 않습니다';
        } else if (error.message?.includes('permission') || error.message?.includes('Permission')) {
          errorMessage = '마이크 권한 오류:\n\n' +
            '설정 > 앱 > CookIt > 권한 > 마이크 허용';
        }

        Alert.alert(
          '음성 인식 초기화 실패',
          errorMessage,
          [
            { 
              text: '음성 인식 끄기', 
              onPress: () => setIsVoiceEnabled(false)
            },
            { text: '확인' }
          ]
        );
      }
    };

    initRhino();

    // Cleanup
    return () => {
      if (rhinoManager) {
        try {
          rhinoManager.delete().catch(console.error);
        } catch (e) {
          console.error('RhinoManager cleanup 오류:', e);
        }
      }
      stopTimer();
    };
  }, [isVoiceEnabled]);

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
      {/* 음성 인식 상태 표시 (항상 표시, 토글 버튼) */}
      <View style={styles.voiceStatusContainer}>
        {isVoiceEnabled ? (
          <>
            <Animated.View style={[
              styles.voiceIndicator,
              { transform: [{ scale: pulseAnim }] },
              isListening && styles.voiceIndicatorActive
            ]}>
              <Text style={styles.voiceIcon}>🎤</Text>
            </Animated.View>
            <View style={styles.voiceTextContainer}>
              <Text style={styles.voiceStatusText}>
                {isListening ? '음성 인식 중...' : '음성 인식 대기 중'}
              </Text>
              <Text style={styles.voiceHintText}>
                "다음", "이전", "타이머 3분" 등의 명령을 말씀하세요
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.voiceTextContainer}>
            <Text style={styles.voiceStatusText}>음성 인식 꺼짐</Text>
            <Text style={styles.voiceHintText}>
              버튼을 눌러 음성 인식을 활성화하세요
            </Text>
          </View>
        )}
        <TouchableOpacity 
          style={[
            styles.voiceToggleButton,
            isVoiceEnabled ? styles.voiceToggleButtonOn : styles.voiceToggleButtonOff
          ]}
          onPress={() => setIsVoiceEnabled(!isVoiceEnabled)}
        >
          <Text style={styles.voiceToggleText}>
            {isVoiceEnabled ? 'OFF' : 'ON'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 타이머 표시 */}
      {timerActive && (
        <View style={styles.timerContainer}>
          <Text style={styles.timerIcon}>⏱️</Text>
          <Text style={styles.timerText}>
            {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
          </Text>
          <TouchableOpacity 
            style={styles.timerStopButton}
            onPress={stopTimer}
          >
            <Text style={styles.timerStopText}>중지</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      {/* YouTube 영상 (단계별 타임스탬프 적용) */}
      <View style={styles.videoWrapper}>
        {videoId && !videoError ? (
          <WebView
            key={`video-${videoId}-${currentStepIndex}-${currentActionIndex}`}  // videoId와 step/action만으로 key 생성
            source={{ 
              html: getYouTubeHTML(
                videoId, 
                currentAction?.start_time,  // 현재 action 시작 시간
                getNextActionStartTime(),    // 다음 action 시작 시간 (구간반복용)
                true  // autoplay 활성화
              ),
              baseUrl: 'https://com.cookit.app' // Google 문서 요구사항: baseUrl 설정
            }}
            style={styles.video}
            allowsFullscreenVideo={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
            userAgent="Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
            onShouldStartLoadWithRequest={(request) => {
              console.log('🌐 요청 URL:', request.url);
              console.log('🔍 Referer 헤더:', request.headers?.Referer);
              // YouTube 관련 도메인 허용 (Google API 서비스 약관 준수)
              if (request.url.includes('youtube.com') || 
                  request.url.includes('googlevideo.com') ||
                  request.url.includes('googleadservices.com')) {
                return true;
              }
              return false;
            }}
            onNavigationStateChange={(navState) => {
              console.log('🧭 네비게이션 상태:', navState);
            }}
            onError={(error) => {
              console.error('❌ WebView 오류:', error);
              setVideoError(true);
            }}
            onLoadStart={() => {
              console.log(`🔄 YouTube 로딩 시작 (단계 ${currentStepIndex + 1}, 액션 ${currentActionIndex + 1})`);
              if (currentAction?.start_time) {
                console.log(`⏰ 영상 시작 시간: ${currentAction.start_time}`);
              }
              const nextActionTime = getNextActionStartTime();
              if (nextActionTime) {
                console.log(`⏹️ 구간반복 종료 시간: ${nextActionTime}`);
              } else {
                console.log(`📺 마지막 액션 - 구간반복 없음`);
              }
            }}
            onLoad={() => {
              console.log('✅ YouTube 로드 완료');
              setVideoError(false);
            }}
            onLoadEnd={() => {
              console.log('🎉 YouTube 렌더링 완료');
            }}
            renderLoading={() => (
              <View style={styles.webviewLoading}>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={styles.webviewLoadingText}>영상 로딩 중...</Text>
              </View>
            )}
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
            
            {/* 오류 발생 시 대체 버튼 */}
            {videoError && videoUrl && (
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
                      console.log('🔄 재시도');
                    }}
                  >
                    <Text style={styles.retryButtonText}>다시 시도</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.browserButton}
                    onPress={() => {
                      Linking.openURL(videoUrl);
                      console.log('🌐 브라우저에서 보기');
                    }}
                  >
                    <Text style={styles.browserButtonText}>브라우저에서 보기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
      
      {/* 레시피 제목 및 기본 정보 */}
      {recipe && (
        <View style={styles.recipeHeaderContainer}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          
          {/* 레시피 기본 정보 */}
          {(recipe.cook_time || recipe.prep_time || recipe.servings) && (
            <View style={styles.recipeInfo}>
              {recipe.prep_time && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoIcon}>⏱️</Text>
                  <Text style={styles.infoText}>준비: {recipe.prep_time}</Text>
                </View>
              )}
              {recipe.cook_time && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoIcon}>🔥</Text>
                  <Text style={styles.infoText}>조리: {recipe.cook_time}</Text>
                </View>
              )}
              {recipe.servings && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoIcon}>👥</Text>
                  <Text style={styles.infoText}>{recipe.servings}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}


      {/* 현재 액션 정보 */}
      <View style={styles.currentStepContainer}>
        {/* 현재 단계 제목 (주황색으로 강조) */}
        <View style={styles.stepTitleContainer}>
          <Text style={styles.stepTitleText}>Step {currentStepIndex + 1}</Text>
          <Text style={styles.currentStepTitle}>
            {currentStep?.title || currentStep?.instruction || '제목 없음'}
      </Text>
          <Text style={styles.actionCounter}>
            {currentActionIndex + 1}/{currentStep?.actions?.length || 1}
          </Text>
        </View>

        {/* 현재 액션 정보 */}
        {currentAction && (
          <View style={styles.currentActionContainer}>
            <Text style={styles.currentActionTitle}>{currentAction.action}</Text>
            <Text style={styles.currentActionDescription}>{currentAction.description}</Text>
            
            {/* 현재 액션에서 사용하는 재료들 */}
            {currentAction.ingredients && currentAction.ingredients.length > 0 && (
              <View style={styles.currentActionIngredients}>
                <Text style={styles.currentActionIngredientsLabel}>사용 재료:</Text>
                <View style={styles.currentActionIngredientsRow}>
                  {currentAction.ingredients.map((ingredient, index) => (
                    <View key={index} style={styles.currentActionIngredientTag}>
                      <Text style={styles.currentActionIngredientText}>
                        {ingredient.name} {ingredient.quantity}
          </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {/* 액션 시간 정보 */}
            {currentAction.start_time && (
              <View style={styles.actionTimeContainer}>
                <Text style={styles.actionTimeText}>
                  ⏰ 시작 시간: {currentAction.start_time}
        </Text>
              </View>
            )}
          </View>
        )}

        {/* 기존 형식 지원 (actions가 없는 경우) */}
        {!currentAction && (
          <View style={styles.stepDescriptionContainer}>
            <Text style={styles.stepDescription}>
          {recipe ? currentStep?.instruction || currentStep?.description || '설명 없음' : currentStep?.description}
        </Text>
          </View>
        )}
      </View>

      {/* 전체 단계 목록 */}
      <View style={styles.allStepsContainer}>
        <Text style={styles.allStepsTitle}>📋 전체 요리 과정</Text>
        <View style={styles.allStepsList}>
          {recipe?.instructions?.map((step, stepIndex) => (
            <TouchableOpacity 
              key={stepIndex} 
              style={[
                styles.allStepItem,
                stepIndex === currentStepIndex && styles.allStepItemActive
              ]}
              onPress={() => {
                setCurrentStepIndex(stepIndex);
                setCurrentActionIndex(0);
              }}
            >
              <View style={styles.allStepNumber}>
                <Text style={[
                  styles.allStepNumberText,
                  stepIndex === currentStepIndex && styles.allStepNumberTextActive
                ]}>
                  {step.step || stepIndex + 1}
            </Text>
              </View>
              <View style={styles.allStepContent}>
                <Text style={[
                  styles.allStepTitle,
                  stepIndex === currentStepIndex && styles.allStepTitleActive
                ]}>
                  {step.title || step.instruction || `단계 ${stepIndex + 1}`}
                </Text>
                <Text style={styles.allStepDescription}>
                  {step.instruction || step.description || '설명 없음'}
                </Text>
                {step.start_time && (
                  <Text style={styles.allStepTime}>⏰ {step.start_time}</Text>
                )}
              </View>
              {stepIndex === currentStepIndex && (
                <View style={styles.currentStepIndicator}>
                  <Text style={styles.currentStepIndicatorText}>
                    Action {currentActionIndex + 1}
            </Text>
          </View>
        )}
            </TouchableOpacity>
          )) || recipeSteps.map((step, stepIndex) => (
            <TouchableOpacity 
              key={stepIndex} 
              style={[
                styles.allStepItem,
                stepIndex === currentStepIndex && styles.allStepItemActive
              ]}
              onPress={() => {
                setCurrentStepIndex(stepIndex);
                setCurrentActionIndex(0);
              }}
            >
              <View style={styles.allStepNumber}>
                <Text style={[
                  styles.allStepNumberText,
                  stepIndex === currentStepIndex && styles.allStepNumberTextActive
                ]}>
                  {stepIndex + 1}
                </Text>
      </View>
              <View style={styles.allStepContent}>
                <Text style={[
                  styles.allStepTitle,
                  stepIndex === currentStepIndex && styles.allStepTitleActive
                ]}>
                  {step.title}
                </Text>
                <Text style={styles.allStepDescription}>
                  {step.description}
                </Text>
              </View>
              {stepIndex === currentStepIndex && (
                <View style={styles.currentStepIndicator}>
                  <Text style={styles.currentStepIndicatorText}>
                    Action {currentActionIndex + 1}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      </ScrollView>

      {/* 하단 네비게이션 버튼들 - 고정 */}
      <View style={styles.bottomButtonsContainer}>
      {/* 네비게이션 버튼 */}
      <View style={styles.navButtons}>
        <TouchableOpacity 
          onPress={handlePrev} 
            disabled={currentStepIndex === 0 && currentActionIndex === 0} 
            style={[styles.button, (currentStepIndex === 0 && currentActionIndex === 0) && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>← 이전</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            onPress={isLastStep() ? handleCompleteCooking : handleNext} 
            style={[
              styles.button, 
              isLastStep() ? styles.completeButton : styles.nextButton,
              (currentStepIndex === totalSteps - 1 && currentActionIndex === (currentStep?.actions?.length || 1) - 1) && styles.buttonDisabled
            ]}
          >
            <Text style={[styles.buttonText, isLastStep() && styles.completeButtonText]}>
              {isLastStep() ? '🎉 요리 완성!' : '다음 →'}
            </Text>
        </TouchableOpacity>
      </View>

      {/* 요약 보기 버튼 */}
      <View style={styles.summaryButtonContainer}>
        <TouchableOpacity 
          style={styles.summaryButton}
          onPress={() => {
            navigation.navigate('Summary', { 
              recipeId: recipeId,
              recipe: recipe 
            });
          }}
        >
          <Text style={styles.summaryButtonText}>📋 요약 보기</Text>
        </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Recipe;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
  },
  bottomButtonsContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
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
    marginBottom: 16,
    fontWeight: '600',
    color: '#333',
  },
  recipeHeaderContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeTitle: {
    fontSize: 20, // 24에서 20으로 줄임
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  recipeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  // 현재 단계 컨테이너
  currentStepContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentStepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  stepTitleContainer: {
    backgroundColor: '#FF6B35',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  currentActionContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  currentActionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  currentActionDescription: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 16,
  },
  currentActionIngredients: {
    marginBottom: 12,
  },
  currentActionIngredientsLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 8,
  },
  currentActionIngredientsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  currentActionIngredientTag: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d0e7ff',
  },
  currentActionIngredientText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
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
  currentStepIngredients: {
    marginBottom: 20,
  },
  currentStepIngredientsLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 12,
  },
  currentStepIngredientsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  currentStepIngredientTag: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  currentStepIngredientText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  currentStepActions: {
    marginBottom: 16,
  },
  currentStepActionsLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 12,
  },
  actionItem: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  actionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  actionIngredients: {
    marginBottom: 8,
  },
  actionIngredientsLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    fontWeight: '600',
  },
  actionIngredientsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  actionIngredientTag: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionIngredientText: {
    fontSize: 11,
    color: '#333',
    fontWeight: '500',
  },
  actionTimeContainer: {
    marginTop: 4,
  },
  actionTimeText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  stepDescriptionContainer: {
    marginTop: 16,
  },
  stepDescription: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  // 전체 단계 목록
  allStepsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  allStepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  allStepsList: {
    gap: 8,
  },
  allStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  allStepItemActive: {
    backgroundColor: '#fff3e0',
    borderColor: '#FF6B35',
    borderWidth: 2,
  },
  allStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  allStepNumberActive: {
    backgroundColor: '#FF6B35',
  },
  allStepNumberText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  allStepNumberTextActive: {
    color: '#fff',
  },
  allStepContent: {
    flex: 1,
  },
  allStepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  allStepTitleActive: {
    color: '#FF6B35',
  },
  allStepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  allStepTime: {
    fontSize: 12,
    color: '#FF6B35',
    marginTop: 4,
    fontWeight: '600',
  },
  currentStepIndicator: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentStepIndicatorText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
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
    marginBottom: 16,
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
  summaryButtonContainer: {
    alignItems: 'center',
  },
  summaryButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  summaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionCounter: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  completeButton: {
    backgroundColor: '#4CAF50', // 초록색
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  nextButton: {
    backgroundColor: '#FF6B35', // 기본 주황색
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // 음성 인식 관련 스타일
  voiceStatusContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  voiceIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  voiceIndicatorActive: {
    backgroundColor: '#FFE5D9',
  },
  voiceIcon: {
    fontSize: 20,
  },
  voiceTextContainer: {
    flex: 1,
  },
  voiceStatusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  voiceHintText: {
    fontSize: 11,
    color: '#666',
  },
  voiceToggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  voiceToggleButtonOn: {
    backgroundColor: '#FF6B35',
  },
  voiceToggleButtonOff: {
    backgroundColor: '#4CAF50',
  },
  voiceToggleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // 타이머 관련 스타일
  timerContainer: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timerIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  timerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 16,
    fontFamily: 'monospace',
  },
  timerStopButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timerStopText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
});