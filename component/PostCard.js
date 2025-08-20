// Community.js 카드 부분 사진을 추가한다던가 하려면 여기서 수정
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PostCard = ({ nickname, avatar, comment, likes, replies, date }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('Post', {
      nickname,
      avatar,
      comment,
      likes,
      replies,
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.card}>
      <View style={styles.header}>
        <Image
  source={
    typeof avatar === 'string'
      ? { uri: avatar }
      : avatar
  }
  style={styles.avatar}
/>

        <Text style={styles.nickname}>{nickname}</Text>
      </View>
      <Text style={styles.comment}>{comment}</Text>
      <View style={styles.footer}>
        <Text style={styles.count}>❤️ {likes}</Text>
        <Text style={styles.count}>💬 {replies}</Text>
        <Text style={styles.count}> {date}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  nickname: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  comment: {
    marginVertical: 8,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
  },
  count: {
    fontSize: 13,
    color: 'gray',
  },
});

export default PostCard;
