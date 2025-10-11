//메인 화면




import { StyleSheet, Text, View, TouchableOpacity, Platform, Image, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../../lib/supabase';
import recipeService from '../../services/recipeService';

const HomeMain = () => {
  const route = useRoute();
  const initialQuery = route.params?.query || '';
  const [query, setQuery] = React.useState(initialQuery);
  const navigation = useNavigation();
  const [recommendRecipes, setRecommendRecipes] = useState([]);
  const [hotRecipes, setHotRecipes] = useState([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      
      // 추천 레시피 (최신 2개)
      const recommendResponse = await recipeService.getPublicRecipes({
        page: 1,
        limit: 2
      });
      
      // 인기 레시피 (AI 생성 레시피 중 3개)
      const hotResponse = await recipeService.getPublicRecipes({
        page: 1,
        limit: 3,
        ai_only: true
      });

      // 데이터 변환
      const recommendData = recommendResponse.recipes?.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description || '맛있는 레시피입니다',
        thumbnail: recipe.image_urls?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'
      })) || [];

      const hotData = hotResponse.recipes?.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description || '맛있는 레시피입니다',
        thumbnail: recipe.image_urls?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'
      })) || [];

      setRecommendRecipes(recommendData);
      setHotRecipes(hotData);
      
    } catch (error) {
      console.error('레시피 로딩 실패:', error);
      
      // 오류 시 기본 데이터 사용
      const fallbackRecommend = [
        {
          id: 'fallback1',
          title: '계란말이',
          description: '든든한 한끼! 촉촉한 계란말이 레시피',
          thumbnail: 'https://via.placeholder.com/300x200?text=계란말이',
        },
        {
          id: 'fallback2',
          title: '비빔국수',
          description: '매콤새콤! 여름 입맛을 돋우는 국수 레시피',
          thumbnail: 'https://via.placeholder.com/300x200?text=비빔국수',
        },
      ];
      const fallbackHot = [
        {
          id: 'fallback3',
          title: '불고기',
          description: '달달하고 짭짤한 불고기 한 끼',
          thumbnail: 'https://via.placeholder.com/300x200?text=불고기',
        },
      ];
      
      setRecommendRecipes(fallbackRecommend);
      setHotRecipes(fallbackHot);
    } finally {
      setLoading(false);
    }
  };




  const RecipeCard = ({ recipe, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={() => onPress(recipe)} activeOpacity={0.8}>
      <Image source={{ uri: recipe.thumbnail }} style={styles.thumbnail} />
      <Text style={styles.title}>{recipe.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{recipe.description}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Image source={require('../../assets/signature.png')} style={styles.signature} />
          <Text style={styles.headerTitle}>Cookit</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="orange" />
          <Text style={styles.loadingText}>레시피를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Image source={require('../../assets/signature.png')} style={styles.signature} />
          <Text style={styles.headerTitle}>Cookit</Text>
        </View>
        <TouchableOpacity
          style={styles.inputButton}
          onPress={() => navigation.navigate('SearchMain')}
        >
          <Text style={styles.ButtonText}>🔍 검색어를 입력하세요</Text>
        </TouchableOpacity>

        <View style={styles.recommendBox}>
          <Text style={styles.homeText}>추천 요리</Text>
          <View style={styles.recommendRow}>
            {recommendRecipes.slice(0, 2).map((item, idx) => (
              <TouchableOpacity
                key={item.id}
                style={styles.miniCard}
                onPress={() => navigation.navigate('Summary', { 
                  recipeId: item.id, 
                  recipe: item 
                })}
                activeOpacity={0.8}
              >
                <Image source={{ uri: item.thumbnail }} style={styles.miniThumbnail} />
                <View style={styles.divider} />
                <Text style={styles.miniTitle}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.hotBox}>
          <Text style={styles.homeText}>오늘의 인기 요리</Text>
          {hotRecipes.map((item, idx) => (
            <RecipeCard
              key={item.id}
              recipe={item}
              onPress={(r) => navigation.navigate('Summary', { 
                recipeId: r.id, 
                recipe: r 
              })}
            />
          ))}
        </View>

      </SafeAreaView>
  )
}

export default HomeMain

const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingHorizontal: 24
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
  },
  signature: {
    width: 40,
    height: 40,
    marginRight: 8,
    resizeMode: 'contain'
  },
  headerTitle: {
    fontSize: 27,
    fontWeight: 'bold',
    color: 'orange',
  },

  profileButton: {
    position: 'absolute',
    right: 10,
    top: 5
  },

  inputButton: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',

  },
  ButtonText: {
    color: '#888',
    fontSize: 16,
    paddingHorizontal: 10
  },
  recommendBox: {
    paddingVertical: 20,
  },
  homeText: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  recommendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  miniCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    padding: 10,
  },
  miniThumbnail: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  miniTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',

  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  description: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginTop: 10,
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
})