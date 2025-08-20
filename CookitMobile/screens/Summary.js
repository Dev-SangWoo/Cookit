// 요약한 내용을 보여주는 곳 TEXT로 정리
// 재료랑 필요한 양이 나와있는데 원한다면 재료 구매 탭 만들기도 가능(쿠팡으로 보내기)



import { ScrollView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 안드로이드 버튼 하단 보장
import ModalDelete from './modal/ModalDelete'

const Summary = () => {

  const insets = useSafeAreaInsets();
  const [showModal, setShowModal] = React.useState(false);
  const navigation = useNavigation();


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
    navigation.replace("Recipe")
  }


  const recipe = {
    title: '크림 파스타 만들기',
    time: '25분',
    level: '보통',
    servings: '2인분',
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
    ]
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 15 : 0 }}>
      <View style={styles.container}>
        <Text style={styles.title}>레시피 요약</Text>
  <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>

          <Text style={styles.sectionTitle}>재료</Text>
          {recipe.ingredients.map((item, index) => (
            <Text key={index}>• {item.name} - {item.amount}</Text>
          ))}

          <Text style={styles.sectionTitle}>요리 과정</Text>
          {recipe.steps.map((step, index) => (
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