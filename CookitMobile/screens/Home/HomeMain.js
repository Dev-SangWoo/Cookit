//메인 화면 - 리디자인 버전
import { StyleSheet, Text, View, TouchableOpacity, Platform, Image, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../../lib/supabase';
import recipeService from '../../services/recipeService';

const { width } = Dimensions.get('window');

const HomeMain = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  // 4개 섹션 State
  const [personalizedRecipes, setPersonalizedRecipes] = useState([]);
  const [difficultyRecipes, setDifficultyRecipes] = useState([]);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [similarRecipes, setSimilarRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Supabase Storage에서 이미지 URL 생성
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    
    if (imagePath.startsWith('recipes/')) {
      const { data } = supabase.storage.from('recipe-images').getPublicUrl(imagePath);
      return data.publicUrl;
    }
    
    const { data } = supabase.storage.from('recipe-images').getPublicUrl(imagePath);
    return data.publicUrl;
  };

  useEffect(() => {
    fetchAllRecipes();
  }, []);

  const fetchAllRecipes = async () => {
    try {
      setLoading(true);
      
      // 🎯 1. 개인화 추천 (선호/비선호 재료 고려)
      const personalizedResponse = await recipeService.getRecommendedRecipes();
      console.log('✨ 개인화 추천:', personalizedResponse.total, '개');

      // 🎓 2. 난이도 기반 추천
      const difficultyResponse = await recipeService.getRecipesByDifficulty(6);
      console.log('🎓 난이도 기반:', difficultyResponse.total, '개');

      // 🔥 3. 실시간 인기 레시피
      const popularResponse = await recipeService.getPopularRecipes(4);
      console.log('🔥 인기 레시피:', popularResponse.total, '개');

      // 👨‍🍳 4. 유사 레시피 (완성한 요리 기반)
      const similarResponse = await recipeService.getSimilarToCookedRecipes(6);
      console.log('👨‍🍳 유사 레시피:', similarResponse.total, '개');

      // 데이터 변환
      const transformRecipe = (recipe) => ({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description || '맛있는 레시피입니다',
        thumbnail: getImageUrl(recipe.image_urls?.[0]),
        prep_time: recipe.prep_time,
        cook_time: recipe.cook_time,
        servings: recipe.servings,
        difficulty_level: recipe.difficulty_level,
        tags: recipe.tags || [],
        ai_generated: recipe.ai_generated,
        source_url: recipe.source_url,
        video_url: recipe.video_url,
        created_at: recipe.created_at,
      });

      setPersonalizedRecipes((personalizedResponse.recipes || []).slice(0, 6).map(transformRecipe));
      setDifficultyRecipes((difficultyResponse.recipes || []).map(transformRecipe));
      setPopularRecipes((popularResponse.recipes || []).map(transformRecipe));
      setSimilarRecipes((similarResponse.recipes || []).map(transformRecipe));

    } catch (error) {
      console.error('레시피 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 미니 카드 컴포넌트 (가로 스크롤용)
  const MiniCard = ({ recipe, onPress }) => (
    <TouchableOpacity
      style={styles.miniCard}
      onPress={() => onPress(recipe)}
      activeOpacity={0.8}
    >
      <View style={styles.miniImageContainer}>
        {recipe.thumbnail ? (
          <Image 
            source={{ uri: recipe.thumbnail }} 
            style={styles.miniThumbnail}
          />
        ) : (
          <View style={styles.miniPlaceholder}>
            <Ionicons name="restaurant-outline" size={40} color="#ccc" />
          </View>
        )}
      </View>
      <View style={styles.miniCardContent}>
        <Text style={styles.miniTitle} numberOfLines={2}>{recipe.title}</Text>
        <View style={styles.miniInfo}>
          {(recipe.prep_time || recipe.cook_time) && (
            <View style={styles.miniInfoItem}>
              <Ionicons name="time-outline" size={12} color="#FF6B35" />
              <Text style={styles.miniInfoText}>
                {recipe.prep_time && `${recipe.prep_time}`}
                {recipe.prep_time && recipe.cook_time && '+'}
                {recipe.cook_time && `${recipe.cook_time}분`}
              </Text>
            </View>
          )}
          {recipe.difficulty_level && (
            <View style={styles.miniInfoItem}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.miniInfoText}>
                {recipe.difficulty_level === 'easy' ? '쉬움' : 
                 recipe.difficulty_level === 'medium' ? '보통' : '어려움'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // 대형 카드 컴포넌트 (세로 나열용)
  const LargeCard = ({ recipe, onPress }) => (
    <TouchableOpacity
      style={styles.largeCard}
      onPress={() => onPress(recipe)}
      activeOpacity={0.8}
    >
      <View style={styles.largeImageContainer}>
        {recipe.thumbnail ? (
          <Image 
            source={{ uri: recipe.thumbnail }} 
            style={styles.largeThumbnail}
          />
        ) : (
          <View style={styles.largePlaceholder}>
            <Ionicons name="restaurant-outline" size={60} color="#ccc" />
          </View>
        )}
        {recipe.ai_generated && (
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={12} color="#fff" />
            <Text style={styles.aiText}>AI</Text>
          </View>
        )}
      </View>
      <View style={styles.largeCardContent}>
        <Text style={styles.largeTitle}>{recipe.title}</Text>
        <Text style={styles.largeDescription} numberOfLines={2}>
          {recipe.description}
        </Text>
        <View style={styles.largeInfo}>
          {(recipe.prep_time || recipe.cook_time) && (
            <View style={styles.largeInfoItem}>
              <Ionicons name="time-outline" size={16} color="#FF6B35" />
              <Text style={styles.largeInfoText}>
                {(recipe.prep_time || 0) + (recipe.cook_time || 0)}분
              </Text>
            </View>
          )}
          {recipe.servings && (
            <View style={styles.largeInfoItem}>
              <Ionicons name="people-outline" size={16} color="#FF6B35" />
              <Text style={styles.largeInfoText}>{recipe.servings}인분</Text>
            </View>
          )}
          {recipe.difficulty_level && (
            <View style={styles.largeInfoItem}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.largeInfoText}>
                {recipe.difficulty_level === 'easy' ? '쉬움' : 
                 recipe.difficulty_level === 'medium' ? '보통' : '어려움'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleRecipePress = (recipe) => {
    navigation.navigate('Summary', { 
      recipeId: recipe.id, 
      recipe: recipe 
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Image source={require('../../assets/signature.png')} style={styles.signature} />
          <Text style={styles.headerTitle}>Cookit</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>맞춤 레시피를 준비 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Image source={require('../../assets/signature.png')} style={styles.signature} />
        <Text style={styles.headerTitle}>Cookit</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('AnalysisHistory')}
          >
            <Ionicons name="analytics-outline" size={24} color="#FF6B35" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle" size={24} color="#FF6B35" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 검색 버튼 */}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search" size={20} color="#888" />
          <Text style={styles.searchText}>레시피 검색</Text>
        </TouchableOpacity>

        {/* 1️⃣ 추천 요리 (선호 기반) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionEmoji}>🎯</Text>
              <View>
                <Text style={styles.sectionTitle}>당신을 위한 추천</Text>
                <Text style={styles.sectionSubtitle}>선호도 기반 맞춤 레시피</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('RecipeList')}>
              <Text style={styles.moreText}>더보기</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {personalizedRecipes.map((item) => (
              <MiniCard key={item.id} recipe={item} onPress={handleRecipePress} />
            ))}
          </ScrollView>
        </View>

        {/* 2️⃣ 난이도 기반 추천 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionEmoji}>🎓</Text>
              <View>
                <Text style={styles.sectionTitle}>당신의 레벨에 맞춰요</Text>
                <Text style={styles.sectionSubtitle}>실력에 딱 맞는 난이도</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('RecipeList')}>
              <Text style={styles.moreText}>더보기</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {difficultyRecipes.map((item) => (
              <MiniCard key={item.id} recipe={item} onPress={handleRecipePress} />
            ))}
          </ScrollView>
        </View>

        {/* 3️⃣ 실시간 인기 레시피 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionEmoji}>🔥</Text>
              <View>
                <Text style={styles.sectionTitle}>지금 핫한 레시피</Text>
                <Text style={styles.sectionSubtitle}>가장 많이 조회된 레시피</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('RecipeList', { ai_only: true })}>
              <Text style={styles.moreText}>더보기</Text>
            </TouchableOpacity>
          </View>
          {popularRecipes.map((item) => (
            <LargeCard key={item.id} recipe={item} onPress={handleRecipePress} />
          ))}
        </View>

        {/* 4️⃣ 또 만들고 싶어요! */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionEmoji}>👨‍🍳</Text>
              <View>
                <Text style={styles.sectionTitle}>또 만들고 싶어요!</Text>
                <Text style={styles.sectionSubtitle}>비슷한 맛의 새로운 레시피</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('RecipeList')}>
              <Text style={styles.moreText}>더보기</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {similarRecipes.map((item) => (
              <MiniCard key={item.id} recipe={item} onPress={handleRecipePress} />
            ))}
          </ScrollView>
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeMain;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  signature: {
    width: 40,
    height: 40,
    marginRight: 8,
    resizeMode: 'contain'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B35',
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 26,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchText: {
    color: '#888',
    fontSize: 16,
    marginLeft: 12,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionEmoji: {
    fontSize: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  moreText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingHorizontal: 20,
  },
  
  // 미니 카드 스타일 (가로 스크롤용)
  miniCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  miniImageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  miniThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  miniPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  miniCardContent: {
    padding: 12,
  },
  miniTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 18,
  },
  miniInfo: {
    flexDirection: 'column',
    gap: 4,
  },
  miniInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniInfoText: {
    fontSize: 11,
    color: '#666',
  },
  
  // 대형 카드 스타일 (세로 나열용)
  largeCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  largeImageContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  largeThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  largePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  aiBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 2,
  },
  aiText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: 'bold',
  },
  largeCardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  largeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  largeDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 8,
  },
  largeInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  largeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  largeInfoText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
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
  bottomSpacer: {
    height: 20,
  },
});
