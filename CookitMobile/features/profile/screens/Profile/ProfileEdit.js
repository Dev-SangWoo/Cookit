// 프로필 정보 수정 화면

import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@features/auth/contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker'; 
import SetupPreferenceModal from '@features/profile/screens/SetupPreferenceModal';
import { getMyProfile, updateProfile, checkNicknameAvailability, getRecipeCategoryNames } from '@features/profile/services/userApi'; 

export default function ProfileEdit({ navigation }) {
    const { user, updateUserProfile } = useAuth();
    const [initialProfile, setInitialProfile] = useState(null);
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    
    const [favoriteCuisines, setFavoriteCuisines] = useState([]);
    const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
    
    const [avatarUrl, setAvatarUrl] = useState(''); 
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // 모달 상태 및 옵션
    const [isCuisineModalVisible, setCuisineModalVisible] = useState(false);
    const [isAllergenModalVisible, setAllergenModalVisible] = useState(false);
    const [favoriteOptions, setFavoriteOptions] = useState([]); 
    
    const allergenOptions = [
        '우유', '계란', '밀', '콩', '땅콩', '견과류', '갑각류', '생선', '조개류' // 추가할 것 있으면 추가 가능
    ];

    // 취소 버튼 핸들러: 뒤로 가기
    const handleCancel = () => {
        navigation.goBack();
    };

    // 1. 프로필 데이터 및 카테고리 로드
    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                Alert.alert('오류', '유저 정보를 가져올 수 없습니다.');
                return;
            }
            setLoading(true);

            try {
                // 1-1. 서버 API를 통해 프로필 데이터 로드
                const profileData = await getMyProfile();
                setInitialProfile(profileData);
                setDisplayName(profileData.display_name || '');
                setBio(profileData.bio || '');
                setFavoriteCuisines(profileData.favorite_cuisines || []);
                setDietaryRestrictions(profileData.dietary_restrictions || []);
                setAvatarUrl(profileData.avatar_url || 'https://via.placeholder.com/120');

                // 1-2. 서버 API를 통해 레시피 카테고리 로드
                const categoryNames = await getRecipeCategoryNames();
                setFavoriteOptions(categoryNames);
            } catch (error) {
                console.error("데이터 로드 오류:", error);
                Alert.alert('로딩 실패', error.message || '데이터를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // 2. 이미지 선택 핸들러
    const pickImage = async (mode = 'library') => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) {
            Alert.alert('권한 필요', '사진을 선택하려면 갤러리 접근 권한이 필요합니다.');
            return;
        }

        let result;
        if (mode === 'library') {
            result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });
        } else if (mode === 'camera') {
            const { granted: cameraGranted } = await ImagePicker.requestCameraPermissionsAsync();
            if (!cameraGranted) {
                Alert.alert('권한 필요', '사진을 찍으려면 카메라 접근 권한이 필요합니다.');
                return;
            }
            result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });
        }

        if (!result.canceled) {
            setAvatarUrl(result.assets[0].uri);
        }
    };
    
    // 3. 닉네임 중복 확인 (서버 API 사용)
    const checkNicknameAvailable = async (newDisplayName) => {
        try {
            // 현재 닉네임과 같으면 중복 확인 건너뛰기
            if (initialProfile && newDisplayName === initialProfile.display_name) {
                return true;
            }
            return await checkNicknameAvailability(newDisplayName);
        } catch (error) {
            console.error('닉네임 확인 오류:', error);
            return false;
        }
    };


    // 4. 태그 삭제 핸들러
    const handleRemoveCuisine = (cuisineToRemove) => {
        setFavoriteCuisines(prev => prev.filter(cuisine => cuisine !== cuisineToRemove));
    };

    const handleRemoveAllergen = (allergenToRemove) => {
        setDietaryRestrictions(prev => prev.filter(allergen => allergen !== allergenToRemove));
    };


    // 5. 저장 버튼 핸들러 (서버 API 사용)
    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        
        if (!displayName.trim()) {
            Alert.alert('오류', '닉네임을 입력해주세요.');
            setIsSaving(false);
            return;
        }
        if (!bio.trim()) {
            Alert.alert('오류', '자기소개를 입력해주세요.');
            setIsSaving(false);
            return;
        }

        const isAvailable = await checkNicknameAvailable(displayName);
        if (!isAvailable) {
            Alert.alert('저장 실패', '이미 사용 중인 닉네임입니다.');
            setIsSaving(false);
            return;
        }

        try {
            const updates = {
                display_name: displayName,
                bio: bio,
                favorite_cuisines: favoriteCuisines, 
                dietary_restrictions: dietaryRestrictions, 
                avatar_url: avatarUrl,
            };

            // 서버 API를 통해 프로필 업데이트
            await updateProfile(updates);

            // AuthContext 업데이트
            await updateUserProfile(updates);

            Alert.alert('저장 성공', '프로필 정보가 성공적으로 업데이트되었습니다.');
            navigation.goBack(); // ProfileMain으로 돌아가기
            
        } catch (error) {
            Alert.alert('저장 실패', `업데이트 중 오류가 발생했습니다: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || !initialProfile) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>프로필 정보를 가져오는 중...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* 전체 화면을 덮는 View로 스크롤 영역과 고정 영역 분리 */}
            <View style={styles.fullScreenContainer}> 
                
                {/* 스크롤되는 내용 */}
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.headerContainer}>
                        <Image 
                            source={require('@assets/app_logo.png')} 
                            style={styles.headerLogo}
                            resizeMode="contain"
                        />
                    <Text style={styles.headerTitle}>프로필 수정</Text>
                    </View>
                    
                    {/* 프로필 사진 수정 */}
                    <View style={styles.avatarRow}>
                        <Image
                            source={{ uri: avatarUrl }}
                            style={styles.avatar}
                        />
                        <View style={styles.imageButtonContainer}>
                            <TouchableOpacity onPress={() => pickImage('library')} style={styles.imageButton}>
                                <Text style={styles.imageButtonText}>사진 선택</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => pickImage('camera')} style={[styles.imageButton, { marginLeft: 10 }]}>
                                <Text style={styles.imageButtonText}>사진 촬영</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 닉네임 수정 */}
                    <Text style={styles.label}>닉네임</Text>
                    <TextInput
                        style={styles.input}
                        value={displayName}
                        onChangeText={setDisplayName}
                        placeholder="사용할 닉네임을 입력하세요"
                        placeholderTextColor="#999"
                        autoCapitalize="none"
                    />
                    
                    {/* 자기소개 수정 */}
                    <Text style={styles.label}>자기소개</Text>
                    <TextInput
                        style={[styles.input, styles.multilineInput]}
                        value={bio}
                        onChangeText={setBio}
                        placeholder="자신을 간단히 소개해주세요."
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={4}
                    />
                    
                    {/* 선호 재료 수정 (모달 연동) */}
                    <Text style={styles.label}>선호 요리</Text>
                    <View style={styles.tagDisplayContainer}>
                        <View style={styles.tagDisplayRow}>
                            {favoriteCuisines.map((tag, index) => (
                                <TouchableOpacity 
                                    key={`fav-${index}`} 
                                    style={styles.tagBadge}
                                    onPress={() => handleRemoveCuisine(tag)} 
                                >
                                    <Text style={styles.tagText}>{tag} ×</Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => setCuisineModalVisible(true)}
                            >
                                <Text style={styles.addButtonText}>+ 추가</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/* 선호 재료 선택 모달 */}
                    <SetupPreferenceModal
                        visible={isCuisineModalVisible}
                        options={favoriteOptions}
                        selected={favoriteCuisines}
                        onClose={() => setCuisineModalVisible(false)}
                        onSelect={setFavoriteCuisines}
                    />

                    {/* 비선호 재료 수정 (모달 연동) */}
                    <Text style={styles.label}>비선호 재료/알레르기</Text>
                    <View style={styles.tagDisplayContainer}>
                        <View style={styles.tagDisplayRow}>
                            {dietaryRestrictions.map((tag, index) => (
                                <TouchableOpacity 
                                    key={`dis-${index}`} 
                                    style={[styles.tagBadge, styles.dislikeTag]}
                                    onPress={() => handleRemoveAllergen(tag)} 
                                >
                                    <Text style={styles.tagText}>{tag} ×</Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                style={[styles.addButton, styles.dislikeAddButton]}
                                onPress={() => setAllergenModalVisible(true)}
                            >
                                <Text style={styles.addButtonText}>+ 추가</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/* 비선호 재료 선택 모달 */}
                    <SetupPreferenceModal
                        visible={isAllergenModalVisible}
                        options={allergenOptions}
                        selected={dietaryRestrictions}
                        onClose={() => setAllergenModalVisible(false)}
                        onSelect={setDietaryRestrictions}
                    />
                </ScrollView>

                {/* 하단 고정 버튼 컨테이너 */}
                <View style={styles.fixedFooter}>
                    <View style={styles.buttonContainer}>
                        {/* 취소 버튼 */}
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancel}
                            disabled={isSaving} 
                        >
                            <Text style={styles.cancelButtonText}>취소</Text>
                        </TouchableOpacity>

                        {/* 저장 버튼 */}
                        <TouchableOpacity
                            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>수정 완료</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
  
    fullScreenContainer: {
        flex: 1,
    },

    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,

        paddingBottom: 100, 
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#555',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    headerLogo: {
        width: 32,
        height: 32,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },

    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
        width: '100%',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 25,
        borderWidth: 3,
        borderColor: '#ccc',
        backgroundColor: '#f0f0f0'
    },
    imageButtonContainer: {
        flex: 1,
        marginLeft: 20,
        justifyContent: 'center',
    },
    imageButton: {
        backgroundColor: '#EAEAEA',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    imageButtonText: {
        color: '#333',
        fontWeight: '600',
        fontSize: 14,
    },

    label: {
        fontSize: 16,
        fontWeight: '600',
        alignSelf: 'flex-start',
        marginTop: 15,
        marginBottom: 5,
        color: '#333',
    },
    input: {
        width: '100%',
        minHeight: 45,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    multilineInput: {
        height: 70,
        paddingVertical: 10,
        textAlignVertical: 'top',
    },

    tagDisplayContainer: {
        minHeight: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#f9f9f9',
        justifyContent: 'center',
        marginBottom: 10,
    },
    tagDisplayRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8, 
    },
    tagBadge: {
        backgroundColor: '#E6F0FF',
        borderRadius: 15,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#9EC5FE',
    },
    dislikeTag: {
        backgroundColor: '#FFECEC', 
        borderColor: '#FFC8C8',
    },
    tagText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '500',
    },
    addButton: {
        backgroundColor: '#EAEAEA', 
        borderRadius: 15,
        paddingVertical: 5,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    dislikeAddButton: {
        backgroundColor: '#EAEAEA',
        borderColor: '#ccc',
    },
    addButtonText: {
        color: '#555',
        fontSize: 14,
        fontWeight: '600',
    },

    fixedFooter: {
        paddingHorizontal: 20, 
        paddingVertical: 10, 
        backgroundColor: '#fff', 
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        borderBottomColor: '#f0f0f0',
        borderBottomWidth: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10, 
    },
    
    cancelButton: {
        flex: 1, 
        backgroundColor: '#ddd', 
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#333',
        fontSize: 18,
        fontWeight: 'bold',
    },
    saveButton: {
        flex: 1, 
        backgroundColor: '#4CAF50', 
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: '#A5D6A7',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
