// 요약한 내용을 보여주는 곳 TEXT로 정리
// 재료랑 필요한 양이 나와있는데 원한다면 재료 구매 탭 만들기도 가능(쿠팡으로 보내기)



import { ScrollView, Platform, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 안드로이드 버튼 하단 보장
import { supabase } from '../lib/supabase'

const Summary = () => {

  const insets = useSafeAreaInsets();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();
  
  // History.js에서 전달받은 레시피 ID
  const receivedRecipeId = route?.params?.recipeId;

  // 레시피 데이터 가져오기
  useEffect(() => {
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
          console.log('✅ Summary 레시피 데이터 로드 완료:', data.title);
        }
      } catch (error) {
        console.error('❌ 레시피 로딩 예외:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [receivedRecipeId]);

  const handleDelete = () => {
    navigation.replace("HomeTab");
  };
  const handleStart = () => {
    // recipeId가 있으면 해당 ID로 Recipe 화면으로 이동
    if (receivedRecipeId) {
      navigation.replace("Recipe", { 
        screen: 'RecipeMain',
        params: { 
          recipeId: receivedRecipeId
        }
      });
    } else {
      // Summary 화면에서 직접 접근한 경우 - 실제 레시피 ID 사용
      // 가장 최근 레시피 ID 사용 (데모용)
      const demoRecipeId = "73928ef2-12d2-4d17-9e51-f1dcccfaf878"; // 백종원 초간단 참치마요덮밥
      navigation.replace("Recipe", { 
        screen: 'RecipeMain',
        params: { 
          recipeId: demoRecipeId
        }
      });
    }
  }


  // 더미 데이터 (recipeId가 없을 때 사용)
  const dummyRecipe = {
    title: '크림 파스타 만들기',
    time: '25분',
    level: '보통',
    servings: '2인분',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    ingredients: [
      { name: '스파게티 면', amount: '200g' },
      { name: '생크림', amount: '150ml' },
      { name: '버터', amount: '2큰술' },
    ],
    steps: [
      '마늘을 다져주세요',
      '팬에 버터를 녹이고 마늘을 볶아주세요',
      '생크림을 넣고 졸인 뒤 면과 함께 버무려주세요',
    ],
  };

  // 로딩 상태
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 15 : 0 }}>
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffcc80" />
            <Text style={styles.loadingText}>레시피를 불러오는 중...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 표시할 레시피 데이터 결정
  const displayRecipe = recipe || dummyRecipe;

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 15 : 0 }}>
      <View style={styles.container}>
        <Text style={styles.title}>레시피 요약</Text>
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
          <Text style={styles.recipeTitle}>
            {displayRecipe.title}
          </Text>

          {/* 레시피 정보 표시 */}
          {(displayRecipe.cook_time || displayRecipe.prep_time || displayRecipe.servings) && (
            <View style={styles.recipeInfo}>
              {displayRecipe.cook_time && (
                <Text style={styles.infoText}>조리시간: {displayRecipe.cook_time}</Text>
              )}
              {displayRecipe.prep_time && (
                <Text style={styles.infoText}>준비시간: {displayRecipe.prep_time}</Text>
              )}
              {displayRecipe.servings && (
                <Text style={styles.infoText}>인분: {displayRecipe.servings}</Text>
              )}
            </View>
          )}

          <Text style={styles.sectionTitle}>재료</Text>
          {displayRecipe.ingredients?.map((item, index) => (
            <Text key={index}>• {item.name} - {item.quantity || item.amount} {item.unit || ''}</Text>
          ))}

          <Text style={styles.sectionTitle}>요리 과정</Text>
          {displayRecipe.instructions?.map((step, index) => (
            <Text key={index}>{index + 1}. {step.instruction || step.title || step}</Text>
          )) || displayRecipe.steps?.map((step, index) => (
            <Text key={index}>{index + 1}. {step}</Text>
          ))}
        </ScrollView>
<View style={[styles.Buttoncontainer, { paddingBottom: Math.min(insets.bottom, 10) }]}>
          <TouchableOpacity style={styles.buttonHome} onPress={handleDelete}>
            <Text
              style={styles.homeText}
              
            >홈으로</Text>
          </TouchableOpacity>

          <TouchableOpacity 
          style={styles.buttonStart}
          onPress={handleStart}>
            <Text style={styles.startText}>요리 시작하기</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  )
}

export default Summary

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    position: 'relative',
    backgroundColor: 'white'
  },
  recipeTitle: {
    fontSize: 100,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 108,
    fontWeight: '600',
    marginTop: 16,
  },
  Buttoncontainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  buttonHome: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'orange',
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeText: {
    color: 'orange',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonStart: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'orange',
    borderWidth: 1,
    borderColor: 'orange',
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recipeInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
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
})