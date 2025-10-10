// 요약한 내용을 보여주는 곳 TEXT로 정리
// 재료랑 필요한 양이 나와있는데 원한다면 재료 구매 탭 만들기도 가능(쿠팡으로 보내기)



import { ScrollView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 안드로이드 버튼 하단 보장
import ModalDelete from './modal/ModalDelete'

const Summary = () => {

  const insets = useSafeAreaInsets();
  const [showModal, setShowModal] = React.useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  
  // History.js에서 전달받은 레시피 데이터
  const receivedRecipe = route?.params?.recipe;
  const receivedRecipeId = route?.params?.recipeId;


  const handleDelete = () => {
    setShowModal(true);
  };

  const handleConfirm = () => {
    setShowModal(false);
    navigation.replace("HomeTab");
  };

  const handleCancel = () => {
    setShowModal(false);
  };
  const handleStart = () => {
    // History.js에서 전달받은 실제 레시피 데이터 사용
    if (receivedRecipe && receivedRecipeId) {
      navigation.replace("Recipe", { 
        recipeId: receivedRecipeId,
        recipe: receivedRecipe 
      });
    } else {
      // 더미 데이터 사용 (기존 Summary 화면에서 직접 접근한 경우)
      navigation.replace("Recipe", { 
        recipeId: "summary-demo-recipe",
        recipe: recipe 
      });
    }
  }


  const recipe = {
    title: '크림 파스타 만들기',
    time: '25분',
    level: '보통',
    servings: '2인분',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // 데모용 YouTube URL
    ingredients: [
      { name: '스파게티 면', amount: '200g' },
      { name: '생크림', amount: '150ml' },
      { name: '버터', amount: '2큰술' },
      // ... 더 추가 가능
    ],
    steps: [
      '마늘을 다져주세요',
      '팬에 버터를 녹이고 마늘을 볶아주세요',
      '생크림을 넣고 졸인 뒤 면과 함께 버무려주세요',
      // ... 더 추가 가능
    ],
    // Recipe.js에서 사용할 instructions 형식으로 변환
    instructions: [
      {
        step: 1,
        title: '마늘 다지기',
        instruction: '마늘을 다져주세요',
        start_time: '00:00:30',
        end_time: '00:01:30'
      },
      {
        step: 2,
        title: '팬에 볶기',
        instruction: '팬에 버터를 녹이고 마늘을 볶아주세요',
        start_time: '00:01:30',
        end_time: '00:03:00'
      },
      {
        step: 3,
        title: '생크림 추가',
        instruction: '생크림을 넣고 졸인 뒤 면과 함께 버무려주세요',
        start_time: '00:03:00',
        end_time: '00:05:00'
      }
    ]
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 15 : 0 }}>
      <View style={styles.container}>
        <Text style={styles.title}>레시피 요약</Text>
  <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
          {/* 실제 레시피 데이터가 있으면 사용, 없으면 더미 데이터 사용 */}
          <Text style={styles.recipeTitle}>
            {receivedRecipe?.title || recipe.title}
          </Text>

          <Text style={styles.sectionTitle}>재료</Text>
          {(receivedRecipe?.ingredients || recipe.ingredients).map((item, index) => (
            <Text key={index}>• {item.name} - {item.amount}</Text>
          ))}

          <Text style={styles.sectionTitle}>요리 과정</Text>
          {(receivedRecipe?.steps || recipe.steps).map((step, index) => (
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

        {showModal && (
          <ModalDelete
            visible={showModal}
            message="요약된 정보가 삭제됩니다. 계속하시겠습니까?"
            onCancel={handleCancel}
            onConfirm={handleConfirm}
          />)}
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

})