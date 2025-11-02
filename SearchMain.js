// 검색 창
// 최근 검색어 구현, 5개까지 

import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import SearchInput from '../../components/SearchInput';

// AsyncStorage에 검색어 목록을 저장할 키
const SEARCH_KEY = '@recent_searches';
// 저장하고 표시할 최대 검색어 개수를 5개로 설정
const MAX_SEARCH_COUNT = 5; // <--- 이 부분을 5로 변경했습니다.

const SearchMain = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);

  // 1. 최근 검색어 불러오기
  const loadSearches = async () => {
    try {
      const data = await AsyncStorage.getItem(SEARCH_KEY);
      if (data) {
        // 불러올 때도 최대 5개까지만 유지하도록 처리할 수도 있지만,
        // 일단은 모두 불러온 후 FlatList에서 잘라서 표시하겠습니다.
        setRecentSearches(JSON.parse(data)); 
      }
    } catch (e) {
      console.error("Failed to load searches:", e);
    }
  };

  // 2. 검색어 저장하기
  const saveSearches = async (newSearches) => {
    try {
      // AsyncStorage에는 MAX_SEARCH_COUNT(5개) 만큼만 저장
      const searchesToSave = newSearches.slice(0, MAX_SEARCH_COUNT); 
      await AsyncStorage.setItem(SEARCH_KEY, JSON.stringify(searchesToSave));
      setRecentSearches(searchesToSave); // 상태 업데이트도 5개로 제한
    } catch (e) {
      console.error("Failed to save searches:", e);
    }
  };

  // 컴포넌트 마운트 시, 또는 화면에 포커스 될 때마다 검색어 불러오기
  useFocusEffect(
    useCallback(() => {
      loadSearches();
    }, [])
  );

  // 3. 검색 실행 및 검색어 저장 로직
  const searching = async () => {
    if (!query.trim()) {
      return;
    }
    
    const newQuery = query.trim();
    // 새 검색어를 기존 목록에 추가 (중복 제거 및 최신화)
    let updatedSearches = [newQuery, ...recentSearches.filter(item => item !== newQuery)];

    // 저장 및 표시 개수를 MAX_SEARCH_COUNT(5)로 제한
    // 이 부분에서 배열을 잘라줍니다.
    if (updatedSearches.length > MAX_SEARCH_COUNT) {
      updatedSearches = updatedSearches.slice(0, MAX_SEARCH_COUNT);
    }

    // AsyncStorage에 저장
    await saveSearches(updatedSearches);
    
    // 검색 결과 페이지로 이동
    navigation.navigate("SearchList", { query: newQuery });
    setQuery(''); 
  };

  // 4. 개별 검색어 삭제
  const deleteSearchItem = async (itemToDelete) => {
    const updatedSearches = recentSearches.filter(item => item !== itemToDelete);
    await saveSearches(updatedSearches); // 저장할 때도 5개 제한 로직이 적용됨
  };
  
  // 5. 전체 검색어 삭제
  const clearAllSearches = async () => {
    Alert.alert(
      "검색 기록 삭제",
      "최근 검색 기록을 모두 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { text: "삭제", onPress: async () => {
            await AsyncStorage.removeItem(SEARCH_KEY);
            setRecentSearches([]);
          },
          style: "destructive"
        },
      ]
    );
  };

  // 6. 최근 검색어 항목 렌더링
  const renderItem = ({ item }) => (
    <View style={styles.searchItem}>
      <TouchableOpacity 
        style={styles.searchItemTextContainer}
        onPress={() => {
          setQuery(item); 
          navigation.navigate("SearchList", { query: item }); 
        }}
      >
        <Text style={styles.searchItemText}>{item}</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={() => deleteSearchItem(item)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>X</Text>
      </TouchableOpacity>
    </View>
  );


  return (
    <SafeAreaView style={styles.container}>
      <SearchInput
        value={query}
        onChange={setQuery}
        onClear={() => setQuery('')}
        onBack={() => navigation.goBack()}
        onSubmitEditing={searching}
      />
      <View style={styles.contentContainer}> 
        <View style={styles.currentBox}>
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>최근 검색어</Text>
            {/* 전체 삭제 버튼은 5개 이상일 때가 아니라, 기록이 있을 때만 표시 */}
            {recentSearches.length > 0 && (
              <TouchableOpacity onPress={clearAllSearches}>
                <Text style={styles.clearAllText}>전체 삭제</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* FlatList에 MAX_SEARCH_COUNT(5)개로 이미 잘린 recentSearches를 전달 */}
          {recentSearches.length > 0 ? (
            <FlatList
              // 이미 MAX_SEARCH_COUNT 만큼으로 상태가 잘려있으므로, 별도의 .slice()는 필요 없습니다.
              data={recentSearches}
              renderItem={renderItem}
              keyExtractor={(item) => item} 
              keyboardShouldPersistTaps="handled" 
              style={styles.listContainer}
            />
          ) : (
            <Text style={styles.noDataText}>최근 검색 기록이 없습니다.</Text>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}


export default SearchMain;

const styles = StyleSheet.create({
  // 스타일은 이전과 동일하게 유지됩니다.
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: { 
    flex: 1,
    paddingHorizontal: 16,
  },
  currentBox: {
    paddingVertical: 15,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearAllText: {
    fontSize: 14,
    color: 'gray',
  },
  noDataText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 20,
  },
  listContainer: {
    // FlatList 스타일
  },
  searchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchItemTextContainer: {
    flex: 1, 
  },
  searchItemText: {
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    padding: 5,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#999',
  },
});