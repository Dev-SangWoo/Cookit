// 검색 창
// 간단하게 만들었지만 최근 검색 기록을 넣는다던가 
// 추천 메뉴들을 아래에 보여주는 방법도 있을듯


import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native'
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
  const [history, setHistory] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const HISTORY_KEY = '@search_history';

  useEffect(() => {
    loadHistory();
    loadRecipes();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch (e) {
      console.log('검색 기록 로드 실패', e);
    }
  };

  const saveHistory = async (items) => {
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(items));
      setHistory(items);
    } catch (e) {
      console.log('검색 기록 저장 실패', e);
    }
  };

  const addHistory = async (text) => {
    const t = (text || '').trim();
    if (!t) return;
    const filtered = history.filter(h => h !== t);
    const next = [t, ...filtered].slice(0, 10);
    await saveHistory(next);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const { data } = supabase.storage.from('recipe-images').getPublicUrl(imagePath);
    return data.publicUrl;
  };

  const loadRecipes = async () => {
    try {
      const res = await recipeService.getPublicRecipes({ page: 1, limit: 12 });
      const list = (res.recipes || []).map(r => ({
        ...r,
        id: r.id || r.recipe_id,
        recipe_id: r.recipe_id || r.id,
        thumbnail: getImageUrl(r.image_urls?.[0])
      }));
      setRecipes(list);
    } catch (e) {
      console.log('레시피 로드 실패', e);
    }
  };

  const searching = async () => {
    await addHistory(query);
    navigation.navigate("SearchList", { query });
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
      <View style={styles.body}>
        <View style={styles.sectionHeader}>
          <Text style={styles.titleText}>최근 검색어</Text>
          {history.length > 0 ? (
            <TouchableOpacity onPress={() => saveHistory([])}>
              <Text style={styles.clearText}>전체삭제</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.historyWrap}>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>최근 검색어가 없습니다</Text>
          ) : (
            history.map((h) => (
              <TouchableOpacity key={h} style={styles.chip} onPress={() => { setQuery(h); navigation.navigate('SearchList', { query: h }); }}>
                <Text style={styles.chipText}>{h}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.titleText}>바로 볼 수 있는 레시피</Text>
        </View>
        <FlatList
          data={recipes}
          keyExtractor={(item, index) => `${item.id || item.recipe_id}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.cardWrapHorizontal}>
              <RecipeCard
                recipe={item}
                onPress={() => navigation.navigate('Summary', { recipeId: item.id || item.recipe_id, recipe: item })}
              />
            </View>
          )}
          showsHorizontalScrollIndicator={false}
          horizontal
          contentContainerStyle={styles.listContentHorizontal}
        />
      </View>
    </SafeAreaView>
  );
}


export default SearchMain;

const styles = StyleSheet.create({
  headerText: {
    fontSize: 20,
    paddingBottom: 20,
  },
  goBack: {
    position: 'absolute',
    right: 0,
    top: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 14,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
  },
  body: {
    flex: 1,
    paddingTop: 8,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333'
  },
  clearText: {
    fontSize: 12,
    color: '#999',
  },
  historyWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  chipText: {
    color: '#333',
    fontSize: 13,
  },
  emptyText: {
    color: '#AAA',
    fontSize: 13,
    paddingVertical: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  cardWrap: {
    marginBottom: 12,
  },
  listContentHorizontal: {
    paddingVertical: 12,
    paddingRight: 8,
  },
  cardWrapHorizontal: {
    width: 260,
    marginRight: 12,
  },
})