import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import SetupIngredientsModal from './SetupIngredientsModal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

// Ingredients.js에서 가져온 유통기한 계산 함수
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
    const { user } = useAuth();
    const navigation = useNavigation();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [ingredients, setIngredients] = useState([]);

    const handleAddIngredient = (newIngredient) => {
        setIngredients([...ingredients, { ...newIngredient, expiry: newIngredient.expiry }]);
    };

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

        navigation.reset({
            index: 0,
            routes: [{ name: 'HomeTab' }],
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.step}>4/4</Text>

            {/* 타이틀과 버튼을 감싸는 컨테이너 */}
            <View style={styles.titleContainer}>
                <Text style={styles.title}>냉장고 등록</Text>
                <TouchableOpacity
                    style={styles.addIconBtn}
                    onPress={() => setIsModalVisible(true)}
                >
                    <Text style={styles.addIconBtnText}>+</Text>
                </TouchableOpacity>
            </View>

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

    // ✅ 새로운 타이틀-버튼 컨테이너
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20, // 이전 title의 여백을 여기서 처리
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        // marginBottom 제거
    },
    // ✅ 타이틀 옆에 배치된 + 버튼 스타일
    addIconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'orange',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    addIconBtnText: {
        fontSize: 24,
        color: 'white',
        lineHeight: 24, // 텍스트를 수직 중앙에 맞추기 위해 조정
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
        minHeight: 400, // 버튼이 밖으로 나가면서 높이 조정
        maxHeight: 800,
    },
    scrollArea: {
        flex: 1,
        // marginBottom 제거됨 (하단의 전체 너비 버튼이 없어짐)
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
    ingredientExpiry: {
        fontWeight: 'bold',
        fontSize: 15,
    },
    // 기존 addButton 관련 스타일 제거됨
    buttonWrapper: {
        justifyContent: 'flex-end',
        marginBottom: 20,
        marginTop: 20,
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
