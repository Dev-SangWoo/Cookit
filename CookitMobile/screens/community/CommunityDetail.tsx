import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommunityStackParamList } from './CommunityStack';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { createComment, deleteComment, getComments } from '../../services/commentsApi';
import { toggleLike } from '../../services/likesApi';
import { deletePost, getPostById } from '../../services/postsApi';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; 

type CommunityDetailScreenNavigationProp = NativeStackNavigationProp<
  CommunityStackParamList,
  'CommunityDetail'
>;

const { width: screenWidth } = Dimensions.get('window');

export default function CommunityDetail() {
  const route = useRoute();
  const { postId } = route.params as { postId: string };
  const navigation = useNavigation<CommunityDetailScreenNavigationProp>();
  const { user } = useAuth();

  const [post, setPost] = useState<any>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const scrollRef = useRef<FlatList>(null);

  const fetchPost = async () => {
    try {
      const data = await getPostById(postId);
      setPost(data);

      const { data: likesData, error: likesError } = await supabase
        .from('user_post_likes')
        .select('id, user_id')
        .eq('post_id', postId);

      if (likesError) throw likesError;

      setLikeCount(likesData?.length || 0);
      setLiked(likesData?.some((like: { user_id: string; }) => like.user_id === user?.id) || false);

    } catch (err) {
      console.error('게시글 로딩 실패:', err);
      Alert.alert('오류', '게시글을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const data = await getComments(postId);
      setComments(data);
    } catch (err) {
      console.error('댓글 로딩 실패:', err);
      Alert.alert('오류', '댓글을 불러오는 데 실패했습니다.');
    }
  };

  const handleToggleLike = async () => {
    if (!user?.id || !post?.post_id) {
      Alert.alert('오류', '로그인 후 좋아요를 누를 수 있습니다.');
      return;
    }

    try {
      const result = await toggleLike(post.post_id, user.id);
      setLiked(result.liked);
      setLikeCount(prevCount => (result.liked ? prevCount + 1 : prevCount - 1));
    } catch (err) {
      console.error('좋아요 실패:', err);
      Alert.alert('오류', '좋아요 처리에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const handleSubmitComment = async () => {
    if (!commentInput.trim()) {
      Alert.alert('오류', '댓글 내용을 입력해주세요.');
      return;
    }
    if (!user?.id) {
      Alert.alert('오류', '로그인 후 댓글을 작성할 수 있습니다.');
      return;
    }

    try {
      await createComment(postId, commentInput, user.id);
      setCommentInput('');
      fetchComments();
    } catch (err) {
      console.error('댓글 작성 실패:', err);
      Alert.alert('오류', '댓글 작성에 실패했습니다.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    Alert.alert(
      '댓글 삭제',
      '정말 이 댓글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteComment(commentId);
              fetchComments();
            } catch (err) {
              console.error('댓글 삭제 실패:', err);
              Alert.alert('오류', '댓글 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
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
              await deletePost(post.post_id);
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
    if (postId && user) {
      fetchPost();
      fetchComments();
    }
  }, [postId, user]);

  const handleScroll = (event: any) => {
    const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
    if (slide !== currentImageIndex) {
      setCurrentImageIndex(slide);
    }
  };

  if (loading || !post) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FFC107" />
        <Text style={{ marginTop: 10, color: '#666' }}>게시글을 불러오는 중...</Text>
      </View>
    );
  }

  const isAuthor = post.user_profiles?.id === user?.id;

  const renderImageItem = ({ item }: { item: string }) => (
    <Image key={item} source={{ uri: item }} style={styles.carouselImage} resizeMode="contain" />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.postContainer}>
          {/* 게시물 상단 (프로필, 닉네임, 삭제 버튼) */}
          <View style={styles.postHeader}>
            <View style={styles.authorInfo}>
              <Image
                source={{ uri: post.user_profiles?.avatar_url || 'https://via.placeholder.com/40' }}
                style={styles.avatar}
              />
              <Text style={styles.authorName}>
                {post.user_profiles?.display_name || '알 수 없음'}
              </Text>
            </View>
            {isAuthor && (
              <TouchableOpacity onPress={handleDeletePost} style={styles.deleteButton}>
                <Text>🗑</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 사진 슬라이더 */}
          {post.image_urls && post.image_urls.length > 0 && (
            <View style={styles.imageCarouselContainer}>
              <FlatList
                ref={scrollRef}
                data={post.image_urls}
                renderItem={renderImageItem}
                keyExtractor={(item, index) => `${item}-${index}`}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
              />
              {post.image_urls.length > 1 && (
                <View style={styles.pagination}>
                  {post.image_urls.map((_: any, i: number) => (
                    <Text key={i} style={i === currentImageIndex ? styles.pagingActiveText : styles.pagingText}>
                      ⬤
                    </Text>
                  ))}
                </View>
              )}
              {post.image_urls.length > 0 && (
                <View style={styles.imageCounter}>
                  <Text style={styles.imageCounterText}>
                    {currentImageIndex + 1} / {post.image_urls.length}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* 좋아요 버튼 및 카운트 */}
          <View style={styles.actionContainer}>
            <TouchableOpacity onPress={handleToggleLike}>
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={28}
                color={liked ? '#ef5350' : '#333'}
              />
            </TouchableOpacity>
            <Text style={styles.likeCountText}>
              {likeCount} likes
            </Text>
          </View>

          {/* 제목, 내용, 날짜 */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.content}>{post.content}</Text>
            <Text style={styles.metaDate}>
              {new Date(post.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* 댓글 섹션 */}
        <View style={styles.commentSection}>
          <Text style={styles.sectionTitle}>댓글</Text>
          <View style={styles.commentInputWrapper}>
            <TextInput
              placeholder="댓글을 입력하세요"
              placeholderTextColor="#999"
              style={styles.commentInput}
              value={commentInput}
              onChangeText={setCommentInput}
            />
            <TouchableOpacity onPress={handleSubmitComment} style={styles.commentSubmitButton}>
              <Text style={styles.commentSubmitButtonText}>등록</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.commentList}>
            {comments.length === 0 ? (
              <Text style={styles.noCommentsText}>아직 댓글이 없습니다.</Text>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <Image
                      source={{ uri: comment.user_profiles?.avatar_url || 'https://via.placeholder.com/30' }}
                      style={styles.commentAvatar}
                    />
                    <Text style={styles.commentAuthor}>{comment.user_profiles?.display_name || '알 수 없음'}</Text>
                    <Text style={styles.commentDate}>
                      {new Date(comment.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{comment.content}</Text>
                  {comment.user_profiles?.id === user?.id && (
                    <TouchableOpacity onPress={() => handleDeleteComment(comment.id)} style={styles.commentDeleteButton}>
                      <Text style={styles.commentDeleteText}>삭제</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  postContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
  },

  // 게시물 상단 (헤더)
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 10,
  },
  authorName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    padding: 5,
  },

  // 이미지 캐러셀
  imageCarouselContainer: {
    width: screenWidth,
    height: screenWidth, // 정사각형
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselImage: {
    width: screenWidth,
    height: '100%',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  pagingText: {
    color: '#ccc',
    margin: 3,
    fontSize: 8,
  },
  pagingActiveText: {
    color: '#FFC107',
    margin: 3,
    fontSize: 8,
  },
  imageCounter: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  imageCounterText: {
    color: 'white',
    fontSize: 12,
  },

  // 좋아요, 댓글 등 액션 영역
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  likeCountText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },

  // 게시물 제목, 내용
  textContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
  },
  metaDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
  },

  // 댓글 섹션
  commentSection: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  commentInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    marginRight: 10,
  },
  commentSubmitButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentSubmitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  commentList: {
    marginTop: 15,
  },
  noCommentsText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 10,
  },
  commentItem: {
    backgroundColor: '#fefefe',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    marginRight: 8,
  },
  commentAuthor: {
    fontWeight: 'bold',
    color: '#444',
    fontSize: 14,
  },
  commentDate: {
    fontSize: 11,
    color: '#aaa',
    marginLeft: 'auto',
  },
  commentText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 8,
  },
  commentDeleteButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  commentDeleteText: {
    color: '#ef5350',
    fontSize: 12,
    fontWeight: 'bold',
  },
});