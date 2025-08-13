import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const Post = ({ route }) => {
  const { nickname, avatar, comment, likes, replies } = route.params;
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 20 : 0 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={30} color="black" />
          </TouchableOpacity>
          <Text style={styles.nickname}>{nickname}</Text>
        </View>

        <Image source={ avatar } style={styles.postImage} />

        <View style={styles.footer}>
          <TouchableOpacity style={styles.iconRow}>
            <Ionicons name="heart-outline" size={24} color="gray" />
            <Text style={styles.count}>{likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconRow}>
            <Ionicons name="chatbubble-outline" size={24} color="gray" />
            <Text style={styles.count}>{replies}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.comment}>{comment}</Text>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  nickname: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  postImage: {
    width: '100%',
    height: 500,  // 사진 길이
    marginBottom: 16,
  },
  comment: {
    fontSize: 16,
    marginTop: 24,
  },
  footer: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  count: {
    marginLeft: 6,
    fontSize: 14,
    color: 'gray',
  },
});

export default Post;
