import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SetupIngredientsModal from '@features/refrigerator/screens/SetupIngredientsModal';
import { useAuth } from '@features/auth/contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { addReceiptItemsBulk } from '@features/refrigerator/services/receiptItemsApi';

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

    const handleBack = () => {
        navigation.goBack();
    };

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


    // 서버 API를 통한 재료 저장
    const handleStart = async () => {
        if (ingredients.length === 0) {
            Alert.alert('오류', '재료를 하나 이상 등록해주세요.');
            return;
        }

        try {
            const receiptItems = ingredients.map(ing => ({
                name: ing.name,
                quantity: ing.quantity,
                unit: ing.unit,
                expiration_date: ing.expiry,
            }));

            await addReceiptItemsBulk(receiptItems);

            // 유통기한 알림 자동 등록
            const notificationService = (await import('@shared/services/notificationService')).default;
            let registeredCount = 0;
            for (const item of receiptItems) {
                if (item.expiration_date) {
                    try {
                        await notificationService.scheduleExpiryNotification(
                            item.name,
                            item.expiration_date
                        );
                        registeredCount++;
                    } catch (notifError) {
                        console.error(`알림 등록 실패 (${item.name}):`, notifError);
                    }
                }
            }
            if (registeredCount > 0) {
                console.log(`✅ ${registeredCount}개의 유통기한 알림이 등록되었습니다.`);
            }

            // 초기 설정 완료 상태로 설정
            setSetupComplete(true);

            navigation.reset({
                index: 0,
                routes: [{ name: 'HomeTab' }],
            });
        } catch (error) {
            console.error('재료 저장 오류:', error);
            Alert.alert('저장 실패', error.message || '재료 저장 중 오류가 발생했습니다.');
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name="arrow-back" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.step}>4/4</Text>
            <View style={styles.titleRow}>
                <Text style={styles.title}>냉장고 재료 등록</Text>
                <TouchableOpacity
                    style={styles.receiptButton}
                    onPress={() => navigation.navigate('Receipt', { 
                        screen: 'ReceiptMain',
                        returnToSetup: true 
                    })}
                >
                    <Ionicons name="receipt-outline" size={20} color="#4CAF50" />
                    <Text style={styles.receiptButtonText}>영수증으로 추가</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.titleText}>현재 보유한 재료와 유통기한을 등록해 주세요</Text>
            
            <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={20} color="#FF8C00" />
                <Text style={styles.infoText}>
                    재료를 탭하면 삭제됩니다
                </Text>
            </View>

            <Text style={styles.sectionTitle}>
                <Ionicons name="basket-outline" size={20} color="#333" /> 
                {' '}등록된 재료 ({ingredients.length}개)
            </Text>

            <View style={styles.ingredientsContainer}>
                {ingredients.length > 0 ? (
                    <ScrollView 
                        style={styles.scrollArea}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {ingredients.map((ingredient, index) => {
                            const formattedExpiryDate = ingredient.expiry.replace(/\//g, '-');
                            const expiryInfo = calculateExpiry(formattedExpiryDate);
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.ingredientCard, { borderColor: expiryInfo.color }]}
                                    onPress={() => handleRemoveIngredient(ingredient)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.ingredientHeader}>
                                        <View style={styles.ingredientIcon}>
                                            <Ionicons name="nutrition-outline" size={24} color="#FF8C00" />
                                        </View>
                                        <View style={styles.ingredientInfo}>
                                            <Text style={styles.ingredientName}>{ingredient.name}</Text>
                                            <Text style={styles.ingredientQuantity}>
                                                {ingredient.quantity} {ingredient.unit}
                                            </Text>
                                        </View>
                                        <View style={[styles.expiryBadge, { backgroundColor: getTagColor(expiryInfo.diffDays) }]}>
                                            <Text style={[styles.ingredientExpiry, { color: expiryInfo.color }]}>
                                                {expiryInfo.text}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="basket-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>등록된 재료가 없습니다</Text>
                        <Text style={styles.emptySubText}>아래 버튼을 눌러 재료를 추가해보세요</Text>
                    </View>
                )}
            </View>
            
            <TouchableOpacity
                style={styles.addIngredientButton}
                onPress={() => setIsModalVisible(true)}
            >
                <Ionicons name="add-circle-outline" size={24} color="orange" />
                <Text style={styles.addIngredientButtonText}>재료 추가하기</Text>
            </TouchableOpacity>

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
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 10,
        padding: 8,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 0,
    },
    receiptButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#4CAF50',
        gap: 6,
    },
    receiptButtonText: {
        color: '#4CAF50',
        fontSize: 14,
        fontWeight: '600',
    },
    step: {
        color: 'orange',
        fontSize: 16,
        marginBottom: 4,
        marginTop: 40
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    titleText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 20
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF4E6',
        padding: 12,
        borderRadius: 10,
        marginBottom: 16,
        gap: 8,
    },
    infoText: {
        fontSize: 13,
        color: '#FF8C00',
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 12,
        color: '#333',
    },
    ingredientsContainer: {
        flex: 1,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        backgroundColor: '#f9f9f9',
        padding: 12,
        marginBottom: 16,
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        alignItems: 'flex-start',
    },
    ingredientCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        alignSelf: 'stretch',
        width: '100%',
    },
    ingredientHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    ingredientIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFF4E6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ingredientInfo: {
        flex: 1,
    },
    ingredientName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    ingredientQuantity: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    expiryBadge: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    ingredientExpiry: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
        fontWeight: '600',
    },
    emptySubText: {
        fontSize: 14,
        color: '#bbb',
        marginTop: 8,
    },
    addIngredientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF4E6',
        borderWidth: 2,
        borderColor: 'orange',
        borderStyle: 'dashed',
        borderRadius: 12,
        paddingVertical: 14,
        gap: 8,
    },
    addIngredientButtonText: {
        color: 'orange',
        fontSize: 16,
        fontWeight: '600',
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