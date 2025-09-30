import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import SetupIngredientsModal from './SetupIngredientsModal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

// Ingredients.js에서 가져온 유통기한 계산 함수 (타입 주석 제거)
const calculateExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const text = diffDays > 0 ? `D-${diffDays}` : (diffDays === 0 ? 'D-Day' : `D+${Math.abs(diffDays)}`);
    const color = diffDays > 0 ? '#008000' : (diffDays === 0 ? '#FF8C00' : '#FF0000');

    return { diffDays, text, color };
};

// Ingredients.js에서 가져온 태그 색상 결정 함수
const getTagColor = (diffDays) => {
    if (diffDays < 0) {
        return '#FFCDD2';
    } else if (diffDays <= 3) {
        return '#FFF9C4';
    } else {
        return '#C8E6C9';
    }
};

export default function SetupIngredients() {
    const { user, setSetupComplete } = useAuth();
    const navigation = useNavigation();
    const [isModalVisible, setIsModalVisible] = useState(false);
    // 타입 주석 <any[]> 제거
    const [ingredients, setIngredients] = useState([]);

    // 인자 타입 주석 제거
    const handleAddIngredient = (newIngredient) => {
        setIngredients([...ingredients, { ...newIngredient, expiry: newIngredient.expiry }]);
    };

    // 인자 타입 주석 제거
    const handleRemoveIngredient = (ingredientToRemove) => {
        setIngredients(ingredients.filter(ing =>
            ing.name !== ingredientToRemove.name ||
            ing.quantity !== ingredientToRemove.quantity ||
            ing.expiry !== ingredientToRemove.expiry
        ));
    };


    // Supabase 저장 시 expiry_date를 포함하도록 수정
    const handleStart = async () => {
        if (ingredients.length === 0) {
            Alert.alert('오류', '재료를 하나 이상 등록해주세요.');
            return;
        }

        const receiptItems = ingredients.map(ing => ({
            user_id: user?.id,
            product_name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            expiry_date: ing.expiry,
        }));

        const { error } = await supabase
            .from('receipt_items')
            .insert(receiptItems);

        if (error) {
            Alert.alert('저장 실패', error.message);
            return;
        }

        // 초기 설정 완료 상태 업데이트
        setSetupComplete(true);
        
        Alert.alert('환영합니다!', '초기 설정이 완료되었습니다.', [
            {
                text: '확인',
                onPress: () => {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'HomeTab' }],
                    });
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.step}>4/4</Text>
            <Text style={styles.title}>냉장고 등록</Text>
            <Text style={styles.titleText}>현재 보유한 재료와{"\n"}유통기한을 등록해 주세요</Text>
            <Text style={styles.sectionTitle}>현재 보유한 재료</Text>

            <View style={styles.tagWrapper}>
                <ScrollView style={styles.scrollArea}>
                    {ingredients.map((ingredient, index) => {
                        const formattedExpiryDate = ingredient.expiry.replace(/\//g, '-');
                        const expiryInfo = calculateExpiry(formattedExpiryDate);
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[styles.ingredientTag, { backgroundColor: getTagColor(expiryInfo.diffDays) }]}
                                onPress={() => handleRemoveIngredient(ingredient)}
                            >
                                <View style={styles.tagLeft}>
                                    <Text style={styles.ingredientName}>{ingredient.name}</Text>
                                    <Text style={styles.ingredientQuantity}>
                                        {ingredient.quantity} {ingredient.unit}
                                    </Text>
                                </View>
                                <Text style={[styles.ingredientExpiry, { color: expiryInfo.color }]}>
                                    {expiryInfo.text}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setIsModalVisible(true)}
                >
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            </View>

            <SetupIngredientsModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onAddIngredient={handleAddIngredient}
                isEditing={false}
            />

            <View style={styles.buttonWrapper}>
                <TouchableOpacity
                    style={styles.buttonNext}
                    onPress={handleStart}
                >
                    <Text style={styles.buttonText}>시작하기</Text>
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
    tagWrapper: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        minHeight: 450,
        maxHeight: 800, 
        flexDirection: 'column',
    },
    scrollArea: {
        flex: 1,
        marginBottom: 10,
    },
    ingredientTag: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', 
        width: '100%',
        padding: 15,
        borderRadius: 10,
       
        borderColor: '#ddd',
        borderWidth: 1,
        marginBottom: 8,
    },
    tagLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ingredientName: {
        fontWeight: 'bold',
        color: '#333',
        marginRight: 10,
    },
    ingredientQuantity: {
        color: '#555',
        fontSize: 14,
    },
    // 유통기한 텍스트 스타일 추가
    ingredientExpiry: {
        fontWeight: 'bold',
        fontSize: 15,
    },
    addButton: {
        width: '100%',
        height: 50,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: 20,
        color: '#333',
        lineHeight: 20,
    },
    buttonWrapper: {
        justifyContent: 'flex-end',
        marginBottom: 20, // 하단 여백 조정
        marginTop: 20, // 상단 여백 추가
    },
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
        fontWeight: 'bold',
    },
});