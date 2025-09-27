// 검색 내용을 보여주는 부분


// 고려해야할 부분
// 1. 사용자가 검색을 하면 검색 내용을 서버에서 검색해주고 
//     리스트들을 받아서 SearchList.js에서 보여줄 예정 
//     받아올 내용은 id(필요할지는 모름), title(제목), thumbnail(썸네일), channel(채널 이름)
//     AI 말로는 YouTube Data API v3 를 쓰면 조회수, 제목, 제작자 정보, 썸네일을 가져올 수 있는듯?

//     사용자 검색 => 검색 내용 서버로 보내기 
//     => 서버에서 검색한 결과를 앱으로 보내기 => 그 결과를 받아서 보여주기

// 탭을 만들어서 조회수 순, 최근 순, ... 탭 만들어서 할 수 있으면 좋을지도



import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import SearchInput from '../../components/SearchInput';
import Sort from '../../components/Sort';
import { supabase } from '../../lib/supabase';

const SearchList = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const initialQuery = route.params?.query || '';
  const [query, setQuery] = useState(initialQuery);
  const [recipes, setRecipes] = useState([]);
  const [sortBy, setSortBy] = useState('인기순');

  useEffect(() => {
    const fetchRecipes = async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('id, title, description') // 필요한 필드만 , channel, view, date, subscriber, ...
        .contains('tags', [query]); // '계란요리'가 tags에 포함된 레시피

      if (error) {
        console.error('검색 오류:', error);
        return;
      }

      setRecipes(data);
    };

    fetchRecipes();
  }, [query]);

  const sortedData = [...recipes].sort((a, b) => {
    if (sortBy === '인기순') return b.view - a.view;
    if (sortBy === '최신순') return new Date(b.date) - new Date(a.date);
    if (sortBy === '구독자순') return b.subscriber - a.subscriber;
    return 0;
  });

  return (
    <SafeAreaView style={styles.container}>
      <SearchInput
        value={query}
        onChange={setQuery}
        onClear={() => setQuery('')}
        onBack={() => navigation.goBack()}
        onSubmitEditing={() => navigation.navigate('SearchList', { query })}
      />
      <Sort sortBy={sortBy} setSortBy={setSortBy} />
      <View style={styles.container}>
        {sortedData.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#555' }}>
            검색 결과가 없습니다. 다른 키워드로 시도해보세요!
          </Text>
        ) : (
          <FlatList
            data={sortedData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigation.navigate('SearchSummary', {
                    recipeId: item.id,
                    title: item.title,
                    thumbnail: item.image_urls?.[0] || 'https://via.placeholder.com/100x70', // 이미지 없으면 빈 값
                    creator: item.channel,
                  })
                }
              >
                <Image source={{ uri: item.image_urls?.[0] || 'https://via.placeholder.com/100x70' }} style={styles.thumbnail} />
                <View style={styles.textBox}>
                  <Text style={styles.title}>{item.title}</Text>
                  {/* <Text style={styles.channel}>{item.channel}</Text> */}
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
    paddingHorizontal: 16,
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
