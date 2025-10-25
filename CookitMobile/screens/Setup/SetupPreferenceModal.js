// 선호/ 비선호 재료 선택 모달 / 디자인 변경

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, Keyboard } from 'react-native';
import Modal from 'react-native-modal';

export default function SetupPreferenceModal({ visible, options, selected, onClose, onSelect }) {
    // 모달 내부에서만 사용될 임시 선택 상태
    const [tempSelected, setTempSelected] = useState(selected);
    const [customInput, setCustomInput] = useState(''); // 사용자 정의 입력을 위한 상태

    // 모달이 열릴 때마다 부모의 선택 값을 임시 상태에 복사하고 입력 필드 초기화
    useEffect(() => {
        if (visible) {
            setTempSelected(selected);
            setCustomInput(''); 
        }
    }, [visible, selected]);

    // 항목 선택/해제 핸들러
    const handleSelectOption = (item) => {
        setTempSelected(prev => {
            if (prev.includes(item)) {
                return prev.filter(i => i !== item);
            } else {
                return [...prev, item];
            }
        });
    };

    // 사용자 정의 항목 추가 핸들러
    const handleAddCustom = () => {
        const newItem = customInput.trim();
        
        if (!newItem) {
            Alert.alert('입력 오류', '추가할 재료를 입력해 주세요.');
            return;
        }

        if (tempSelected.some(item => item.toLowerCase() === newItem.toLowerCase())) {
            Alert.alert('중복', `${newItem}은(는) 이미 선택 목록에 있습니다.`);
            setCustomInput('');
            return;
        }

        setTempSelected(prev => [...prev, newItem]);
        setCustomInput('');
        Keyboard.dismiss(); // 키보드 닫기
    };

    // "확인" 버튼 핸들러: 최종 선택 사항을 부모에게 전달하고 모달 닫기
    const handleConfirm = () => {
        onSelect(tempSelected);
        onClose();
    };

    // "취소" 버튼 핸들러: 변경 사항 없이 모달만 닫기
    const handleCancel = () => {
        onClose();
    };

    return (
        <Modal 
            isVisible={visible}
            onBackdropPress={handleCancel}
            animationIn="zoomIn"
            animationOut="zoomOut"
        >
            <View style={styles.container}>
                
                {/* 헤더 */}
                <Text style={styles.title}>항목을 선택하세요</Text>
                <Text style={styles.subtitle}>선택된 항목을 다시 누르면 해제됩니다. 목록에 없다면 직접 입력해 주세요.</Text>
                
                {/* 사용자 정의 입력 필드 */}
                <View style={styles.customInputRow}>
                    <TextInput
                        style={styles.customTextInput}
                        placeholder="직접 입력하여 추가"
                        value={customInput}
                        onChangeText={setCustomInput}
                        returnKeyType="done"
                        onSubmitEditing={handleAddCustom} // 엔터 키로 추가
                    />
                    <TouchableOpacity style={styles.addButton} onPress={handleAddCustom}>
                        <Text style={styles.addButtonText}>+ 추가</Text>
                    </TouchableOpacity>
                </View>

                {/* 현재 선택된 항목 미리보기 - **항상 표시** */}
                <View style={styles.currentSelection}>
                    <Text style={styles.currentSelectionTitle}>현재 선택 ({tempSelected.length}개):</Text>
                    <View style={styles.selectedTagsRow}>
                        {tempSelected.length > 0 ? (
                            // 선택된 항목이 있을 경우 태그 표시
                            tempSelected.map((item) => (
                                <TouchableOpacity 
                                    key={`temp-${item}`} 
                                    style={styles.tempTag}
                                    onPress={() => handleSelectOption(item)}
                                >
                                    <Text style={styles.tempTagText}>{item} ×</Text>
                                </TouchableOpacity>
                            ))
                        ) : (
                            // 선택된 항목이 없을 경우 플레이스홀더 표시
                            <Text style={styles.placeholderText}>선택된 항목이 없습니다.</Text>
                        )}
                    </View>
                </View>

                {/* 선택 옵션 스크롤 영역 */}
                <Text style={styles.presetOptionsTitle}>미리 설정된 옵션</Text>
                <ScrollView style={styles.optionsScrollView}>
                    <View style={styles.optionsGrid}>
                        {options.map((item) => {
                            const isSelected = tempSelected.includes(item); 
                            return (
                                <TouchableOpacity
                                    key={item}
                                    style={[
                                        styles.optionButton,
                                        isSelected && styles.optionSelected,
                                    ]}
                                    onPress={() => handleSelectOption(item)}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        isSelected && styles.optionTextSelected
                                    ]}>
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>
                
                {/* 하단 버튼 영역 */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity 
                        style={[styles.modalButton, styles.cancelButton]} 
                        onPress={handleCancel}
                    >
                        <Text style={styles.cancelButtonText}>취소</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.modalButton, styles.confirmButton]} 
                        onPress={handleConfirm}
                    >
                        <Text style={styles.confirmButtonText}>확인</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        maxHeight: '85%', 
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#777',
        marginBottom: 15,
        textAlign: 'center',
    },
    
    // Custom Input Styles
    customInputRow: {
        flexDirection: 'row',
        marginBottom: 15,
        gap: 10,
    },
    customTextInput: {
        flex: 1,
        height: 45,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    addButton: {
        backgroundColor: '#fbbd4bff', 
        paddingHorizontal: 15,
        borderRadius: 10,
        justifyContent: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    currentSelection: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eee',
        minHeight: 80, 
    },
    currentSelectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#555',
    },
    selectedTagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        minHeight: 30, 
    },
    placeholderText: {
        color: '#aaa',
        fontStyle: 'italic',
        paddingVertical: 5,
    },
    tempTag: {
        backgroundColor: '#D1E8FF', 
        borderRadius: 15,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderColor: '#9EC5FE',
        borderWidth: 1,
    },
    tempTagText: {
        fontSize: 13,
        color: '#333',
    },
    
    // Preset Options Styles
    presetOptionsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    optionsScrollView: {
        maxHeight: 250, 
        marginBottom: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#eee',
        paddingVertical: 10,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'flex-start',
    },
    optionButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
    },
    optionSelected: {
        backgroundColor: '#FFA500', 
        borderColor: '#FF8C00',
    },
    optionText: {
        fontSize: 15,
        color: '#555',
        fontWeight: '500',
    },
    optionTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
  
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        gap: 10,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#ccc',
    },
    cancelButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButton: {
        backgroundColor: '#4CAF50', 
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
