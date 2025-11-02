// 검색 내용을 보여주는 부분

import React, { useEffect, useState, useCallback } from 'react';
import { Platform, StyleSheet, Text, View, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage 임포트
import SearchInput from '../../components/SearchInput';
import Sort from '../../components/SearchSort';
import { supabase } from '../../lib/supabase';


const SEARCH_KEY = '@recent_searches';
const MAX_SEARCH_COUNT = 5; // SearchMain과 동일하게 5개로 제한

const SearchList = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const initialQuery = route.params?.query || ''; 
    const [query, setQuery] = useState(initialQuery);
    const [recipes, setRecipes] = useState([]);
    const [sortBy, setSortBy] = useState('인기순');

  // --- 최근 검색어 저장 로직 ---
  
  // 1. AsyncStorage에서 현재 저장된 최근 검색어 목록을 불러옵니다.
  const loadSearches = async () => {
    try {
      const data = await AsyncStorage.getItem(SEARCH_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to load searches:", e);
      return [];
    }
  };

  // 2. 검색어를 목록에 추가하고, 5개로 제한하여 저장합니다.
  const saveSearchKeyword = async (newQuery) => {
    if (!newQuery.trim()) return;

    try {
      const existingSearches = await loadSearches();
      
      // 새 검색어를 기존 목록에 추가 (중복 제거 및 최신화)
      const updatedSearches = [
        newQuery, 
        ...existingSearches.filter(item => item !== newQuery)
      ].slice(0, MAX_SEARCH_COUNT); // 최대 5개로 제한
      
      await AsyncStorage.setItem(SEARCH_KEY, JSON.stringify(updatedSearches));
    } catch (e) {
      console.error("Failed to save search keyword:", e);
    }
  };
  
  // --- 데이터 패치 및 검색 로직 ---
  
  // 3. 쿼리가 변경되거나 컴포넌트가 처음 로드될 때 실행
  useEffect(() => {
    // 쿼리가 유효할 때만 데이터 패치 및 저장 로직 실행
    if (query.trim()) {
      // 3-1. 검색어 저장 (최근 검색어 업데이트)
      saveSearchKeyword(query); 

      // 3-2. 데이터 패치
const fetchRecipes = async () => {

    const { data, error } = await supabase
      .from('recipes')
      .select('id, title, description, image_urls') 
      
      .contains('tags', [query.trim()]); 

    if (error) {
        console.error('검색 오류:', error);
        setRecipes([]);
        return;
    }

        setRecipes(data || []);
      };

      fetchRecipes();
    } else {
      // 검색어가 비어있을 경우 목록을 비움
      setRecipes([]);
    }
  }, [query]); // query가 변경될 때마다 실행

  // 4. 정렬 함수
  const sortedData = [...recipes].sort((a, b) => {
    // view, date, subscriber 필드가 null일 경우를 대비하여 0 또는 다른 기본값으로 처리
    const aView = a.view || 0;
    const bView = b.view || 0;
    const aSubscriber = a.subscriber || 0;
    const bSubscriber = b.subscriber || 0;
    const aDate = new Date(a.date || 0);
    const bDate = new Date(b.date || 0);
    
    if (sortBy === '인기순') return bView - aView;
    if (sortBy === '최신순') return bDate - aDate;
    if (sortBy === '구독자순') return bSubscriber - aSubscriber;
    return 0;
  });


  return (
    <SafeAreaView style={styles.container}>
      <SearchInput
    value={query}
    onChange={setQuery}
    onClear={() => setQuery('')}
    onBack={() => navigation.goBack()}
    onSubmitEditing={() => setQuery(query)} 
/>
      <Sort sortBy={sortBy} setSortBy={setSortBy} />
      <View style={styles.listContainer}> {/* 스타일 이름 변경하여 혼동 방지 */}
        {sortedData.length === 0 && query.trim() ? (
          <Text style={styles.noResultText}>
            검색 결과가 없습니다. 다른 키워드로 시도해보세요!
          </Text>
        ) : (
          <FlatList
            data={sortedData}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigation.navigate('SearchSummary', {
                    recipeId: item.id,
                    title: item.title,
                    thumbnail: item.image_urls?.[0] || 'https://via.placeholder.com/100x70', 
                    creator: item.channel,
                    description: item.description,
                  })
                }
              >
                <Image 
                  source={{ uri: item.image_urls?.[0] || 'https://via.placeholder.com/100x70' }} 
                  style={styles.thumbnail} 
                />
                <View style={styles.textBox}>
                  <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.channel}>{item.channel} | 조회 {item.view?.toLocaleString() || 0}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SearchList;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
    backgroundColor: '#fff',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16, // FlatList를 감싸는 View에 패딩 적용
  },
  noResultText: {
    textAlign: 'center', 
    marginTop: 20, 
    color: '#555',
  },
  card: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 12,
  },
  thumbnail: {
    width: 100,
    height: 70,
    borderRadius: 8,
  },
  textBox: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  channel: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
  },
});