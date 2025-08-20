import React, { useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';


const numColumns = 3;
const imageSize = Dimensions.get('window').width / numColumns;

const Community = () => {
  const [posts, setPosts] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const loadPosts = async () => {
      const data = await fetchPosts();
      setPosts(data);
    };

    loadPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('user_posts')
      .select('id, image_urls');

    if (error) {
      console.error('커뮤니티 이미지 불러오기 오류:', error);
      return [];
    }

    return data;
  };

  const renderItem = ({ item }) => {
    const image = item.image_urls?.[0] || 'https://via.placeholder.com/150';

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('Post', { postId: item.id })}
        style={styles.imageWrapper}
      >
        <Image source={{ uri: image }} style={styles.image} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
      />
      <TouchableOpacity
  style={styles.fab}
  onPress={() => navigation.navigate('CreatePost')}
>
  <Ionicons name="add" size={28} color="#fff" />
</TouchableOpacity>
    </SafeAreaView>
  );
};

export default Community;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageWrapper: {
    width: imageSize,
    height: imageSize,
    padding: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});
