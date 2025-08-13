// Community.js 오른쪽에 대표 사진(처음 사진) 하나 보여줘도 될듯 
import React from 'react';
import { ScrollView, StyleSheet, View, Text, Image, Platform } from 'react-native';
import PostCard from '../component/PostCard';
import { SafeAreaView } from 'react-native-safe-area-context';

const posts = [
  {
    nickname: '민준',
    avatar: require('../assets/Choco.png'),
    comment: '오늘 날씨 너무 좋다 ',
    likes: 12,
    replies: 3,
  },
  {
    nickname: '지우',
    avatar: 'https://example.com/avatar2.jpg',
    comment: '포천에 새로 생긴 카페 가봤어요!',
    likes: 8,
    replies: 1,
  },
    {
    nickname: '지우',
    avatar: 'https://example.com/avatar2.jpg',
    comment: '포천에 새로 생긴 카페 가봤어요!',
    likes: 8,
    replies: 1,
  },  {
    nickname: '지우',
    avatar: 'https://example.com/avatar2.jpg',
    comment: '포천에 새로 생긴 카페 가봤어요!',
    likes: 8,
    replies: 1,
  },  {
    nickname: '지우',
    avatar: 'https://example.com/avatar2.jpg',
    comment: '포천에 새로 생긴 카페 가봤어요!',
    likes: 8,
    replies: 1,
  },  {
    nickname: '지우',
    avatar: 'https://example.com/avatar2.jpg',
    comment: '포천에 새로 생긴 카페 가봤어요!',
    likes: 8,
    replies: 1,
  },  {
    nickname: '지우',
    avatar: 'https://example.com/avatar2.jpg',
    comment: '포천에 새로 생긴 카페 가봤어요!',
    likes: 8,
    replies: 1,
  },
];

const Community = () => {
  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 15 : 0 }}>
      <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/signature.png')} style={styles.signature} />
        <Text style={styles.headerTitle}>Cookit</Text>
      </View>
      <ScrollView style={{ padding: 16 }}>
        {posts.map((post, index) => (
          <PostCard key={index} {...post} />
        ))}
      </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Community;

const styles = StyleSheet .create ({
    container: { // 양쪽 사이드 공백을 준 상태 
    flex: 1,
    paddingHorizontal: 15
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
})