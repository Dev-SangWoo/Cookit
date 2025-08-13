import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet, Platform, } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 안드로이드 버튼 하단 보장

// 예시 데이터 (실제 앱에서는 Redux, AsyncStorage, API 등에서 불러올 수 있음)
const savedRecipes = [
  {
    id: '1',
    title: '초간단 김치볶음밥',
    thumbnail: 'https://example.com/image1.jpg',
    creator: '요리왕 비룡',
    summary: '김치와 밥만 있으면 OK! 10분 완성 레시피.',
  },
  {
    id: '2',
    title: '부드러운 크림파스타',
    thumbnail: 'https://example.com/image2.jpg',
    creator: '최현석',
    summary: '생크림 없이 만드는 고소한 파스타!',
  },
    {
    id: '3',
    title: '부드러운 크림파스타',
    thumbnail: 'https://example.com/image2.jpg',
    creator: '최현석',
    summary: '생크림 없이 만드는 고소한 파스타!',
  },
    {
    id: '4',
    title: '부드러운 크림파스타',
    thumbnail: 'https://example.com/image2.jpg',
    creator: '최현석',
    summary: '생크림 없이 만드는 고소한 파스타!',
  },
    {
    id: '5',
    title: '부드러운 크림파스타',
    thumbnail: 'https://example.com/image2.jpg',
    creator: '최현석',
    summary: '생크림 없이 만드는 고소한 파스타!',
  },
    {
    id: '6',
    title: '부드러운 크림파스타',
    thumbnail: 'https://example.com/image2.jpg',
    creator: '최현석',
    summary: '생크림 없이 만드는 고소한 파스타!',
  },
    {
    id: '7',
    title: '부드러운 크림파스타',
    thumbnail: 'https://example.com/image2.jpg',
    creator: '최현석',
    summary: '생크림 없이 만드는 고소한 파스타!',
  },
  // ... 더 많은 요약 레시피
];

const History = (value) => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');

  const filteredList = savedRecipes.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('Recipe', {
          id: item.id,
          title: item.title,
          thumbnail: item.thumbnail,
          creator: item.creator,
          summary: item.summary,
        })
      }
    >
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <View style={styles.textBox}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.creator}>{item.creator}</Text>
      </View>
    </TouchableOpacity>
  );
   const insets = useSafeAreaInsets();


  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 15 : 0 }}>
      <View style={styles.container}>
<View style={styles.searchWrapper}>
  <TextInput
    placeholder="제목 검색"
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
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />

      </View>

    </SafeAreaView>
  );
};

export default History;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
  },
  thumbnail: {
    width: 100,
    height: 100,
  },
  textBox: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  creator: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
searchWrapper: {
  position: 'relative',
  marginBottom: 16,
},
searchInput: {
  height: 40,
  borderColor: '#ccc',
  borderWidth: 1,
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingRight: 32, // 아이콘 공간 확보
},
clearButton: {
  position: 'absolute',
  right: 8 ,
  top: '40%',
  transform: [{ translateY: -9 }],
  padding: 4,
},
});


// 지금까지 요약해서 요리했던 레시피들을 다시 볼 수 있음
// 장점은 다시 요약될 때까지 기다릴 필요가 없으므로
// 시간절약이 돼서 좋은 방향으로 생각
// 사용자가 요리 요약한 데이터를 서버에서 가지고 있으면 될 것 같은데..
// 정확히는 모르겠다
// 구성은 SearchList 파일처럼 보여주면 될 것 같음