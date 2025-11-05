//메인 화면 - 리디자인 버전
import { StyleSheet, Text, View, TouchableOpacity, Platform, Image, ActivityIndicator, ScrollView, Dimensions, FlatList, RefreshControl } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '@shared/lib/supabase';
import recipeService from '@features/recipe/services/recipeService';
import RecipeCard from '@features/recipe/components/RecipeCard';
import { useAuth } from '@features/auth/contexts/AuthContext';

const { width } = Dimensions.get('window');

const HomeMain = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  
  // 4개 섹션 State
  const [personalizedRecipes, setPersonalizedRecipes] = useState([]);
  const [difficultyRecipes, setDifficultyRecipes] = useState([]);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [similarRecipes, setSimilarRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // 화면이 포커스를 받을 때마다 데이터 새로고침 (조회수 업데이트 반영)
  useFocusEffect(
    useCallback(() => {
      // Summary 화면에서 뒤로가기로 돌아왔을 때 조회수 업데이트 반영을 위해 데이터 새로고침
      const timer = setTimeout(() => {
        // 레시피 데이터가 이미 있으면 새로고침 (조회수 업데이트 반영)
        const hasRecipes = personalizedRecipes.length > 0 || difficultyRecipes.length > 0 || popularRecipes.length > 0 || similarRecipes.length > 0;
        if (hasRecipes) {
          console.log('🔄 홈 화면 포커스 - 레시피 데이터 새로고침 (조회수 업데이트 반영)');
          fetchAllRecipes();
        }
      }, 200); // 적절한 지연 시간으로 새로고침
      
      return () => clearTimeout(timer);
    }, []) // 빈 의존성 배열로 마운트/포커스 시에만 실행
  );

  const fetchAllRecipes = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // 🎯 1. 개인화 추천 (선호/비선호 재료 고려)
      const personalizedResponse = await recipeService.getRecommendedRecipes();
      console.log('✨ 개인화 추천:', personalizedResponse.total, '개');

      // 🎓 2. 난이도 기반 추천
      const difficultyResponse = await recipeService.getRecipesByDifficulty(6);
      console.log('🎓 난이도 기반:', difficultyResponse.total, '개');

      // 🔥 3. 실시간 인기 레시피
      const popularResponse = await recipeService.getPopularRecipes(3);
      console.log('🔥 인기 레시피:', popularResponse.total, '개');

      // 👨‍🍳 4. 유사 레시피 (완성한 요리 기반)
      const similarResponse = await recipeService.getSimilarToCookedRecipes(6);
      console.log('👨‍🍳 유사 레시피:', similarResponse.total, '개');

      // 데이터 변환
      const transformRecipe = (recipe) => ({
        id: recipe.id,
        recipe_id: recipe.id,
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
        // 조회수 및 통계 정보
        view_count: recipe.view_count || recipe.recipe_stats?.[0]?.view_count || recipe.recipe_stats?.view_count || 0,
        favorite_count: recipe.favorite_count || recipe.recipe_stats?.[0]?.favorite_count || recipe.recipe_stats?.favorite_count || 0,
        // 카테고리 정보
        category_name: recipe.category_name || recipe.recipe_categories?.name || recipe.category?.name,
        category: recipe.category_name || recipe.recipe_categories?.name || recipe.category?.name,
        recipe_categories: recipe.recipe_categories || recipe.category,
        // 좋아요 상태 정보
        recipe_likes: recipe.recipe_likes || [],
        user_relationship: recipe.user_relationship || [],
      });

      setPersonalizedRecipes((personalizedResponse.recipes || []).slice(0, 6).map(transformRecipe));
      setDifficultyRecipes((difficultyResponse.recipes || []).map(transformRecipe));
      setPopularRecipes((popularResponse.recipes || []).map(transformRecipe));
      setSimilarRecipes((similarResponse.recipes || []).map(transformRecipe));

    } catch (error) {
      console.error('레시피 로딩 실패:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Pull-to-Refresh 핸들러
  const onRefresh = useCallback(() => {
    console.log('🔄 Pull-to-Refresh 시작');
    fetchAllRecipes(true);
  }, []);

  // 즐겨찾기 토글 핸들러 (새로고침 없이 상태만 업데이트)
  const handleFavoriteToggle = async (recipeId, shouldFavorite) => {
    if (!user) return;
    
    try {
      if (shouldFavorite) {
        await recipeService.saveRecipe(recipeId, 'favorited');
      } else {
        await recipeService.removeRecipe(recipeId, 'favorited');
      }
      // 새로고침 없이 레시피 상태만 업데이트 (favorite_count도 함께 업데이트)
      const updateRecipeState = (recipes) => {
        return recipes.map(recipe => {
          if ((recipe.id || recipe.recipe_id) === recipeId) {
            return {
              ...recipe,
              recipe_likes: shouldFavorite ? [{ id: Date.now() }] : [],
              favorite_count: shouldFavorite 
                ? (recipe.favorite_count || 0) + 1 
                : Math.max(0, (recipe.favorite_count || 0) - 1)
            };
          }
          return recipe;
        });
      };
      
      setPersonalizedRecipes(prev => updateRecipeState(prev));
      setDifficultyRecipes(prev => updateRecipeState(prev));
      setPopularRecipes(prev => updateRecipeState(prev));
      setSimilarRecipes(prev => updateRecipeState(prev));
    } catch (error) {
      console.error('즐겨찾기 처리 오류:', error);
      throw error; // RecipeCard에서 에러 처리하도록 throw
    }
  };

  const handleRecipePress = (recipe) => {
    // Summary 화면으로 이동 (조회수 증가는 Summary에서 처리)
    navigation.navigate('Summary', { 
      recipeId: recipe.id, 
      recipe: recipe 
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Image source={require('@assets/app_logo.png')} style={styles.signature} />
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
        <Image source={require('@assets/app_logo.png')} style={styles.signature} />
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6B35']} // Android
            tintColor="#FF6B35" // iOS
          />
        }
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
              <RecipeCard
                key={item.id}
                recipe={item}
                onPress={handleRecipePress}
                onFavorite={handleFavoriteToggle}
                showActions={!!user}
                style={styles.horizontalCard}
              />
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
              <RecipeCard
                key={item.id}
                recipe={item}
                onPress={handleRecipePress}
                onFavorite={handleFavoriteToggle}
                showActions={!!user}
                style={styles.horizontalCard}
              />
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
                <Text style={styles.sectionSubtitle}>실시간 인기 순위</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('RecipeList', { ai_only: true })}>
              <Text style={styles.moreText}>더보기</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.rankingContainer}>
            {popularRecipes.slice(0, 3).map((item, index) => {
              const rank = index + 1;
              const isTopThree = rank <= 3;
              
              return (
                <TouchableOpacity
                key={item.id}
                  style={[
                    styles.rankingCard,
                    isTopThree && styles.rankingCardTopThree,
                    rank === 1 && styles.rankingCardFirst
                  ]}
                  onPress={() => handleRecipePress(item)}
                  activeOpacity={0.8}
                >
                  {/* 순위 배지 */}
                  <View style={[
                    styles.rankBadge,
                    rank === 1 && styles.rankBadgeFirst,
                    rank === 2 && styles.rankBadgeSecond,
                    rank === 3 && styles.rankBadgeThird
                  ]}>
                    {rank === 1 ? (
                      <Ionicons name="trophy" size={20} color="#FFD700" />
                    ) : rank === 2 ? (
                      <Ionicons name="medal" size={18} color="#C0C0C0" />
                    ) : rank === 3 ? (
                      <Ionicons name="medal" size={18} color="#CD7F32" />
                    ) : (
                      <Text style={[
                        styles.rankNumber,
                        isTopThree && styles.rankNumberTopThree
                      ]}>
                        {rank}
                      </Text>
                    )}
                  </View>

                  {/* 레시피 이미지 */}
                  <View style={styles.rankingImageContainer}>
                    {item.thumbnail ? (
                      <Image 
                        source={{ uri: item.thumbnail }} 
                        style={styles.rankingImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.rankingImagePlaceholder}>
                        <Ionicons name="restaurant" size={32} color="#ccc" />
                      </View>
                    )}
                    {/* 인기도 오버레이 */}
                    <View style={styles.popularityOverlay}>
                      <Ionicons name="flame" size={14} color="#FF6B35" />
                      <Text style={styles.popularityText}>
                        {item.view_count || 0}
                      </Text>
                    </View>
                  </View>

                  {/* 레시피 정보 */}
                  <View style={styles.rankingInfo}>
                    <Text style={[
                      styles.rankingTitle,
                      isTopThree && styles.rankingTitleTopThree
                    ]} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <View style={styles.rankingMeta}>
                      {item.category_name && (
                        <View style={styles.rankingCategory}>
                          <Text style={styles.rankingCategoryText}>
                            {item.category_name}
                          </Text>
                        </View>
                      )}
                      <View style={styles.rankingStats}>
                        <Ionicons name="eye-outline" size={12} color="#999" />
                        <Text style={styles.rankingStatsText}>
                          {item.view_count || 0}
                        </Text>
                        {item.favorite_count > 0 && (
                          <>
                            <Ionicons name="heart-outline" size={12} color="#999" style={{ marginLeft: 8 }} />
                            <Text style={styles.rankingStatsText}>
                              {item.favorite_count}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* 즐겨찾기 버튼 */}
                  {user && (
                    <TouchableOpacity
                      style={styles.rankingFavoriteButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        const isFavorited = item.recipe_likes && item.recipe_likes.length > 0;
                        handleFavoriteToggle(item.id, !isFavorited);
                      }}
                    >
                      <Ionicons
                        name={item.recipe_likes && item.recipe_likes.length > 0 ? "heart" : "heart-outline"}
                        size={20}
                        color={item.recipe_likes && item.recipe_likes.length > 0 ? "#FF6B35" : "#999"}
              />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
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
              <RecipeCard
                key={item.id}
                recipe={item}
                onPress={handleRecipePress}
                onFavorite={handleFavoriteToggle}
                showActions={!!user}
                style={styles.horizontalCard}
              />
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
  horizontalCard: {
    width: (width - 60) / 2, // 가로 스크롤용 카드 너비 (양쪽 여백 20px + 카드 간격 20px)
    marginRight: 12,
  },
  popularRecipesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  // 순위 스타일
  rankingContainer: {
    paddingHorizontal: 20,
  },
  rankingCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    position: 'relative',
  },
  rankingCardTopThree: {
    borderWidth: 2,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  rankingCardFirst: {
    borderColor: '#FFD700',
    backgroundColor: '#FFFBF0',
    shadowColor: '#FFD700',
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  rankBadgeFirst: {
    backgroundColor: '#FFF9E6',
    borderColor: '#FFD700',
  },
  rankBadgeSecond: {
    backgroundColor: '#F5F5F5',
    borderColor: '#C0C0C0',
  },
  rankBadgeThird: {
    backgroundColor: '#FFF8F0',
    borderColor: '#CD7F32',
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6C757D',
  },
  rankNumberTopThree: {
    fontSize: 20,
    color: '#212529',
  },
  rankingImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
    marginRight: 12,
    position: 'relative',
  },
  rankingImage: {
    width: '100%',
    height: '100%',
  },
  rankingImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  popularityOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  popularityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  rankingInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  rankingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 6,
    lineHeight: 20,
  },
  rankingTitleTopThree: {
    fontSize: 17,
    fontWeight: '800',
  },
  rankingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rankingCategory: {
    backgroundColor: '#FFF4E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rankingCategoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF6B35',
  },
  rankingStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rankingStatsText: {
    fontSize: 11,
    color: '#6C757D',
    fontWeight: '500',
  },
  rankingFavoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  
  // 미니 카드 스타일 (가로 스크롤용) - 더 이상 사용하지 않음
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
    marginBottom: 6,
    lineHeight: 18,
  },
  miniCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 3,
    marginBottom: 6,
  },
  miniCategoryText: {
    fontSize: 9,
    color: '#FF6B35',
    fontWeight: '600',
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
    marginBottom: 6,
  },
  largeCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E6',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 8,
  },
  largeCategoryText: {
    fontSize: 10,
    color: '#FF6B35',
    fontWeight: '600',
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

