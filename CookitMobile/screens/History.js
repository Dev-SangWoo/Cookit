import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Platform, 
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import RecipeCard from '../components/RecipeCard';
import recipeService from '../services/recipeService';

const History = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [viewedRecipes, setViewedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');

  // 조회한 레시피 목록 불러오기
  const loadViewedRecipes = async (isRefresh = false) => {
    if (!user) {
      setViewedRecipes([]);
      setLoading(false);
      return;
    }

    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      
      // 사용자가 조회한 레시피 활동 로그를 기반으로 레시피 가져오기
      // 실제로는 백엔드에 별도 API가 필요하지만, 여기서는 저장한 레시피로 대신합니다
      const response = await recipeService.getMyRecipes({
        type: 'all', // 모든 관계 타입 (저장한 것들도 조회한 것으로 간주)
        page: 1,
        limit: 50
      });

      if (response.recipes) {
        // 최근 조회 순으로 정렬
        const sortedRecipes = response.recipes.sort((a, b) => 
          new Date(b.user_relationship?.saved_at || b.created_at) - 
          new Date(a.user_relationship?.saved_at || a.created_at)
        );
        setViewedRecipes(sortedRecipes);
      }

    } catch (error) {
      console.error('조회 기록 로드 오류:', error);
      Alert.alert('오류', '조회 기록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 화면 포커스 시 데이터 로드
  useFocusEffect(
    useCallback(() => {
      loadViewedRecipes();
    }, [user])
  );

  // 새로고침
  const onRefresh = () => {
    loadViewedRecipes(true);
  };

  // 검색 필터링
  const filteredRecipes = viewedRecipes.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  // 레시피 카드 터치
  const handleRecipePress = (recipe) => {
    navigation.navigate('Recipe', { 
      recipeId: recipe.recipe_id,
      recipe: recipe 
    });
  };

  // 즐겨찾기 토글
  const handleFavoriteToggle = async (recipeId, shouldFavorite) => {
    if (!user) return;

    try {
      if (shouldFavorite) {
        await recipeService.saveRecipe(recipeId, 'favorited');
      } else {
        await recipeService.removeRecipe(recipeId, 'favorited');
      }
      
      // 목록 새로고침
      loadViewedRecipes();
    } catch (error) {
      Alert.alert('오류', error.message || '즐겨찾기 처리 중 오류가 발생했습니다.');
    }
  };

  // 저장 토글
  const handleSaveToggle = async (recipeId, shouldSave) => {
    if (!user) return;

    try {
      if (shouldSave) {
        await recipeService.saveRecipe(recipeId, 'saved');
      } else {
        await recipeService.removeRecipe(recipeId, 'saved');
      }
      
      // 목록 새로고침
      loadViewedRecipes();
    } catch (error) {
      Alert.alert('오류', error.message || '저장 처리 중 오류가 발생했습니다.');
    }
  };

  // 빈 상태 렌더링
  const renderEmpty = () => {
    if (!user) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={64} color="#CCC" />
          <Text style={styles.emptyTitle}>로그인이 필요합니다</Text>
          <Text style={styles.emptySubtitle}>
            조회 기록을 보려면 로그인해주세요
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="time-outline" size={64} color="#CCC" />
        <Text style={styles.emptyTitle}>조회 기록이 없습니다</Text>
        <Text style={styles.emptySubtitle}>
          레시피를 조회하면 여기에 기록이 남아요
        </Text>
      </View>
    );
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>조회 기록</Text>
          <Text style={styles.headerSubtitle}>
            {user ? `최근 본 레시피 ${viewedRecipes.length}개` : '로그인 후 이용 가능'}
          </Text>
        </View>

        {/* 검색 바 */}
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            placeholder="레시피 제목 검색"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
              <Ionicons name="close" size={18} color="#333" />
            </TouchableOpacity>
          )}
        </View>

        {/* 내용 */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.loadingText}>조회 기록을 불러오는 중...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredRecipes}
            keyExtractor={(item) => `history-${item.recipe_id}`}
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
            ListEmptyComponent={renderEmpty}
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
        )}
      </View>
    </SafeAreaView>
  );
};

export default History;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === 'android' ? 15 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchWrapper: {
    position: 'relative',
    marginHorizontal: 20,
    marginVertical: 16,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  searchInput: {
    height: 44,
    borderColor: '#E9ECEF',
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 44,
    paddingRight: 44,
    backgroundColor: '#FFF',
    fontSize: 16,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -9 }],
    padding: 4,
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
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
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
    paddingHorizontal: 40,
  },
});


// 지금까지 요약해서 요리했던 레시피들을 다시 볼 수 있음
// 장점은 다시 요약될 때까지 기다릴 필요가 없으므로
// 시간절약이 돼서 좋은 방향으로 생각
// 사용자가 요리 요약한 데이터를 서버에서 가지고 있으면 될 것 같은데..
// 정확히는 모르겠다
// 구성은 SearchList 파일처럼 보여주면 될 것 같음