//메인 화면

// 고려해야할 부분 
// 오늘의 레시피, 인기 레시피는 하드코딩 되어있다. 데이터 넉넉하게 2~30개정도 뽑아서
// 음식 이름, 사진, 간단한 설명 이렇게 데이터를 저장해두고 로테이션 돌리면 주기적으로 바뀌게끔
// 만들 수 있지 않을까? 그래서 그것을 누르면 그 제목으로 검색이 돼서(검색 과정 스킵)
// SearchList.js로 가도록 만들면 좋을 것 같다. 
// 지금은 요리로 해놔서 바로 검색이 되게끔 하면 되는데\
// 추천 레시피, 인기 레시피로 할거라면 이미 다 돌려서 데이터를 가지고 있어야 함 
// 누르면 검색으로 가는게 아니라 요약된 레시피 화면으로 가게 만들어야 할듯
//




import { StyleSheet, Text, View, TouchableOpacity, Platform, Image, ActivityIndicator, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../contexts/AuthContext';
import recipeService from '../services/recipeService';



const Home = () => {
  const route = useRoute();
  const initialQuery = route.params?.query || '';
  const [query, setQuery] = React.useState(initialQuery);
  const navigation = useNavigation();
  const [recommendRecipes, setRecommendRecipes] = useState([]);
  const [hotRecipes, setHotRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // 공개 레시피에서 랜덤으로 추천 요리 2개 가져오기
      const recommendResponse = await recipeService.getPublicRecipes({ 
        page: 1, 
        limit: 6, 
        sort: 'latest' 
      });
      
      // 인기 요리 (즐겨찾기 많은 순)
      const hotResponse = await recipeService.getPublicRecipes({ 
        page: 1, 
        limit: 3, 
        sort: 'popular' 
      });

      if (recommendResponse.recipes && recommendResponse.recipes.length > 0) {
        // 랜덤으로 2개 선택
        const shuffled = [...recommendResponse.recipes].sort(() => Math.random() - 0.5);
        setRecommendRecipes(shuffled.slice(0, 2));
      } else {
        // 기본값 유지
        setRecommendRecipes([
          {
            recipe_id: 'sample1',
            title: '계란말이',
            description: '든든한 한끼! 촉촉한 계란말이 레시피',
            image_url: null,
          },
          {
            recipe_id: 'sample2',
            title: '비빔국수',
            description: '매콤새콤! 여름 입맛을 돋우는 국수 레시피',
            image_url: null,
          },
        ]);
      }

      if (hotResponse.recipes && hotResponse.recipes.length > 0) {
        setHotRecipes(hotResponse.recipes.slice(0, 1));
      } else {
        // 기본값 유지
        setHotRecipes([
          {
            recipe_id: 'sample3',
            title: '불고기',
            description: '달달하고 짭짤한 불고기 한 끼',
            image_url: null,
          },
        ]);
      }

    } catch (error) {
      console.error('홈 데이터 로드 오류:', error);
      // 오류 시 기본 데이터 사용
      setRecommendRecipes([
        {
          recipe_id: 'sample1',
          title: '계란말이',
          description: '든든한 한끼! 촉촉한 계란말이 레시피',
          image_url: null,
        },
        {
          recipe_id: 'sample2',
          title: '비빔국수',
          description: '매콤새콤! 여름 입맛을 돋우는 국수 레시피',
          image_url: null,
        },
      ]);
      setHotRecipes([
        {
          recipe_id: 'sample3',
          title: '불고기',
          description: '달달하고 짭짤한 불고기 한 끼',
          image_url: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };



  // 서버에서 받아올거면 이렇게 쓰라는데 
  //   const fetchRecipes = async () => {
  //     const recommend = await fetch('#').then(res => res.json());
  //     const hot = await fetch('#').then(res => res.json());
  //     setRecommendRecipes(recommend);
  //     setHotRecipes(hot);
  //   };
  //   fetchRecipes();
  // }, []);
  // 서버에서 title, description, thumbnail 받도록하면 될듯

  const handleRecipePress = (recipe) => {
    if (recipe.recipe_id && !recipe.recipe_id.toString().startsWith('sample')) {
      // DB 레시피인 경우 상세 화면으로
      navigation.navigate('Recipe', { 
        recipeId: recipe.recipe_id,
        recipe: recipe 
      });
    } else {
      // 샘플 레시피인 경우 검색으로 
      navigation.navigate('SearchList', { query: recipe.title });
    }
  };

  const RecipeCard = ({ recipe, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={() => onPress(recipe)} activeOpacity={0.8}>
      <Image 
        source={{ uri: recipe.image_url || recipe.thumbnail }} 
        style={styles.thumbnail}
        defaultSource={require('../assets/icon.png')}
      />
      <Text style={styles.title}>{recipe.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{recipe.description}</Text>
      {recipe.cooking_time && (
        <View style={styles.cardMeta}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.cardMetaText}>{recipe.cooking_time}분</Text>
          {recipe.servings && (
            <>
              <Ionicons name="people-outline" size={14} color="#666" style={{ marginLeft: 10 }} />
              <Text style={styles.cardMetaText}>{recipe.servings}인분</Text>
            </>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 15 : 0 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={require('../assets/signature.png')} style={styles.signature} />
            <Text style={styles.headerTitle}>Cookit</Text>
          </View>
          <View style={styles.userSection}>
            <Text style={styles.welcomeText}>안녕하세요!</Text>
            <Text style={styles.userName}>{user?.name || user?.email || '사용자'}님</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.inputButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.ButtonText}>🔍 검색어를 입력하세요</Text>
        </TouchableOpacity>

        <View style={styles.recommendBox}>
          <Text style={styles.homeText}>추천 요리</Text>
          <View style={styles.recommendRow}>
            {recommendRecipes.slice(0, 2).map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.miniCard}
                onPress={() => handleRecipePress(item)}
                activeOpacity={0.8}
              >
                <Image 
                  source={{ uri: item.image_url || item.thumbnail }} 
                  style={styles.miniThumbnail}
                  defaultSource={require('../assets/icon.png')}
                />
                <View style={styles.divider} />
                <Text style={styles.miniTitle}>{item.title}</Text>
                {item.cooking_time && (
                  <Text style={styles.miniMeta}>{item.cooking_time}분</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.hotBox}>
          <Text style={styles.homeText}>오늘의 인기 요리</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B6B" />
              <Text style={styles.loadingText}>레시피를 불러오는 중...</Text>
            </View>
          ) : (
            hotRecipes.map((item, idx) => (
              <RecipeCard
                key={idx}
                recipe={item}
                onPress={handleRecipePress}
              />
            ))
          )}
        </View>

        {/* DB 레시피 섹션 */}
        <View style={styles.dbRecipeSection}>
          <Text style={styles.homeText}>레시피 모음</Text>
          <View style={styles.recipeButtonsContainer}>
            <TouchableOpacity 
              style={[styles.recipeButton, { backgroundColor: '#FF6B6B' }]}
              onPress={() => navigation.navigate('RecipeList', { 
                type: 'public', 
                title: '모든 레시피' 
              })}
            >
              <Ionicons name="restaurant-outline" size={24} color="#FFF" />
              <Text style={styles.recipeButtonText}>모든 레시피</Text>
            </TouchableOpacity>

            {user && (
              <>
                <TouchableOpacity 
                  style={[styles.recipeButton, { backgroundColor: '#4ECDC4' }]}
                  onPress={() => navigation.navigate('RecipeList', { 
                    type: 'saved', 
                    title: '저장한 레시피' 
                  })}
                >
                  <Ionicons name="bookmark-outline" size={24} color="#FFF" />
                  <Text style={styles.recipeButtonText}>저장한 레시피</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.recipeButton, { backgroundColor: '#FFD93D' }]}
                  onPress={() => navigation.navigate('RecipeList', { 
                    type: 'favorited', 
                    title: '즐겨찾기' 
                  })}
                >
                  <Ionicons name="heart-outline" size={24} color="#FFF" />
                  <Text style={styles.recipeButtonText}>즐겨찾기</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

      </View>
    </SafeAreaView>
  )
}

export default Home

const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingHorizontal: 24
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
  userSection: {
    alignItems: 'flex-end',
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
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
  dbRecipeSection: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  recipeButtonsContainer: {
    marginTop: 16,
    gap: 12,
  },
  recipeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
  },
  recipeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  cardMetaText: {
    fontSize: 12,
    color: '#666',
  },
  miniMeta: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
})