import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import YouTubePlayer from '@features/recipe/components/YouTubePlayer';

const YouTubeAnalysisModal = ({
  visible,
  onClose,
  onConfirm,
  video,
  isAnalyzing = false,
}) => {
  if (!video) return null;

  // YouTubePlayer 컴포넌트가 자체적으로 videoId를 추출하므로, videoId 또는 videoUrl만 전달
  const videoId = video.videoId || null;
  const videoUrl = video.url || video.videoUrl || video.link || null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.title}>영상 분석</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* 영상 미리보기 */}
          <View style={styles.playerBox}>
            <YouTubePlayer
              videoId={videoId}
              videoUrl={videoUrl}
              autoplay={false}
              height={220}
              showErrorUI={true}
            />
          </View>

          {/* 영상 정보 */}
          <View style={styles.videoInfo}>
            <Image source={{ uri: video.thumbnail }} style={styles.thumbnail} />
            <View style={styles.videoDetails}>
              <Text style={styles.videoTitle} numberOfLines={2}>
                {video.title}
              </Text>
              <Text style={styles.channelTitle}>{video.channelTitle}</Text>
            </View>
          </View>

          {/* 분석 설명 */}
          <View style={styles.descriptionContainer}>
            <Ionicons name="analytics-outline" size={24} color="#FF6B6B" />
            <Text style={styles.description}>
              이 영상을 분석하여 레시피를 추출하시겠습니까?
            </Text>
            <Text style={styles.subDescription}>
              AI가 영상 내용을 분석하여 재료, 조리법, 요리 시간 등을 자동으로 추출합니다.
            </Text>
          </View>

          {/* 버튼들 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isAnalyzing}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <View style={styles.analyzingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.confirmButtonText}>분석 중...</Text>
                </View>
              ) : (
                <Text style={styles.confirmButtonText}>분석하기</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  videoInfo: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  playerBox: {
    width: '100%',
    height: 220,
    backgroundColor: '#000',
  },
  webview: {
    width: '100%',
    height: '100%',
  },
  thumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  videoDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  channelTitle: {
    fontSize: 12,
    color: '#666',
  },
  descriptionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  subDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#FF6B6B',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  analyzingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default YouTubeAnalysisModal;



