// 좋아요 누른 레시피 버튼 눌렀을 때 화면 recipe_likes
// 지금은 좋아요를 누르면 그것을 저장하는 것으로 생각 중
// 좋아요와 저장을 따로 생각할 수 있긴하다

import React, { useEffect, useState, useCallback } from 'react';
import { Platform, StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { getMyLikedRecipes, deleteRecipeLike } from '../../services/recipeLikesApi';

// DB의 timestampz 데이터를 순수 자바스크립트 Date 객체를 사용하여 포맷하는 함수
const formatDate = (dateString) => {
    // Supabase에서 받은 ISO 8601 문자열을 Date 객체로 변환
    // 이 과정에서 자동으로 사용자 로컬 시간대로 변환됩니다. (timestampz 처리)
    const date = new Date(dateString);
    
    // 날짜 구성 요소 가져오기
    const year = date.getFullYear();
    // getMonth()는 0부터 시작하므로 1을 더해야 합니다.
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // 두 자릿수 포맷을 위해 padStart 사용 (예: 9월 -> 09월)
    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');

    return `${year}년 ${formattedMonth}월 ${formattedDay}일`;
};


// 좋아요 누른 레시피를 표시하는 화면 컴포넌트
const ProfileLikes = () => {
    const navigation = useNavigation();
    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    // ----------------------------------------------------------------------
    // [1] 데이터 페칭 함수
    // ----------------------------------------------------------------------

    const fetchLikedRecipes = useCallback(async () => {
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            Alert.alert('로그인 오류', '로그인 후 이용해 주세요.');
            setLoading(false);
            return;
        }
        setUserId(user.id);

        try {
            // 서버 API를 통해 좋아요한 레시피 목록 가져오기
            const data = await getMyLikedRecipes();

            // 데이터를 평탄화하여 사용하기 쉽게 변환
            const formattedLikes = data.map(item => ({
                like_id: item.id, // 좋아요 ID 추가 (삭제용)
                recipe_id: item.recipes.id,
                title: item.recipes.title,
                thumbnail: item.recipes.image_urls?.[0] || 'https://via.placeholder.com/100x70/E0E0E0/808080?text=No+Image',
                channel: item.recipes.channel,
                liked_at: item.created_at, // timestampz 문자열
            }));

            setLikes(formattedLikes);

        } catch (error) {
            console.error('좋아요 레시피 불러오기 오류:', error.message);
            Alert.alert('오류', error.message || '좋아요 목록을 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    // 화면이 포커스를 얻을 때마다 데이터를 새로고침
    useFocusEffect(
        useCallback(() => {
            fetchLikedRecipes();
        }, [fetchLikedRecipes])
    );

    // ----------------------------------------------------------------------
    // [2] 좋아요 취소 함수
    // ----------------------------------------------------------------------

    const handleUnlike = async (likeId) => {
        if (!userId) return;

        Alert.alert(
            '좋아요 취소',
            '이 레시피의 좋아요를 취소하시겠습니까?',
            [
                { text: '아니요', style: 'cancel' },
                {
                    text: '예',
                    onPress: async () => {
                        try {
                            // 서버 API를 통해 좋아요 삭제
                            await deleteRecipeLike(likeId);
                            
                            // 성공 시 목록을 새로고침
                            Alert.alert('취소 완료', '좋아요가 취소되었습니다.');
                            fetchLikedRecipes(); 

                        } catch (error) {
                            console.error('좋아요 취소 오류:', error.message);
                            Alert.alert('오류', error.message || '좋아요 취소에 실패했습니다.');
                        }
                    },
                },
            ]
        );
    };

    // ----------------------------------------------------------------------
    // [3] 리스트 렌더링 함수
    // ----------------------------------------------------------------------

    const renderItem = ({ item }) => {
        // DB에서 가져온 created_at (timestampz 문자열)을 포맷합니다.
        const formattedDate = formatDate(item.liked_at);
        
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() =>
                    navigation.navigate('SearchSummary', {
                        recipeId: item.recipe_id,
                        title: item.title,
                        thumbnail: item.thumbnail, 
                        creator: item.channel,
                    })
                }
            >
                <Image 
                    source={{ uri: item.thumbnail }} 
                    style={styles.thumbnail} 
                    onError={(e) => console.log('이미지 로드 오류:', e.nativeEvent.error)}
                />
                
                <View style={styles.textBox}>
                    <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.likedDate}>{formattedDate}</Text>
                        
                        <TouchableOpacity 
                            style={styles.deleteButton}
                            onPress={() => handleUnlike(item.like_id)}
                        >
                            <Text style={styles.deleteButtonText}>삭제 🗑️</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#e67e22" style={styles.loading} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>좋아요 누른 레시피</Text>
            
            {likes.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>아직 좋아요를 누른 레시피가 없습니다.</Text>
                </View>
            ) : (
                <FlatList
                    data={likes}
                    keyExtractor={(item) => item.recipe_id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
};

export default ProfileLikes;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#e67e22',
        textAlign: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    listContent: {
        paddingTop: 10,
        paddingHorizontal: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
        overflow: 'hidden',
    },
    thumbnail: {
        width: 100,
        height: 100,
        borderRadius: 0, 
    },
    textBox: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between', 
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    likedDate: {
        fontSize: 13,
        color: '#777',
        fontWeight: '500',
    },
    deleteButton: {
        backgroundColor: '#f44336',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
    },
});
