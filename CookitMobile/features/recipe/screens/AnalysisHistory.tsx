import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAnalysis, AnalysisItem } from '@features/recipe/contexts/AnalysisContext';

export default function AnalysisHistory() {
  const navigation = useNavigation();
  const { history, removeFromHistory, clearHistory } = useAnalysis();

  const handleItemPress = (item: AnalysisItem) => {
    if (item.status === 'completed' && item.recipe) {
      const recipeId = item.recipe.id || item.recipe.recipe_id;
      if (recipeId) {
        console.log('✅ 분석 완료 항목 클릭 - 레시피로 이동:', { recipeId, recipe: item.recipe });
        (navigation as any).navigate('Summary', { recipeId, recipe: item.recipe });
      } else {
        console.warn('⚠️ recipeId 없음:', item.recipe);
      }
    } else {
      console.log('⏳ 분석 미완료 또는 레시피 없음:', { status: item.status, hasRecipe: !!item.recipe });
    }
  };

  const handleDelete = (videoId: string) => {
    Alert.alert(
      '삭제 확인',
      '이 분석 기록을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => removeFromHistory(videoId),
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      '전체 삭제',
      '모든 분석 기록을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '전체 삭제',
          style: 'destructive',
          onPress: clearHistory,
        },
      ]
    );
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processing':
        return '분석 중';
      case 'completed':
        return '완료';
      case 'error':
        return '오류';
      default:
        return '대기';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return '#FF6B35';
      case 'completed':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const renderItem = ({ item }: { item: AnalysisItem }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => handleItemPress(item)}
      disabled={item.status !== 'completed'}
      activeOpacity={0.7}
    >
      <View style={styles.itemContent}>
        {item.thumbnail ? (
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.placeholderThumb]}>
            <Ionicons name="videocam-outline" size={24} color="#999" />
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title || '제목 없음'}
          </Text>
          <Text style={styles.channel} numberOfLines={1}>
            {item.channelTitle || '채널 정보 없음'}
          </Text>
          <View style={styles.meta}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
            {item.status === 'processing' && (
              <View style={styles.progressInfo}>
                <ActivityIndicator size="small" color="#FF6B35" />
                <Text style={styles.progressText}>{Math.round(item.progress)}%</Text>
              </View>
            )}
            <Text style={styles.timeText}>{formatDate(item.startedAt)}</Text>
          </View>
          {item.status === 'error' && !!item.error && (
            <Text style={styles.errorText} numberOfLines={2}>{item.error}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.videoId)}
        >
          <Ionicons name="close-circle" size={24} color="#999" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>분석 기록</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
            <Text style={styles.clearText}>전체 삭제</Text>
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="analytics-outline" size={64} color="#CCC" />
          <Text style={styles.emptyTitle}>분석 기록이 없습니다</Text>
          <Text style={styles.emptySubtitle}>
            영상을 분석하면 여기에 기록이 표시됩니다
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.videoId}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  clearBtn: {
    padding: 8,
  },
  clearText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  item: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
  },
  placeholderThumb: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  channel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressText: {
    fontSize: 11,
    color: '#FF6B35',
    fontWeight: '600',
  },
  timeText: {
    fontSize: 11,
    color: '#999',
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: '#F44336',
  },
  deleteBtn: {
    padding: 4,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

