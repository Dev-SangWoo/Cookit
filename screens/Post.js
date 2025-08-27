import React, { useEffect, useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import ModalComment from '../screens/modal/ModalComment';

const Post = ({ route, navigation }) => {

  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const { postId } = route.params;
  const currentUserId = 'your_user_id'; // 실제 로그인 사용자 ID로 대체

  const [post, setPost] = useState(null);
  const [comments, fetchComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    fetchPost();
    fetchComments();
    fetchLikes();
    fetchCommentCount(); // 댓글 개수도 불러오기
  }, [postId]);


  const fetchPost = async () => {
    const { data } = await supabase
      .from('user_posts')
      .select('*')
      .eq('id', postId)
      .single();
    setPost(data);
  };

  const fetchCommentCount = async () => {
    const { count } = await supabase
      .from('user_post_comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    setCommentCount(count || 0);
  };

  const fetchLikes = async () => {
    const { data } = await supabase
      .from('user_post_likes')
      .select('*')
      .eq('post_id', postId);

    setLikeCount(data?.length || 0);
    setLiked(data?.some((like) => like.user_id === currentUserId));
  };

  const toggleLike = async () => {
    if (liked) {
      await supabase
        .from('user_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', currentUserId);
      setLikeCount((prev) => prev - 1);
    } else {
      await supabase
        .from('user_post_likes')
        .insert({ post_id: postId, user_id: currentUserId });
      setLikeCount((prev) => prev + 1);
    }
    setLiked(!liked);
  };

const submitComment = async () => {
  if (!newComment.trim()) return;

  await supabase.from('user_post_comments').insert({
    post_id: postId,
    user_id: currentUserId,
    content: newComment,
  });

  setNewComment('');
  fetchComments();
  fetchCommentCount(); // 댓글 수 갱신
};

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.userId}>{post?.user_id}</Text>
      </View>

      {/* 이미지 */}
      {post?.image_urls?.[0] && (
        <Image source={{ uri: post.image_urls[0] }} style={styles.image} />
      )}

      {/* 좋아요 + 댓글 버튼 */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={toggleLike}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={24}
            color={liked ? 'red' : '#333'}
          />
        </TouchableOpacity>
        <Text style={styles.likeCount}>{likeCount} </Text>

        <TouchableOpacity onPress={() => setIsCommentModalVisible(true)}>
          <Ionicons name="chatbubble-outline" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.commentCount}>{commentCount} </Text>
      </View>
      {post?.title && (
        <Text style={styles.title}>{post.title}</Text>
      )}
      {/* 게시 시간 */}
      <Text style={styles.timestamp}>
        {new Date(post?.created_at).toLocaleString()}
      </Text>

      <ModalComment
        visible={isCommentModalVisible}
        onClose={() => setIsCommentModalVisible(false)}
        comments={comments}
        newComment={newComment}
        setNewComment={setNewComment}
        submitComment={submitComment}
      />
    </SafeAreaView>

  );
};

export default Post;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },

  userId: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 4,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 12
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8
  },
  likeCount: {
    fontSize: 14
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8
  },
  comment: {
    marginBottom: 10
  },
  commentUser: {
    fontWeight: 'bold',
    marginBottom: 2
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  commentSubmit: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
});
