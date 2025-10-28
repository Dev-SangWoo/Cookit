import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';

const ReceiptMain = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [categorizedItems, setCategorizedItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user) {
      loadReceiptItems();
      loadStats();
    }
  }, [user]);

  // 영수증 아이템 로드
  const loadReceiptItems = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';
      const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
      
      const response = await fetch(`${baseUrl}/receipt-list/items/${user.id}`);
      const data = await response.json();

      if (data.success) {
        setItems(data.data.items);
        setCategorizedItems(data.data.categorizedItems);
      }
    } catch (error) {
      console.error('영수증 아이템 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 통계 로드
  const loadStats = async () => {
    try {
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';
      const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
      
      const response = await fetch(`${baseUrl}/receipt-list/stats/${user.id}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('통계 로드 오류:', error);
    }
  };

  // 영수증 이미지 선택 및 OCR 처리
  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        await processReceiptImage(result.assets[0]);
      }
    } catch (error) {
      console.error('이미지 선택 오류:', error);
      Alert.alert('오류', '이미지를 선택할 수 없습니다.');
    }
  };

  // 영수증 OCR 처리
  const processReceiptImage = async (imageAsset) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('receipt', {
        uri: imageAsset.uri,
        type: 'image/jpeg',
        name: 'receipt.jpg',
      });
      formData.append('userId', user.id);

      const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';
      const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
      
      const response = await fetch(`${baseUrl}/receipt-list/process`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          'OCR 완료',
          `${data.data.totalItems}개의 상품을 추출했습니다.`,
          [
            {
              text: '확인',
              onPress: () => {
                loadReceiptItems();
                loadStats();
              }
            }
          ]
        );
      } else {
        Alert.alert('오류', data.error || 'OCR 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('OCR 처리 오류:', error);
      Alert.alert('오류', 'OCR 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 아이템 삭제
  const deleteItem = async (itemId) => {
    try {
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';
      const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
      
      const response = await fetch(`${baseUrl}/receipt-list/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (data.success) {
        loadReceiptItems();
        loadStats();
      } else {
        Alert.alert('오류', '아이템 삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('아이템 삭제 오류:', error);
      Alert.alert('오류', '아이템 삭제 중 오류가 발생했습니다.');
    }
  };

  // 통계 카드 컴포넌트
  const StatsCard = ({ title, value, icon }) => (
    <View style={styles.statsCard}>
      <Ionicons name={icon} size={24} color="#FF6B6B" />
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsTitle}>{title}</Text>
    </View>
  );

  // 아이템 카드 컴포넌트
  const ItemCard = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.product_name}</Text>
        <Text style={styles.itemDetails}>
          수량: {item.quantity}개
          {item.unit && ` | 단위: ${item.unit}`}
          {item.expiry_date && ` | 유통기한: ${item.expiry_date}`}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteItem(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  // 카테고리별 아이템 렌더링
  const renderCategorySection = (category, items) => {
    if (!items || items.length === 0) return null;

    return (
      <View key={category} style={styles.categorySection}>
        <Text style={styles.categoryTitle}>{category} ({items.length}개)</Text>
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>영수증을 처리하는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>영수증 목록</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleImagePicker}>
          <Ionicons name="camera" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {stats && (
        <View style={styles.statsContainer}>
          <StatsCard
            title="총 상품"
            value={`${stats.totalItems}개`}
            icon="basket-outline"
          />
          <StatsCard
            title="카테고리"
            value={`${Object.keys(categorizedItems).length}개`}
            icon="list-outline"
          />
        </View>
      )}

      <ScrollView style={styles.content}>
        {Object.keys(categorizedItems).map(category => 
          renderCategorySection(category, categorizedItems[category])
        )}
        
        {items.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>영수증이 없습니다</Text>
            <Text style={styles.emptySubtitle}>카메라 버튼을 눌러 영수증을 추가해보세요</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#FF6B6B',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statsTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categorySection: {
    marginTop: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default ReceiptMain;
