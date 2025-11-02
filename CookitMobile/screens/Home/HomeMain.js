//메인 화면




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
  const initialQuery = route.params?.query || '';
  const [query, setQuery] = React.useState(initialQuery);
  const navigation = useNavigation();
  const [recommendRecipes, setRecommendRecipes] = useState([]);
  const [hotRecipes, setHotRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Supabase Storage에서 이미지 URL 생성
  const getImageUrl = (imagePath) => {
    console.log('🔍 이미지 경로 확인:', imagePath);
    
    if (!imagePath) {
      console.log('❌ 이미지 경로 없음, 로컬 기본 이미지 사용');
      return null; // null을 반환해서 기본 이미지 컴포넌트 사용
    }
    
    // 이미 전체 URL인 경우
    if (imagePath.startsWith('http')) {
      console.log('✅ 전체 URL 사용:', imagePath);
      return imagePath;
    }
    
    // Supabase Storage 경로인 경우
    if (imagePath.startsWith('recipes/')) {
      const { data } = supabase.storage.from('recipe-images').getPublicUrl(imagePath);
      console.log('📁 Supabase Storage URL 생성:', data.publicUrl);
      return data.publicUrl;
    }
    
    // 다른 경로인 경우도 시도해보기
    console.log('🔄 다른 경로로 시도:', imagePath);
    const { data } = supabase.storage.from('recipe-images').getPublicUrl(imagePath);
    console.log('📁 생성된 URL:', data.publicUrl);
    return data.publicUrl;
  };



  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      
      // 추천 레시피 (최신 4개)
      const recommendResponse = await recipeService.getPublicRecipes({
        page: 1,
        limit: 4
      });
      
      // 인기 레시피 (AI 생성 레시피 중 6개)
      const hotResponse = await recipeService.getPublicRecipes({
        page: 1,
        limit: 6,
        ai_only: true
      });

      // 데이터 변환 - 더 많은 정보 포함
      const recommendData = recommendResponse.recipes?.map(recipe => {
        console.log('📋 추천 레시피 데이터:', {
          id: recipe.id,
          title: recipe.title,
          image_urls: recipe.image_urls
        });
        
        return {
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
          created_at: recipe.created_at
        };
      }) || [];

      const hotData = hotResponse.recipes?.map(recipe => {
        console.log('🔥 인기 레시피 데이터:', {
          id: recipe.id,
          title: recipe.title,
          image_urls: recipe.image_urls
        });
        
        return {
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
          created_at: recipe.created_at
        };
      }) || [];

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
          thumbnail: getImageUrl(null),
        },
        {
          id: 'fallback2',
          title: '비빔국수',
          description: '매콤새콤! 여름 입맛을 돋우는 국수 레시피',
          thumbnail: getImageUrl(null),
        },
      ];
      const fallbackHot = [
        {
          id: 'fallback3',
          title: '불고기',
          description: '달달하고 짭짤한 불고기 한 끼',
          thumbnail: getImageUrl(null),
        },
      ];
      
      setRecommendRecipes(fallbackRecommend);
      setHotRecipes(fallbackHot);
    } finally {
      setLoading(false);
    }
  };




  const RecipeCard = ({ recipe, onPress }) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    return (
      <TouchableOpacity style={styles.card} onPress={() => onPress(recipe)} activeOpacity={0.8}>
        <View style={styles.imageContainer}>
          {recipe.thumbnail ? (
            <Image 
              source={{ uri: recipe.thumbnail }} 
              style={styles.thumbnail}
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="restaurant-outline" size={60} color="#ccc" />
              <Text style={styles.imagePlaceholderText}>이미지 없음</Text>
            </View>
          )}
          {imageLoading && (
            <View style={styles.imageLoadingOverlay}>
              <ActivityIndicator size="small" color="#FF6B35" />
            </View>
          )}
          {imageError && (
            <View style={styles.imageErrorOverlay}>
              <Ionicons name="image-outline" size={40} color="#ccc" />
              <Text style={styles.imageErrorText}>이미지 없음</Text>
            </View>
          )}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.description} numberOfLines={2}>{recipe.description}</Text>
          
          {/* 레시피 정보 */}
          <View style={styles.recipeInfo}>
            {(recipe.prep_time || recipe.cook_time) && (
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={14} color="#FF6B35" />
                <Text style={styles.infoText}>
                  {recipe.prep_time && `${recipe.prep_time}분`}
                  {recipe.prep_time && recipe.cook_time && ' + '}
                  {recipe.cook_time && `${recipe.cook_time}분`}
                </Text>
              </View>
            )}
            {recipe.servings && (
              <View style={styles.infoItem}>
                <Ionicons name="people-outline" size={14} color="#FF6B35" />
                <Text style={styles.infoText}>{recipe.servings}인분</Text>
              </View>
            )}
            {recipe.difficulty_level && (
              <View style={styles.infoItem}>
                <Ionicons name="star-outline" size={14} color="#FF6B35" />
                <Text style={styles.infoText}>
                  {recipe.difficulty_level === 'easy' ? '쉬움' : 
                   recipe.difficulty_level === 'medium' ? '보통' : '어려움'}
                </Text>
              </View>
            )}
          </View>

          {/* AI 생성 표시 */}
          {recipe.ai_generated && (
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={12} color="#fff" />
              <Text style={styles.aiText}>AI 생성</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
          style={styles.inputButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search" size={20} color="#888" />
          <Text style={styles.ButtonText}>검색어를 입력하세요</Text>
        </TouchableOpacity>

        {/* 추천 요리 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 추천 요리</Text>
            <TouchableOpacity onPress={() => navigation.navigate('RecipeList')}>
              <Text style={styles.moreText}>더보기</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {recommendRecipes.map((item, idx) => (
              <TouchableOpacity
                key={item.id}
                style={styles.miniCard}
                onPress={() => navigation.navigate('Summary', { 
                  recipeId: item.id, 
                  recipe: item 
                })}
                activeOpacity={0.8}
              >
                <View style={styles.miniImageContainer}>
                  {item.thumbnail ? (
                    <Image 
                      source={{ uri: item.thumbnail }} 
                      style={styles.miniThumbnail}
                      onError={(error) => {
                        console.log('❌ 미니 이미지 로드 에러:', error.nativeEvent.error);
                        console.log('🔗 시도한 URL:', item.thumbnail);
                      }}
                    />
                  ) : (
                    <View style={styles.miniPlaceholder}>
                      <Ionicons name="restaurant-outline" size={40} color="#ccc" />
                      <Text style={styles.miniPlaceholderText}>이미지 없음</Text>
                    </View>
                  )}
                </View>
                <View style={styles.miniCardContent}>
                  <Text style={styles.miniTitle} numberOfLines={2}>{item.title}</Text>
                  <View style={styles.miniInfo}>
                    {(item.prep_time || item.cook_time) && (
                      <Text style={styles.miniInfoText}>
                        {item.prep_time && `${item.prep_time}분`}
                        {item.prep_time && item.cook_time && '+'}
                        {item.cook_time && `${item.cook_time}분`}
                      </Text>
                    )}
                    {item.servings && (
                      <Text style={styles.miniInfoText}>{item.servings}인분</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 인기 요리 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⭐ AI 인기 요리</Text>
            <TouchableOpacity onPress={() => navigation.navigate('RecipeList', { ai_only: true })}>
              <Text style={styles.moreText}>더보기</Text>
            </TouchableOpacity>
          </View>
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
      </ScrollView>
    </SafeAreaView>
  )
}

export default HomeMain

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
  settingsButton: {
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
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 24,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  ButtonText: {
    color: '#888',
    fontSize: 16,
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  moreText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingHorizontal: 20,
  },
  miniCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  miniPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniPlaceholderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
  },
  miniThumbnail: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  miniCardContent: {
    padding: 12,
  },
  miniTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  miniInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniInfoText: {
    fontSize: 12,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageErrorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageErrorText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
  },
  cardContent: {
    padding: 16,
    position: 'relative',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  recipeInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  aiBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
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
})