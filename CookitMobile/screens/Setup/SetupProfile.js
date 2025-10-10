import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function SetupProfile({ navigation }) {
    const { user, updateUserProfile } = useAuth();
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
    const [bio, setBio] = useState(user?.bio || '');

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
        if (!bio.trim()) {
            Alert.alert('오류', '자기소개를 입력해주세요.');
            return;
        }

        // Supabase에 프로필 정보 업데이트
        const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
                avatar_url: avatarUrl,
                bio,
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
        });


        navigation.replace('SetupPreference') ; 
    };

    return (
        <View style={styles.container}>
            <Text style={styles.step}>2/4</Text>
            <Text style={styles.title}>프로필 사진, 자기소개</Text>
            <Text style={styles.titleText}>본인을 표현할 수 있는{"\n"}프로필 사진과 자기소개를 입력해주세요</Text>
            <Text style={styles.sectionTitle}>프로필 사진</Text>

            {avatarUrl && (
                <Image source={{ uri: avatarUrl }} style={styles.avatarPreview} />
            )}
            <Text style={styles.titleText}>Google 프로필 사진을 사용할 수도 있어요</Text>
            <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.imageButton}> 
                <Text style={styles.imageText}>사진 선택</Text>
            </TouchableOpacity>
                        <TouchableOpacity onPress={pickImage} style={styles.imageButton}> 
                <Text style={styles.imageText}>사진 촬영(미구현)</Text>
            </TouchableOpacity>
            </View>
            <Text style={styles.sectionTitle}>자기소개</Text>
            <TextInput
                style={styles.input}
                placeholder="ex) 요리 초보에요"
                value={bio}
                onChangeText={setBio}
            />

            <View style={styles.buttonWrapper}>
  <TouchableOpacity
    style={styles.buttonNext}
    onPress={handleNext}
  >
    <Text style={styles.buttonText}>다음</Text>
  </TouchableOpacity>
</View>
        </View>
    );
}

const styles = StyleSheet.create({
   container: {
    flex: 1, 
    padding: 20,
    paddingTop: 60,
  },
    step: {
        color: 'orange',
        fontSize: 16,
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    titleText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 8,
    },
    avatarPreview: {
        width: 120,
        height: 120,
        borderRadius: 15,
        alignSelf: 'center',
        marginVertical: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12,
        marginBottom: 20
    },
    imageButton: {
        marginHorizontal: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: 'orange',
        borderRadius: 30,
        borderColor: 'orange',
        borderWidth: 1,
    },
    imageText: {
         color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
     buttonWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 50,
  },
  
  // 버튼 자체의 스타일
  buttonNext: {
    backgroundColor: 'orange',
    borderRadius: 50,
    width: '100%',
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
    buttonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold'
    },
});
