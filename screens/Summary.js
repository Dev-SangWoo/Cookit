// 요약한 내용을 보여주는 곳 TEXT로 정리
// 재료랑 필요한 양이 나와있는데 원한다면 재료 구매 탭 만들기도 가능(쿠팡으로 보내기)



import { ScrollView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 안드로이드 버튼 하단 보장
import ModalDelete from './modal/ModalDelete'
import { supabase } from '../lib/supabase';

const Summary = () => {

  const insets = useSafeAreaInsets();
  const [showModal, setShowModal] = React.useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const recipeId = route.params?.recipeId;

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
    navigation.replace("Recipe", { recipeId })
  }


  const [recipe, setRecipe] = React.useState(null);

  React.useEffect(() => {
    const fetchRecipe = async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId) // ← 전달받은 recipeId 기준
        .single();

      if (data) setRecipe(data);

    };

    fetchRecipe();
  }, [recipeId]);


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 15 : 0 }}>
      <View style={styles.container}>
        <Text style={styles.title}>레시피 요약</Text>
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
          {!recipe ? (
            <Text style={{ textAlign: 'center', marginTop: 40 }}>레시피를 불러오는 중입니다...</Text>
          ) : (
            <>
              <Text style={styles.recipeTitle}>{recipe.title}</Text>


              <Text style={styles.sectionTitle}>재료</Text>
              {recipe?.ingredients?.map((item, index) => (
                <Text key={index}>
                  • {item.name} {item.quantity} ({item.unit})
                </Text>
              ))}

              <Text style={styles.sectionTitle}>요리 과정</Text>
              {recipe?.instructions?.map((step, index) => (
                <View key={index} style={{ marginBottom: 12 }}>
                  <Text style={{ fontWeight: 'bold' }}>{index + 1}. {step.title}</Text>
                  <Text>{step.instruction}</Text>
                  <Text style={{ fontStyle: 'italic', color: 'gray' }}>⏱ {step.time}</Text>
                  <Text style={{ color: '#888' }}>💡 {step.tips}</Text>
                </View>
              ))}
            </>
          )}
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
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 24,
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