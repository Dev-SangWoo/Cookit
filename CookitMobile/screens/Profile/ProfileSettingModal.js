// 프로필 화면 설정 버튼을 눌렀을 때 보여지는 드롭다운 모달
// 프로필 수정, 알림 설정, 로그아웃 3개 옵션

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import ProfileLogoutModal from './ProfileLogoutModal';

const SettingsOption = ({ text, onPress, isDanger = false }) => (
    <TouchableOpacity style={styles.optionButton} onPress={onPress}>
        <Text style={[styles.optionText, isDanger && styles.dangerText]}>
            {text}
        </Text>
    </TouchableOpacity>
);

export default function ProfileSettingModal({ visible, onClose, onNavigate, onLogout, buttonPosition }) {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const menuStyle = {
        position: 'absolute',
        top: buttonPosition.y + buttonPosition.height + 5,
        right: 15,
    };

    const handleConfirmLogout = () => {
        setShowLogoutConfirm(false); 
        onClose();
        onLogout();
    }

    const handleCancelLogout = () => {
        setShowLogoutConfirm(false);
    }

    return (
        <>
            <Modal
                animationType="fade"
                transparent={true}
                visible={visible}
                onRequestClose={onClose}
            >
                <TouchableOpacity
                    style={styles.container}
                    activeOpacity={1}
                    onPressOut={onClose}
                >
                    <View style={[styles.modalView, menuStyle]} onStartShouldSetResponder={() => true}>

                        {/* 프로필 수정 */}
                        <SettingsOption
                            text="프로필 수정"
                            onPress={() => onNavigate('ProfileEdit')}
                        />
                        <View style={styles.divider} />

                        {/* 알림 설정 */}
                        <SettingsOption
                            text="알림 설정"
                            onPress={() => onNavigate('ProfileAlarm')}
                        />
                        <View style={styles.divider} />
                        <SettingsOption
                            text="로그아웃"
                            isDanger={true}
                            onPress={() => setShowLogoutConfirm(true)}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
            <ProfileLogoutModal
                visible={showLogoutConfirm}
                onConfirm={handleConfirmLogout}
                onCancel={handleCancelLogout}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: 150,
    },
    optionButton: {
        paddingVertical: 8,
    },
    optionText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'left',
    },
    dangerText: {
        color: 'red',
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 2,
    }
});
