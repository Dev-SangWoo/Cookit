// 검색 창
// 간단하게 만들었지만 최근 검색 기록을 넣는다던가 
// 추천 메뉴들을 아래에 보여주는 방법도 있을듯


import { StyleSheet, Text, View, Platform } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import SearchInput from '../components/SearchInput';

const Search = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');

  const searching = () => {
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
            <View style={styles.container}>
      <View style={styles.currentBox}>
        <Text style={styles.titleText}>최근 검색어</Text>
        {/* 최근 검색어 리스트 */}
      </View>
      <View style={styles.recommendBox}>
        <Text style={styles.titleText}>추천 검색</Text>
        {/* 여러가지 버튼, 텍스트, ... 등 */}
      </View>

</View>
    </SafeAreaView>
  );
}


export default Search

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
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  currentBox: {
    
  },
titleText: {
  fontSize: 18,
  fontWeight: 'bold'
}
})