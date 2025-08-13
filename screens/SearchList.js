// 검색 내용을 보여주는 부분


// 고려해야할 부분
// 1. 사용자가 검색을 하면 검색 내용을 서버에서 검색해주고 
//     리스트들을 받아서 SearchList.js에서 보여줄 예정 
//     받아올 내용은 id(필요할지는 모름), title(제목), thumbnail(썸네일), channel(채널 이름)
//     AI 말로는 YouTube Data API v3 를 쓰면 조회수, 제목, 제작자 정보, 썸네일을 가져올 수 있는듯?

//     사용자 검색 => 검색 내용 서버로 보내기 
//     => 서버에서 검색한 결과를 앱으로 보내기 => 그 결과를 받아서 보여주기

// 탭을 만들어서 조회수 순, 최근 순, ... 탭 만들어서 할 수 있으면 좋을지도


// 이건 나중에 서버 연결할 때 쓰라는데??
// useEffect(() => {
//   // query가 변경될 때 서버로 요청
//   fetch(`https://your-api/search?q=${query}`)
//     .then(res => res.json())
//     .then(setResult);
// }, [query]);

import { Platform, StyleSheet, Text, View, FlatList, Image, TouchableOpacity,} from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import SearchInput from '../component/SearchInput';
import Sort from '../component/Sort';

const dummyData = [
  {
    id: 'TxTv8_e2otE',
    title: '김치찌개 힘들게 하지마세요✔️ 이 방법은 식당차리면 대박 ...',
    thumbnail: 'https://img.youtube.com/vi/TxTv8_e2otE/mqdefault.jpg',
    channel: '맛있는 김치찌개',
    view: 120000,
    date: '2024-06-01',
    subscriber: 120000,
  },
  {
    id: '0tiuhim4OCs',
    title: '1등 식당처럼 맛있게 [돼지고기 김치찌개] 끓이는법! 한 숟갈만 ...',
    thumbnail: 'https://img.youtube.com/vi/0tiuhim4OCs/mqdefault.jpg',
    channel: '딸을 위한 레시피',
    view: 85000,
    date: '2024-07-15',
    subscriber: 50000,
  },
  {
    id: 'e4NnhT99fr0',
    title: '한국인 99%가 좋아하는 김치찌개 이 레시피는 널리 알려야합니다!',
    thumbnail: 'https://img.youtube.com/vi/e4NnhT99fr0/mqdefault.jpg',
    channel: '요리백과',
    view: 230000,
    date: '2024-05-20',
    subscriber: 30000,
  },
];

const SearchList = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const initialQuery = route.params?.query || '';
  const [query, setQuery] = React.useState(initialQuery);

  const filteredData = dummyData.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );
const [sortBy, setSortBy] = React.useState('인기순');
const sortedData = [...filteredData].sort((a, b) => {
  if (sortBy === '인기순') {
    return b.view - a.view;
  } else if (sortBy === '최신순') {
    return new Date(b.date) - new Date(a.date);
  } else if (sortBy === '구독자순') {
    return b.subscriber - a.subscriber;
  }
  return 0;
});
// API 연동 시 값을 바꿔야한다


  return (
    <SafeAreaView
      style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 15 : 0 }}
    >
      <SearchInput
        value={query}
        onChange={setQuery}
        onClear={() => setQuery('')}
        onBack={() => navigation.goBack()}
        onSubmitEditing={() =>
          navigation.navigate('SearchList', {
            query,
          })
        }
      />
      <Sort sortBy={sortBy} setSortBy={setSortBy} />
      <View style={styles.container}>
        {filteredData.length === 0 ? (
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
                  navigation.navigate('SummaryChoice', {
                    id: item.id,
                    title: item.title,
                    thumbnail: item.thumbnail,
                    creator: item.channel,
                  })
                }
              >
                <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                <View style={styles.textBox}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.channel}>{item.channel}</Text>
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
