import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@features/auth/contexts/AuthContext';
import { addReceiptItemsBulk } from '@features/refrigerator/services/receiptItemsApi';

const ReceiptMain = () => {
  const { user } = useAuth();
  const [ocrItems, setOcrItems] = useState([]); // OCR 결과 (로컬)
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // 카메라로 영수증 촬영
  const handleCameraCapture = async () => {
    try {
      // 카메라 권한 요청
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) {
        Alert.alert('권한 필요', '영수증을 촬영하려면 카메라 접근 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        await processReceiptImage(result.assets[0]);
      }
    } catch (error) {
      console.error('카메라 촬영 오류:', error);
      Alert.alert('오류', '카메라를 사용할 수 없습니다.');
    }
  };

  // 갤러리에서 영수증 이미지 선택
  const handleImagePicker = async () => {
    try {
      // 갤러리 권한 요청
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert('권한 필요', '사진을 선택하려면 갤러리 접근 권한이 필요합니다.');
        return;
      }

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
        // OCR 결과를 로컬 state에 저장 (DB 저장 안 함)
        const itemsWithId = data.data.items.map((item, index) => ({
          ...item,
          id: `temp_${Date.now()}_${index}`,
          unit: 'g', // 기본 단위
          expiration_date: '', // 유통기한 비어있음
          storage_type: '냉장', // 기본 보관 방법
        }));
        setOcrItems(itemsWithId);
        Alert.alert(
          'OCR 완료',
          `${data.data.totalItems}개의 상품을 인식했습니다.\n수정 후 저장 버튼을 눌러주세요.`
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

  // 아이템 수정 모달 열기
  const openEditModal = (item) => {
    setEditingItem({ ...item });
    setEditModalVisible(true);
  };

  // 아이템 수정 저장
  const saveEditedItem = () => {
    setOcrItems(ocrItems.map(item => 
      item.id === editingItem.id ? editingItem : item
    ));
    setEditModalVisible(false);
    setEditingItem(null);
  };

  // 아이템 삭제
  const deleteItem = (itemId) => {
    setOcrItems(ocrItems.filter(item => item.id !== itemId));
  };

  // 냉장고에 저장
  const saveToFridge = async () => {
    if (ocrItems.length === 0) {
      Alert.alert('알림', '저장할 재료가 없습니다.');
      return;
    }

    try {
      setLoading(true);

      // receipt_items 테이블에 bulk insert
      const items = ocrItems.map(item => ({
        name: item.product_name,
        quantity: item.quantity || 1,
        unit: item.unit || 'g',
        expiration_date: item.expiration_date || null,
        storage_type: item.storage_type || '냉장',
      }));

      await addReceiptItemsBulk(items);

      Alert.alert(
        '저장 완료',
        `${ocrItems.length}개의 재료가 냉장고에 추가되었습니다!`,
        [
          {
            text: '확인',
            onPress: () => {
              setOcrItems([]); // 저장 후 초기화
            }
          }
        ]
      );
    } catch (error) {
      console.error('저장 오류:', error);
      Alert.alert('저장 실패', error.message || '냉장고에 저장하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 아이템 카드 렌더링
  const renderItem = ({ item }) => {
    const storageTypeIcon = item.storage_type === '냉동' ? '🧊' : item.storage_type === '실온' ? '🏠' : '❄️';
    const storageTypeColor = item.storage_type === '냉동' ? '#2196F3' : item.storage_type === '실온' ? '#FF9800' : '#4CAF50';
    
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemInfo}>
          <View style={styles.itemHeader}>
            <View style={styles.itemNameContainer}>
              <Text style={styles.itemName} numberOfLines={1}>{item.product_name}</Text>
            </View>
            {item.storage_type && (
              <View style={[styles.storageTypeBadge, { backgroundColor: storageTypeColor + '15', borderColor: storageTypeColor }]}>
                <Text style={styles.storageTypeBadgeIcon}>{storageTypeIcon}</Text>
                <Text style={[styles.storageTypeBadgeText, { color: storageTypeColor }]}>
                  {item.storage_type}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.itemDetailsContainer}>
            <View style={styles.detailRow}>
              <Ionicons name="cube-outline" size={14} color="#6C757D" />
              <Text style={styles.itemDetails}>
                {item.quantity} {item.unit || '개'}
              </Text>
            </View>
            {item.expiration_date && (
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={14} color="#6C757D" />
                <Text style={styles.itemDetails}>
                  {item.expiration_date}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditModal(item)}
            activeOpacity={0.7}
          >
            <View style={styles.editButtonInner}>
              <Ionicons name="create-outline" size={18} color="#4CAF50" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteItem(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.deleteButtonInner}>
              <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>처리 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>영수증 인식</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.cameraButton} onPress={handleCameraCapture}>
          <Ionicons name="camera" size={24} color="#fff" />
        </TouchableOpacity>
          <TouchableOpacity style={styles.galleryButton} onPress={handleImagePicker}>
            <Ionicons name="images-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 인식된 아이템 목록 */}
      {ocrItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color="#CCC" />
          <Text style={styles.emptyTitle}>영수증을 인식해주세요</Text>
          <Text style={styles.emptySubtitle}>
            카메라 버튼으로 촬영하거나{'\n'}
            사진 버튼으로 갤러리에서 선택하면{'\n'}
            자동으로 상품을 인식합니다
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.infoBar}>
            <Text style={styles.infoText}>
              📦 {ocrItems.length}개 인식됨
            </Text>
            <Text style={styles.infoSubText}>
              수정 후 저장하세요
            </Text>
          </View>
          <FlatList
            data={ocrItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />

          {/* 저장 버튼 */}
          <TouchableOpacity style={styles.saveButton} onPress={saveToFridge}>
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
            <Text style={styles.saveButtonText}>냉장고에 저장</Text>
          </TouchableOpacity>
        </>
      )}

      {/* 수정 모달 */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>재료 수정</Text>

            <Text style={styles.label}>상품명</Text>
            <TextInput
              style={styles.input}
              value={editingItem?.product_name}
              onChangeText={(text) => setEditingItem({ ...editingItem, product_name: text })}
            />

            <Text style={styles.label}>수량</Text>
            <TextInput
              style={styles.input}
              value={String(editingItem?.quantity || '')}
              onChangeText={(text) => setEditingItem({ ...editingItem, quantity: parseInt(text) || 1 })}
              keyboardType="numeric"
            />

            <Text style={styles.label}>단위</Text>
            <TextInput
              style={styles.input}
              value={editingItem?.unit}
              onChangeText={(text) => setEditingItem({ ...editingItem, unit: text })}
              placeholder="예: g, ml, 개"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>유통기한 (선택)</Text>
            <TextInput
              style={styles.input}
              value={editingItem?.expiration_date}
              onChangeText={(text) => setEditingItem({ ...editingItem, expiration_date: text })}
              placeholder="예: 2025-12-31"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>보관 방법</Text>
            <View style={styles.storageTypeContainer}>
              {['냉장', '냉동', '실온'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.storageTypeButton,
                    editingItem?.storage_type === type && styles.storageTypeButtonSelected
                  ]}
                  onPress={() => setEditingItem({ ...editingItem, storage_type: type })}
                >
                  <Text style={[
                    styles.storageTypeButtonText,
                    editingItem?.storage_type === type && styles.storageTypeButtonTextSelected
                  ]}>
                    {type === '냉장' ? '❄️' : type === '냉동' ? '🧊' : '🏠'} {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={saveEditedItem}
              >
                <Text style={styles.confirmButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#212529',
    letterSpacing: -0.5,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  galleryButton: {
    backgroundColor: '#4CAF50',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cameraButton: {
    backgroundColor: '#FF6B35',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  infoBar: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  infoText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  infoSubText: {
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  itemNameContainer: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#212529',
    lineHeight: 22,
  },
  storageTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 5,
    minWidth: 60,
    justifyContent: 'center',
  },
  storageTypeBadgeIcon: {
    fontSize: 14,
  },
  storageTypeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  itemDetailsContainer: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemDetails: {
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '500',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  editButton: {
    padding: 4,
  },
  editButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  saveButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 0,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#495057',
    marginTop: 24,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#ADB5BD',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6C757D',
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#212529',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E9ECEF',
  },
  cancelButtonText: {
    color: '#495057',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#FF6B35',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  storageTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  storageTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    borderWidth: 2,
    borderColor: '#F0F0F0',
    alignItems: 'center',
  },
  storageTypeButtonSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  storageTypeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  storageTypeButtonTextSelected: {
    color: '#2196F3',
    fontWeight: '700',
  },
});

export default ReceiptMain;
