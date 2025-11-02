// 검색 창 화면. 
// 히스토리를 어디에 넣을지 생각해봤는데 앱 종료시 삭제될 정보이다보니 
// 프로필 쪽에서 확인하는 것 보다는 검색창 아래에 배치하는 것이 좋을 것 같아서 
// 아래에 배치해봤습니다

import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert, Image } from 'react-native';
import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SearchInput from '../../components/SearchInput';

// AsyncStorage에 검색어 목록을 저장할 키
const SEARCH_KEY = '@recent_searches';
// 저장하고 표시할 최대 검색어 개수를 5개로 설정
const MAX_SEARCH_COUNT = 5;

const SearchMain = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [recipeHistory, setRecipeHistory] = useState([]);

  // 1. 최근 검색어 불러오기
  const loadSearches = async () => {
    try {
      const data = await AsyncStorage.getItem(SEARCH_KEY);
      if (data) {
        setRecentSearches(JSON.parse(data));
      }
    } catch (e) {
      console.error("Failed to load searches:", e);
    }
  };

  // 2. 검색어 저장하기
  const saveSearches = async (newSearches) => {
    try {
      const searchesToSave = newSearches.slice(0, MAX_SEARCH_COUNT);
      await AsyncStorage.setItem(SEARCH_KEY, JSON.stringify(searchesToSave));
      setRecentSearches(searchesToSave);
    } catch (e) {
      console.error("Failed to save searches:", e);
    }
  };

  //  3. useFocusEffect
  useFocusEffect(
    useCallback(() => {
      loadSearches();

      // 네비게이션을 통해 전달된 레시피 히스토리 데이터 확인 및 업데이트
      const historyData = navigation.getState().routes.find(
        r => r.name === 'SearchMain'
      )?.params?.recipeHistory;

      if (historyData) {
        const newRecipe = historyData;

        setRecipeHistory(prevHistory => {
          let updatedHistory = [
            newRecipe,
            // 최신 상태(prevHistory)를 기반으로 중복 제거
            ...prevHistory.filter(item => item.videoId !== newRecipe.videoId)
          ];

          return updatedHistory.slice(0, MAX_SEARCH_COUNT);
        });


        navigation.setParams({ recipeHistory: undefined });
      }

    }, [navigation])
  );

  // 4. 검색 실행 및 검색어 저장 로직 
  const searching = async () => {
    if (!query.trim()) {
      return;
    }
    const newQuery = query.trim();
    let updatedSearches = [newQuery, ...recentSearches.filter(item => item !== newQuery)];

    if (updatedSearches.length > MAX_SEARCH_COUNT) {
      updatedSearches = updatedSearches.slice(0, MAX_SEARCH_COUNT);
    }

    await saveSearches(updatedSearches);
    navigation.navigate("SearchList", { query: newQuery });
    setQuery('');
  };

  // 5. 개별 검색어 삭제 
  const deleteSearchItem = async (itemToDelete) => {
    const updatedSearches = recentSearches.filter(item => item !== itemToDelete);
    await saveSearches(updatedSearches);
  };

  // 6. 전체 검색어 삭제
  const clearAllSearches = async () => {
    Alert.alert(
      "검색 기록 삭제",
      "최근 검색 기록을 모두 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제", onPress: async () => {
            await AsyncStorage.removeItem(SEARCH_KEY);
            setRecentSearches([]);
          },
          style: "destructive"
        },
      ]
    );
  };

  // 7. 최근 검색어 항목 렌더링 
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

  // 8. 히스토리 항목 렌더링 
  const renderHistoryItem = ({ item }) => (
    <View style={styles.searchItem}>
      <TouchableOpacity
        style={styles.historyItemContent}
        onPress={() => {

          navigation.navigate('Summary', {
            videoId: item.videoId,
            title: item.title,
            thumbnail: item.thumbnail,
            channelTitle: item.channelTitle,
            isYouTubeAnalysis: true,
          });
        }}
      >
        <Image source={{ uri: item.thumbnail }} style={styles.historyThumbnail} />
        <View style={styles.historyTextContainer}>
          <Text style={styles.searchItemText} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.channelTitle}>{item.channelTitle}</Text>
        </View>
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
            {recentSearches.length > 0 && (
              <TouchableOpacity onPress={clearAllSearches}>
                <Text style={styles.clearAllText}>전체 삭제</Text>
              </TouchableOpacity>
            )}
          </View>
          {recentSearches.length > 0 ? (
            <FlatList
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


        <View style={styles.currentBox}>
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>선택 레시피 히스토리</Text>
          </View>

          {recipeHistory.length > 0 ? (
            <FlatList
              data={recipeHistory}
              renderItem={renderHistoryItem}
              keyExtractor={(item) => item.videoId}
              keyboardShouldPersistTaps="handled"
              style={styles.listContainer}
            />
          ) : (
            <Text style={styles.noDataText}>선택된 레시피 기록이 없습니다.</Text>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}


export default SearchMain;

const styles = StyleSheet.create({
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
  listContainer: {},
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
  channelTitle: { 
    fontSize: 12, 
    color: '#999', 
    marginTop: 2, 
  },
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  historyTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});