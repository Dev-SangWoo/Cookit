// screens/community/PostDetail.tsx

// 📌 @react-navigation/native에서 필요한 훅을 불러옵니다.
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommunityStackParamList } from './CommunityStack';

// 다른 필요한 라이브러리들은 그대로 유지합니다.
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { createComment, deleteComment, getComments } from '../../services/commentsApi';
import { toggleLike } from '../../services/likesApi';
import { deletePost, getPostById } from '../../services/postsApi';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ✅ 네비게이션 타입 정의
type PostDetailScreenNavigationProp = NativeStackNavigationProp<
  CommunityStackParamList,
  'PostDetail'
>;

export default function PostDetail() {
  // ✅ useLocalSearchParams 대신 useRoute 사용
  const route = useRoute();
  const { id } = route.params as { id: string };

  // ✅ useRouter 대신 useNavigation 사용
  const navigation = useNavigation<PostDetailScreenNavigationProp>();
  const { user } = useAuth();

  const [post, setPost] = useState<any>(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState('');

  const fetchPost = async () => {
    try {
      const data = await getPostById(id); // id는 이미 string 타입
      setPost(data);
      
      const res = await supabase
        .from('user_post_likes')
        .select('id')
        .eq('post_id', id)
        .eq('user_id', user?.id)
        .maybeSingle();

      setLiked(!!res.data);
    } catch (err) {
      console.error('게시글 로딩 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const data = await getComments(id);
      setComments(data);
    } catch (err) {
      console.error('댓글 로딩 실패:', err);
    }
  };

  const handleToggleLike = async () => {
    try {
      const result = await toggleLike(post.id, user.id);
      setLiked(result.liked);
    } catch (err) {
      console.error('좋아요 실패:', err);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentInput.trim()) return;

    try {
      await createComment(id, commentInput, user.id);
      setCommentInput('');
      fetchComments();
    } catch (err) {
      console.error('댓글 작성 실패:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      fetchComments();
    } catch (err) {
      console.error('댓글 삭제 실패:', err);
    }
  };

  const handleDeletePost = async () => {
    Alert.alert(
      '게시글 삭제',
      '정말 이 게시글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost(post.id);
              // ✅ router.replace 대신 navigation.goBack() 사용
              navigation.goBack(); 
            } catch (err) {
              console.error('게시글 삭제 실패:', err);
              Alert.alert('오류', '게시글 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    console.log
    if (id && user) {
      fetchPost();
      fetchComments();
    }
  }, [id, user]);

  if (loading || !post) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const isAuthor = post.user_profiles?.id === user?.id;

  return (
      <SafeAreaView>
    <ScrollView contentContainerStyle={styles.container}>
      {post.image_urls?.map((url: string, i: number) => (
        <Image key={i} source={{ uri: url }} style={styles.image} />
      ))}
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.content}>{post.content}</Text>
      <Text style={styles.meta}>
        작성자:{' '}
        {post.user_profiles?.display_name || '알 수 없음'}
      </Text>

      <TouchableOpacity style={[styles.likeButton, liked && styles.liked]} onPress={handleToggleLike}>
        <Text style={styles.likeText}>{liked ? '❤️ 좋아요 취소' : '🤍 좋아요'}</Text>
      </TouchableOpacity>

      {isAuthor && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePost}>
          <Text style={styles.deleteText}>🗑 게시글 삭제</Text>
        </TouchableOpacity>
      )}

      {/* 댓글 입력 */}
      <View style={styles.commentInputWrapper}>
        <TextInput
          placeholder="댓글을 입력하세요"
          style={styles.commentInput}
          value={commentInput}
          onChangeText={setCommentInput}
        />
        <TouchableOpacity onPress={handleSubmitComment} style={styles.commentButton}>
          <Text style={styles.commentButtonText}>등록</Text>
        </TouchableOpacity>
      </View>

      {/* 댓글 목록 */}
      <View style={styles.commentList}>
        {comments.map((comment) => (
          <View key={comment.id} style={styles.commentItem}>
            <Text style={styles.commentAuthor}>{comment.user_profiles?.display_name || '알 수 없음'}</Text>
            <Text style={styles.commentText}>{comment.content}</Text>
            {comment.user_profiles?.id === user?.id && (
              <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                <Text style={styles.commentDelete}>삭제</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 16,
  },
  meta: {
    color: '#888',
    fontSize: 13,
  },
  likeButton: {
    backgroundColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  liked: {
    backgroundColor: '#ffcccc',
  },
  likeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
  commentInputWrapper: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentButton: {
    backgroundColor: '#3399ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  commentButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  commentList: {
    marginTop: 16,
    gap: 12,
  },
  commentItem: {
    padding: 12,
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
  },
  commentAuthor: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 15,
  },
  commentDelete: {
    color: 'red',
    fontSize: 13,
    marginTop: 4,
  },
});