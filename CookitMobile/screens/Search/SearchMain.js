// 검색 창 - 최근 검색어, 추천 레시피 표시

import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import SearchInput from '../../components/SearchInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import recipeService from '../../services/recipeService';
import RecipeCard from '../../components/RecipeCard';
import { supabase } from '../../lib/supabase';

const SearchMain = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  
  const SEARCH_HISTORY_KEY = '@search_history';
  const MAX_HISTORY_COUNT = 10;

  useEffect(() => {
    loadSearchHistory();
    loadRecommendedRecipes();
  }, []);

  // 검색어 히스토리 관리
  const loadSearchHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) setSearchHistory(JSON.parse(stored));
    } catch (e) {
      console.log('검색 기록 로드 실패', e);
    }
  };

  const saveSearchHistory = async (items) => {
    try {
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(items));
      setSearchHistory(items);
    } catch (e) {
      console.log('검색 기록 저장 실패', e);
    }
  };

  const addSearchHistory = async (text) => {
    const t = (text || '').trim();
    if (!t) return;
    const filtered = searchHistory.filter(h => h !== t);
    const next = [t, ...filtered].slice(0, MAX_HISTORY_COUNT);
    await saveSearchHistory(next);
  };

  const deleteSearchItem = async (itemToDelete) => {
    const updated = searchHistory.filter(item => item !== itemToDelete);
    await saveSearchHistory(updated);
  };

  const clearAllSearchHistory = async () => {
    Alert.alert(
      "검색 기록 삭제",
      "최근 검색 기록을 모두 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          onPress: async () => {
            await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
            setSearchHistory([]);
          },
          style: "destructive"
        },
      ]
    );
  };


  // 추천 레시피 로드
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const { data } = supabase.storage.from('recipe-images').getPublicUrl(imagePath);
    return data.publicUrl;
  };

  const loadRecommendedRecipes = async () => {
    try {
      const res = await recipeService.getPublicRecipes({ page: 1, limit: 12 });
      const list = (res.recipes || []).map(r => ({
        ...r,
        id: r.id || r.recipe_id,
        recipe_id: r.recipe_id || r.id,
        thumbnail: getImageUrl(r.image_urls?.[0])
      }));
      setRecommendedRecipes(list);
    } catch (e) {
      console.log('추천 레시피 로드 실패', e);
    }
  };

  const searching = async () => {
    await addSearchHistory(query);
    navigation.navigate("SearchList", { query });
    setQuery('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <SearchInput
        value={query}
        onChange={setQuery}
        onClear={() => setQuery('')}
        onBack={() => navigation.goBack()}
        onSubmitEditing={searching}
      />
      
      <FlatList
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* 최근 검색어 */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.titleText}>최근 검색어</Text>
                {searchHistory.length > 0 && (
                  <TouchableOpacity onPress={clearAllSearchHistory}>
                    <Text style={styles.clearText}>전체삭제</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.historyWrap}>
                {searchHistory.length === 0 ? (
                  <Text style={styles.emptyText}>최근 검색어가 없습니다</Text>
                ) : (
                  searchHistory.map((h, index) => (
                    <View key={`search-${h}-${index}`} style={styles.chipContainer}>
                      <TouchableOpacity 
                        style={styles.chip} 
                        onPress={() => { 
                          setQuery(h); 
                          navigation.navigate('SearchList', { query: h }); 
                        }}
                      >
                        <Text style={styles.chipText}>{h}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.chipDelete}
                        onPress={() => deleteSearchItem(h)}
                      >
                        <Text style={styles.chipDeleteText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            </View>

            {/* 추천 레시피 */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.titleText}>바로 볼 수 있는 레시피</Text>
              </View>
            </View>
          </>
        }
        data={recommendedRecipes}
        keyExtractor={(item, index) => `recipe-${item.id || item.recipe_id}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.recipeCardWrap}>
            <RecipeCard
              recipe={item}
              onPress={() => navigation.navigate('Summary', { 
                recipeId: item.id || item.recipe_id, 
                recipe: item 
              })}
            />
          </View>
        )}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
      />
    </SafeAreaView>
  );
}


export default SearchMain;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  clearText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  historyWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    overflow: 'hidden',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    color: '#333',
    fontSize: 13,
  },
  chipDelete: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
  },
  chipDeleteText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    color: '#AAA',
    fontSize: 13,
    paddingVertical: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recipeCardWrap: {
    width: '48%',
  },
})