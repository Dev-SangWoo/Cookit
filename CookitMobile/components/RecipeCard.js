import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 양쪽 여백 24px씩, 카드 간격 고려

const RecipeCard = ({ 
  recipe, 
  onPress, 
  onFavorite, 
  onSave,
  showActions = true,
  style = {}
}) => {
  const {
    recipe_id,
    id,
    title,
    description,
    cook_time,
    difficulty_level,
    servings,
    view_count,
    favorite_count,
    ai_generated,
    image_url,
    thumbnail,
    image_urls,
    user_relationship
  } = recipe;

  // 썸네일 우선순위: thumbnail > image_url > image_urls[0]
  const displayImage = thumbnail || image_url || (image_urls && image_urls[0]);

  // 서버 데이터 구조에 맞게 필드 매핑
  const cooking_time = cook_time;
  const difficulty = difficulty_level;

  const isSaved = user_relationship?.some(rel => rel.type === 'saved');
  const isFavorited = user_relationship?.some(rel => rel.type === 'favorited');

  const getDifficultyColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const formatTime = (minutes) => {
    if (!minutes) return '미정';
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
  };

  return (
    <TouchableOpacity 
      style={[styles.card, style]} 
      onPress={() => onPress(recipe)}
      activeOpacity={0.8}
    >
      {/* 이미지 영역 */}
      <View style={styles.imageContainer}>
        {displayImage ? (
          <Image source={{ uri: displayImage }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="restaurant-outline" size={32} color="#9E9E9E" />
          </View>
        )}
        
        {/* AI 생성 배지 */}
        {ai_generated && (
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={12} color="#FFF" />
            <Text style={styles.aiBadgeText}>AI</Text>
          </View>
        )}

        {/* 액션 버튼들 */}
        {showActions && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, isFavorited && styles.favorited]}
              onPress={() => onFavorite(recipe_id, !isFavorited)}
            >
              <Ionicons 
                name={isFavorited ? "heart" : "heart-outline"} 
                size={16} 
                color={isFavorited ? "#FFF" : "#666"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, isSaved && styles.saved]}
              onPress={() => onSave(recipe_id, !isSaved)}
            >
              <Ionicons 
                name={isSaved ? "bookmark" : "bookmark-outline"} 
                size={16} 
                color={isSaved ? "#FFF" : "#666"} 
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 컨텐츠 영역 */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>

        {/* 메타 정보 */}
        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={12} color="#666" />
              <Text style={styles.metaText}>{formatTime(cooking_time)}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={12} color="#666" />
              <Text style={styles.metaText}>{servings || '미정'}인분</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(difficulty) }]}>
              <Text style={styles.difficultyText}>
                {difficulty === 'easy' ? '쉬움' : difficulty === 'medium' ? '보통' : difficulty === 'hard' ? '어려움' : '미정'}
              </Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="eye-outline" size={12} color="#999" />
                <Text style={styles.statText}>{view_count || 0}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Ionicons name="heart-outline" size={12} color="#999" />
                <Text style={styles.statText}>{favorite_count || 0}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#6366F1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  aiBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  actionButtons: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favorited: {
    backgroundColor: '#FF6B6B',
  },
  saved: {
    backgroundColor: '#4ECDC4',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    lineHeight: 18,
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  metaContainer: {
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#666',
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  difficultyText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statText: {
    fontSize: 11,
    color: '#999',
  },
});

export default RecipeCard;
