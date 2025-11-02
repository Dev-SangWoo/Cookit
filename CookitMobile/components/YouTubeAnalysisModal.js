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
import { WebView } from 'react-native-webview';

const YouTubeAnalysisModal = ({
  visible,
  onClose,
  onConfirm,
  video,
  isAnalyzing = false,
}) => {
  if (!video) return null;

  const extractVideoId = (v) => {
    if (!v) return '';
    if (v.videoId) return v.videoId;
    const url = v.url || v.videoUrl || v.link || '';
    const m = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/) || url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
    return m ? m[1] : '';
  };

  const getYouTubeHTML = (videoId) => {
    if (!videoId) return '<html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100%">영상 미리보기를 불러올 수 없습니다</body></html>';
    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <style>
    html, body { margin:0; padding:0; background:#000; height:100%; overflow:hidden; }
    .wrap { position:relative; width:100%; height:100%; }
    iframe { position:absolute; inset:0; width:100%; height:100%; border:0; }
  </style>
  <script>
    Object.defineProperty(document, 'referrer', { value: 'https://com.cookit.app', writable: false });
  </script>
  </head>
<body>
  <div class="wrap">
    <iframe
      src="https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&playsinline=1&enablejsapi=1&rel=0&modestbranding=1"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"
    ></iframe>
  </div>
</body>
</html>`;
  };

  const videoId = extractVideoId(video);

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
            <WebView
              originWhitelist={["*"]}
              source={{ html: getYouTubeHTML(videoId), baseUrl: 'https://com.cookit.app' }}
              style={styles.webview}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled
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



