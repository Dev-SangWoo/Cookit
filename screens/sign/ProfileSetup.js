// 지금은 사각으로 고른 영역을 원으로 자르는 식인데 
// 이거를 사각형 그대로 해도 가능은 할듯?  정해야한다

import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileSetup({ navigation, route }) {
    const { userId, email, display_name, googleAvatar } = route.params;
    const [avatarUri, setAvatarUri] = useState(googleAvatar || '');
    const [bio, setBio] = useState('');
    const [cookingLevel, setCookingLevel] = useState('');

    const pickImage = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    const handleNext = () => {
        navigation.navigate('PreferenceSetup', {
            userId,
            email,
            display_name,
            avatar_url: avatarUri,
            bio,
            cooking_level: cookingLevel
        });
    };

    const cookingOptions = [
        { label: '잘 안해요 (1~2회)', value: 'rare' },
        { label: '가끔 해요 (3~5회)', value: 'sometimes' },
        { label: '자주 해요 (6~7회)', value: 'often' },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>프로필 사진</Text>

            {avatarUri && (
                <Image source={{ uri: avatarUri }} style={styles.avatarPreview} />
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
