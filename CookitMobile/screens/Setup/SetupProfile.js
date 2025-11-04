import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile } from '../../services/userApi';

export default function SetupProfile({ navigation }) {
    const { user, updateUserProfile } = useAuth();
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
    const [bio, setBio] = useState(user?.bio || '');

    const handleBack = () => {
        navigation.goBack();
    };

    const pickImage = async (source = 'library') => {
        if (source === 'camera') {
            // 카메라 권한 요청
            const { granted } = await ImagePicker.requestCameraPermissionsAsync();
            if (!granted) {
                Alert.alert('권한 필요', '사진을 촬영하려면 카메라 접근 권한이 필요합니다.');
                return;
            }

            // 카메라 실행
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                setAvatarUrl(result.assets[0].uri);
            }
        } else {
            // 갤러리 권한 요청
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) {
            Alert.alert('권한 필요', '사진을 선택하려면 갤러리 접근 권한이 필요합니다.');
            return;
        }

            // 갤러리 실행
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setAvatarUrl(result.assets[0].uri);
            }
        }
    };

    const handleNext = async () => {
        if (!bio.trim()) {
            Alert.alert('오류', '자기소개를 입력해주세요.');
            return;
        }

        try {
            // 서버 API를 통해 프로필 업데이트
            await updateProfile({
                avatar_url: avatarUrl,
                bio,
            });

            // AuthProvider의 상태를 업데이트합니다.
            await updateUserProfile({
                avatar_url: avatarUrl,
                bio,
            });

            navigation.navigate('SetupPreference');
        } catch (error) {
            console.error('저장 오류:', error);
            Alert.alert('저장 오류', error.message || '프로필 정보 저장 중 문제가 발생했습니다.');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* 헤더 */}
                <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.step}>2/4</Text>
                </View>

                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
            <Text style={styles.title}>프로필 사진, 자기소개</Text>
                    <Text style={styles.titleText}>
                        본인을 표현할 수 있는{"\n"}프로필 사진과 자기소개를 입력해주세요
                    </Text>

                    {/* 프로필 사진 섹션 */}
                    <View style={styles.avatarSection}>
            <Text style={styles.sectionTitle}>프로필 사진</Text>
                        <View style={styles.avatarRow}>
                            {avatarUrl ? (
                                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Ionicons name="person" size={40} color="#ccc" />
                                </View>
                            )}
                            <View style={styles.imageButtonContainer}>
                                <TouchableOpacity onPress={() => pickImage('library')} style={styles.imageButton}> 
                                    <Ionicons name="images-outline" size={18} color="#FF6B35" />
                                    <Text style={styles.imageButtonText}>사진 선택</Text>
            </TouchableOpacity>
                                <TouchableOpacity onPress={() => pickImage('camera')} style={[styles.imageButton, styles.cameraButton]}> 
                                    <Ionicons name="camera-outline" size={18} color="#FF6B35" />
                                    <Text style={styles.imageButtonText}>사진 촬영</Text>
            </TouchableOpacity>
            </View>
                        </View>
                        <Text style={styles.hintText}>Google 프로필 사진을 사용할 수도 있어요</Text>
                    </View>

                    {/* 자기소개 섹션 */}
                    <View style={styles.bioSection}>
            <Text style={styles.sectionTitle}>자기소개</Text>
            <TextInput
                            style={styles.multilineInput}
                            placeholder="예) 요리를 좋아하는 주부입니다.&#10;매일 새로운 레시피에 도전하고 있어요!"
                            placeholderTextColor="#999"
                value={bio}
                onChangeText={setBio}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
            />
                        <Text style={styles.charCount}>{bio.length} / 150</Text>
                    </View>
                </ScrollView>

                {/* 하단 고정 버튼 */}
                <View style={styles.fixedFooter}>
  <TouchableOpacity
                        style={[styles.buttonNext, !bio.trim() && styles.buttonDisabled]}
    onPress={handleNext}
                        disabled={!bio.trim()}
  >
    <Text style={styles.buttonText}>다음</Text>
  </TouchableOpacity>
</View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
   container: {
    flex: 1, 
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
  },
    backButton: {
        padding: 8,
        marginRight: 12,
    },
    step: {
        color: '#FF6B35',
        fontSize: 16,
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 100,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    titleText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
        lineHeight: 24,
    },
    avatarSection: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 25,
        borderWidth: 3,
        borderColor: '#FF6B35',
        backgroundColor: '#f0f0f0',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 25,
        borderWidth: 3,
        borderColor: '#ddd',
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageButtonContainer: {
        flex: 1,
        marginLeft: 20,
        justifyContent: 'center',
    },
    imageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F2',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#FF6B35',
        marginBottom: 10,
        gap: 6,
    },
    cameraButton: {
        marginTop: 0,
    },
    imageButtonText: {
        color: '#FF6B35',
        fontWeight: '600',
        fontSize: 14,
    },
    hintText: {
        fontSize: 13,
        color: '#999',
        textAlign: 'center',
        marginTop: 8,
    },
    bioSection: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    multilineInput: {
        width: '100%',
        minHeight: 100,
        maxHeight: 150,
        borderWidth: 1.5,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 14,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#fff',
        lineHeight: 22,
    },
    charCount: {
        textAlign: 'right',
        fontSize: 12,
        color: '#999',
        marginTop: 8,
    },
    fixedFooter: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
  },
  buttonNext: {
        backgroundColor: '#FF6B35',
        borderRadius: 25,
    width: '100%',
        paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonDisabled: {
        backgroundColor: '#ddd',
        shadowOpacity: 0,
        elevation: 0,
  },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});