import { getPosts } from '@/services/postsApi';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Button, FlatList, Text, TouchableOpacity, View } from 'react-native';
import CommunityIndex from '../community/index';

export default CommunityIndex;
export default function CommunityScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const data = await getPosts();
    setPosts(data);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Button title="새 글 작성" onPress={() => router.push('/community/create')} />
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.title}</Text>
            <Text>{item.content}</Text>
            <Text>좋아요 {item.like_count} · 댓글 {item.comment_count}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
