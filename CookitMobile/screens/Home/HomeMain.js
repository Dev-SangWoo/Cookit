//메인 화면




import { StyleSheet, Text, View, TouchableOpacity, Platform, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../../lib/supabase';

const HomeMain = () => {
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
          <Image source={require('../../assets/signature.png')} style={styles.signature} />
          <Text style={styles.headerTitle}>Cookit</Text>
        </View>
        <TouchableOpacity
          style={styles.inputButton}
          onPress={() => navigation.navigate('SearchMain')}
        >
          <Text style={styles.ButtonText}>🔍 검색어를 입력하세요</Text>
        </TouchableOpacity>

 {/* 보유 재료 기반 추천 */}
        <View style={styles.recommendBox}>
          <Text style={styles.homeText}>나의 재료로 만들 수 있는 요리</Text>
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
        {/* 선호 재료 기반 추천 */}
        <View style={styles.hotBox}> 
          <Text style={styles.homeText}>이런 요리는 어떠세요?</Text>
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

export default HomeMain

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
    marginTop: 12,
    marginBottom: 8,
  },
})