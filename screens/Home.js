//메인 화면

// 고려해야할 부분 
// 오늘의 레시피, 인기 레시피는 하드코딩 되어있다. 데이터 넉넉하게 2~30개정도 뽑아서
// 음식 이름, 사진, 간단한 설명 이렇게 데이터를 저장해두고 로테이션 돌리면 주기적으로 바뀌게끔
// 만들 수 있지 않을까? 그래서 그것을 누르면 그 제목으로 검색이 돼서(검색 과정 스킵)
// SearchList.js로 가도록 만들면 좋을 것 같다. 
// 지금은 요리로 해놔서 바로 검색이 되게끔 하면 되는데\
// 추천 레시피, 인기 레시피로 할거라면 이미 다 돌려서 데이터를 가지고 있어야 함 
// 누르면 검색으로 가는게 아니라 요약된 레시피 화면으로 가게 만들어야 할듯
//




import { StyleSheet, Text, View, TouchableOpacity, Platform, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../lib/supabase';

const Home = () => {
  const route = useRoute();
  const initialQuery = route.params?.query || '';
  const [query, setQuery] = React.useState(initialQuery);
  const navigation = useNavigation();
  const [recommendRecipes, setRecommendRecipes] = useState([]);
  const [hotRecipes, setHotRecipes] = useState([]);



  useEffect(() => {
    const sampleRecommend = [
      {
        title: '계란말이',
        description: '든든한 한끼! 촉촉한 계란말이 레시피',
        thumbnail: '#',
      },
      {
        title: '비빔국수',
        description: '매콤새콤! 여름 입맛을 돋우는 국수 레시피',
        thumbnail: '#',
      },
    ];
    const sampleHot = [
      {
        title: '불고기',
        description: '달달하고 짭짤한 불고기 한 끼',
        thumbnail: '#',
      },
    ];
    setRecommendRecipes(sampleRecommend);
    setHotRecipes(sampleHot);
  }, []);



  // 서버에서 받아올거면 이렇게 쓰라는데 
  //   const fetchRecipes = async () => {
  //     const recommend = await fetch('#').then(res => res.json());
  //     const hot = await fetch('#').then(res => res.json());
  //     setRecommendRecipes(recommend);
  //     setHotRecipes(hot);
  //   };
  //   fetchRecipes();
  // }, []);
  // 서버에서 title, description, thumbnail 받도록하면 될듯

  const RecipeCard = ({ recipe, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={() => onPress(recipe)} activeOpacity={0.8}>
      <Image source={{ uri: recipe.thumbnail }} style={styles.thumbnail} />
      <Text style={styles.title}>{recipe.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{recipe.description}</Text>
    </TouchableOpacity>
  );

  return (
    
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Image source={require('../assets/signature.png')} style={styles.signature} />
          <Text style={styles.headerTitle}>Cookit</Text>
        </View>
        <TouchableOpacity
          style={styles.inputButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.ButtonText}>🔍 검색어를 입력하세요</Text>
        </TouchableOpacity>

        <View style={styles.recommendBox}>
          <Text style={styles.homeText}>추천 요리</Text>
          <View style={styles.recommendRow}>
            {recommendRecipes.slice(0, 2).map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.miniCard}
                onPress={() => navigation.navigate('SearchList', { query: item.title })}
                activeOpacity={0.8}
              >
                <Image source={{ uri: item.thumbnail }} style={styles.miniThumbnail} />
                <View style={styles.divider} />
                <Text style={styles.miniTitle}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.hotBox}>
          <Text style={styles.homeText}>오늘의 인기 요리</Text>
          {hotRecipes.map((item, idx) => (
            <RecipeCard
              key={idx}
              recipe={item}
              onPress={(r) => navigation.navigate('SearchList', { query: r.title })}
            />
          ))}
        </View>

      </SafeAreaView>
    
  )
}

export default Home

const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingHorizontal: 24
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
  },
  signature: {
    width: 40,
    height: 40,
    marginRight: 8,
    resizeMode: 'contain'
  },
  headerTitle: {
    fontSize: 27,
    fontWeight: 'bold',
    color: 'orange',
  },

  profileButton: {
    position: 'absolute',
    right: 10,
    top: 5
  },

  inputButton: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',

  },
  ButtonText: {
    color: '#888',
    fontSize: 16,
    paddingHorizontal: 10
  },
  recommendBox: {
    paddingVertical: 20,
  },
  homeText: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  recommendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  miniCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    padding: 10,
  },
  miniThumbnail: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  miniTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',

  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  description: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginTop: 10,
    marginBottom: 8,
  },
})