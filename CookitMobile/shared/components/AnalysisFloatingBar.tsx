import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Animated, PanResponder } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAnalysis } from '@features/recipe/contexts/AnalysisContext';

export default function AnalysisFloatingBar() {
  const navigation = useNavigation();
  const { current, clear } = useAnalysis();
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // 스와이프 제스처 핸들러 (항상 동일한 훅 순서를 유지하기 위해 early return 이전에 선언)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 가로 스와이프 확실할 때만 활성화
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_, gestureState) => {
        // 좌우로 살짝 이동하며 투명도 조절
        translateX.setValue(gestureState.dx);
        const ratio = Math.max(-1, Math.min(0, gestureState.dx / -300));
        opacity.setValue(1 - Math.abs(ratio));
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > 80) {
          // 좌/우 어느 방향이든 80px 이상 스와이프하면 닫기
          const toValue = gestureState.dx > 0 ? 400 : -400;
          Animated.parallel([
            Animated.timing(translateX, {
              toValue,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => clear());
        } else {
          // 원위치로 복귀
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.spring(opacity, {
              toValue: 1,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  if (!current || current.status === 'idle') return null;

  const isCompleted = current.status === 'completed' && current.recipe;

  // panResponder는 위에서 미리 생성됨

  const onPress = () => {
    if (isCompleted) {
      const recipeId = current.recipe.id || current.recipe.recipe_id;
      if (recipeId) {
        console.log('✅ 플로팅 바 - 분석 완료, 레시피로 이동:', { recipeId });
        (navigation as any).navigate('Summary', { recipeId, recipe: current.recipe });
        clear();
      } else {
        console.warn('⚠️ 플로팅 바 - recipeId 없음');
      }
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Animated.View 
        style={[
          styles.bar,
          {
            transform: [{ translateX }],
            opacity,
          },
        ]}
        {...panResponder.panHandlers}
      >
        {current.thumbnail ? (
          <Image source={{ uri: current.thumbnail }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, { backgroundColor: '#333' }]} />
        )}
        <View style={styles.info}>
          <Text numberOfLines={1} style={styles.title}>{current.title || '영상 분석 중'}</Text>
          {isCompleted ? (
            <Text style={styles.statusDone}>분석 완료! 눌러서 보기</Text>
          ) : (
            <View style={styles.progressRow}>
              <ActivityIndicator size="small" color="#FF6B35" />
              <Text style={styles.statusText}>분석 중... {Math.round(current.progress)}%</Text>
            </View>
          )}
        </View>
        {isCompleted ? (
          <TouchableOpacity onPress={onPress} style={styles.actionBtn}>
            <Text style={styles.actionText}>열기</Text>
          </TouchableOpacity>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    width: '92%',
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
  },
  info: {
    flex: 1,
    marginHorizontal: 10,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    color: '#ddd',
    fontSize: 12,
    marginLeft: 8,
  },
  statusDone: {
    color: '#9BEF8A',
    fontSize: 12,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
  },
});


