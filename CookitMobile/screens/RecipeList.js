import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import RecipeCard from '../components/RecipeCard';
import recipeService from '../services/recipeService';
import { useAuth } from '../contexts/AuthContext';

const RecipeList = ({ 
  route: { params = {} } 
}) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const { 
    type = 'public', // 'public', 'my', 'saved', 'favorited'
    title = '레시피 목록',
    category,
    difficulty 
  } = params;

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // 레시피 목록 로드
  const loadRecipes = async (pageNum = 1, isRefresh = false) => {
    try {
      if (pageNum === 1) {
        isRefresh ? setRefreshing(true) : setLoading(true);
      } else {
        setLoadingMore(true);
      }

      let response;
      
      if (type === 'public') {
        response = await recipeService.getPublicRecipes({
          page: pageNum,
          limit: 10,
          category,
          difficulty,
          sort: 'latest'
        });
      } else {
        // 내 레시피들 (my, saved, favorited)
        response = await recipeService.getMyRecipes({
          type: type === 'my' ? 'all' : type,
          page: pageNum,
          limit: 10
        });
      }

      const newRecipes = response.recipes || [];
      
      if (pageNum === 1) {
        setRecipes(newRecipes);
      } else {
        setRecipes(prev => [...prev, ...newRecipes]);
      }

      setHasMore(newRecipes.length === 10); // 10개 미만이면 더 이상 없음
      setPage(pageNum);

    } catch (error) {
      console.error('레시피 로드 오류:', error);
      Alert.alert('오류', error.message || '레시피를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // 화면 포커스 시 새로고침
  useFocusEffect(
    useCallback(() => {
      loadRecipes(1);
    }, [type, category, difficulty])
  );

  // 새로고침
  const onRefresh = () => {
    loadRecipes(1, true);
  };

  // 더 불러오기
  const loadMore = () => {
    if (hasMore && !loadingMore) {
      loadRecipes(page + 1);
    }
  };

  // 레시피 카드 터치
  const handleRecipePress = (recipe) => {
    const recipeId = recipe.id || recipe.recipe_id;
    console.log('📍 RecipeList에서 전달할 ID:', recipeId);
    
    navigation.navigate('Recipe', { 
      recipeId: recipeId,
      recipe: recipe 
    });
  };

  // 즐겨찾기 토글
  const handleFavoriteToggle = async (recipeId, shouldFavorite) => {
    if (!user) {
      Alert.alert('로그인 필요', '즐겨찾기 기능을 사용하려면 로그인해주세요.');
      return;
    }

    try {
      if (shouldFavorite) {
        await recipeService.saveRecipe(recipeId, 'favorited');
      } else {
        await recipeService.removeRecipe(recipeId, 'favorited');
      }
      
      // 목록 새로고침
      loadRecipes(1);
    } catch (error) {
      Alert.alert('오류', error.message || '즐겨찾기 처리 중 오류가 발생했습니다.');
    }
  };

  // 저장 토글
  const handleSaveToggle = async (recipeId, shouldSave) => {
    if (!user) {
      Alert.alert('로그인 필요', '저장 기능을 사용하려면 로그인해주세요.');
      return;
    }

    try {
      if (shouldSave) {
        await recipeService.saveRecipe(recipeId, 'saved');
      } else {
        await recipeService.removeRecipe(recipeId, 'saved');
      }
      
      // 목록 새로고침
      loadRecipes(1);
    } catch (error) {
      Alert.alert('오류', error.message || '저장 처리 중 오류가 발생했습니다.');
    }
  };

  // 빈 상태 렌더링
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="restaurant-outline" size={64} color="#CCC" />
      <Text style={styles.emptyTitle}>레시피가 없습니다</Text>
      <Text style={styles.emptySubtitle}>
        {type === 'public' 
          ? '아직 등록된 레시피가 없어요'
          : type === 'saved'
          ? '저장한 레시피가 없어요'
          : type === 'favorited'
          ? '즐겨찾기한 레시피가 없어요'
          : '생성한 레시피가 없어요'
        }
      </Text>
    </View>
  );

  // 푸터 렌더링 (로딩 더보기)
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color="#FF6B6B" />
        <Text style={styles.loadingMoreText}>더 불러오는 중...</Text>
      </View>
    );
  };

  // 헤더 렌더링
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>{title}</Text>
      
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="search-outline" size={24} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="filter-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>레시피를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <FlatList
        data={recipes}
        keyExtractor={(item) => `recipe-${item.recipe_id}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#FF6B6B']}
            tintColor="#FF6B6B"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        renderItem={({ item, index }) => (
          <RecipeCard
            recipe={item}
            onPress={handleRecipePress}
            onFavorite={handleFavoriteToggle}
            onSave={handleSaveToggle}
            showActions={user !== null}
            style={{
              marginLeft: index % 2 === 0 ? 0 : 8,
              marginRight: index % 2 === 0 ? 8 : 0,
            }}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerAction: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  loadingMore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default RecipeList;
