import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GoogleSignInButton from './GoogleSignInButton';

export default function AuthScreen() {
  const handleSignInSuccess = () => {
    // 로그인 성공 시 AuthContext가 자동으로 상태를 업데이트하여 메인 화면으로 이동
    console.log('로그인 성공! 메인 화면으로 이동합니다.');
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/app_logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Cookit</Text>
        </View>
        
        <Text style={styles.subtitle}>
          AI 기반 요리 레시피 추천 및 관리 플랫폼
        </Text>

        {/* 핵심 기능 소개 */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="play-circle" size={32} color="#FF6B35" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>요리 레시피 재생</Text>
              <Text style={styles.featureDescription}>
                YouTube 영상을 분석하여 레시피를 자동 추출하고, 단계별 조리 가이드를 제공합니다
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="home-outline" size={32} color="#FF6B35" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>냉장고 관리</Text>
              <Text style={styles.featureDescription}>
                영수증 OCR로 재료를 자동 등록하고, 유통기한을 관리하여 음식 낭비를 줄입니다
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="people-outline" size={32} color="#FF6B35" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>커뮤니티</Text>
              <Text style={styles.featureDescription}>
                레시피를 공유하고 다른 사용자들과 요리 경험을 나누는 커뮤니티 공간입니다
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <GoogleSignInButton onSuccess={handleSignInSuccess} />
        </View>
        
        <Text style={styles.footerText}>
          로그인하여 개인 맞춤 레시피를 받아보세요
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF6B35',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});