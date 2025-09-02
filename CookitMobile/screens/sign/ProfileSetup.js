import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function ProfileSetup({ navigation }) {
    const { user, updateUserProfile } = useAuth(); // updateUserProfile 함수도 가져옵니다.
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [cookingLevel, setCookingLevel] = useState(user?.cooking_level || '');

    const pickImage = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) {
            Alert.alert('권한 필요', '사진을 선택하려면 갤러리 접근 권한이 필요합니다.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setAvatarUrl(result.assets[0].uri);
        }
    };

    const handleNext = async () => {
        if (!bio.trim() || !cookingLevel) {
            Alert.alert('오류', '자기소개와 요리 레벨을 모두 선택해주세요.');
            return;
        }

        // Supabase에 프로필 정보 업데이트
        const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
                avatar_url: avatarUrl,
                bio,
                cooking_level: cookingLevel,
            })
            .eq('id', user?.id);

        if (updateError) {
            console.error('Supabase 업데이트 오류:', updateError);
            Alert.alert('저장 오류', `프로필 정보 저장 중 문제가 발생했습니다: ${updateError.message}`);
            return;
        }

        // AuthProvider의 상태를 업데이트합니다.
        await updateUserProfile({
            avatar_url: avatarUrl,
            bio,
            cooking_level: cookingLevel,
        });

        Alert.alert('성공', '프로필이 성공적으로 설정되었습니다!');

        // ✅ 네비게이션 로직을 이 곳으로 옮깁니다.
        // 다음 온보딩 단계로 이동 (PreferenceSetup)
        navigation.navigate('PreferenceSetup');
    };

    const cookingOptions = [
        { label: '잘 안해요 (1~2회)', value: 'beginner' },
        { label: '가끔 해요 (3~5회)', value: 'intermediate' },
        { label: '자주 해요 (6~7회)', value: 'advanced' },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>프로필 사진</Text>

            {avatarUrl && (
                <Image source={{ uri: avatarUrl }} style={styles.avatarPreview} />
            )}
            <Text style={styles.label}>Google 프로필 사진을 사용할 수도 있어요</Text>
            <Button title="프로필 사진 선택" onPress={pickImage} />
            <Text style={styles.sectionTitle}>자기소개 부탁드립니다!</Text>
            <TextInput
                style={styles.input}
                placeholder="ex) 요리 초보에요"
                value={bio}
                onChangeText={setBio}
            />

            <Text style={styles.sectionTitle}>요리를 자주 하시나요?</Text>
            <View style={styles.optionGroup}>
                {cookingOptions.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        style={[
                            styles.optionButton,
                            cookingLevel === option.value && styles.optionSelected
                        ]}
                        onPress={() => setCookingLevel(option.value)}
                    >
                        <Text style={styles.optionText}>{option.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Button title="다음" onPress={handleNext} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 8,
    },
    avatarPreview: {
        width: 120,
        height: 120,
        borderRadius: 60, // ✅ 원형 처리
        alignSelf: 'center',
        marginVertical: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    optionGroup: {
        flexDirection: 'column',
        gap: 8,
        marginBottom: 20,
    },
    optionButton: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    optionSelected: {
        backgroundColor: 'orange',
        borderColor: 'white',
    },
    optionText: {
        color: '#333',
        textAlign: 'center',
    },
});