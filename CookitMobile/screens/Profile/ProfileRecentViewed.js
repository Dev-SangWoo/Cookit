// 최근에 조회한 레시피 화면

import React, { useEffect, useState, useCallback } from 'react';
import { Platform, StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { getRecentViewedRecipes } from '../../services/userApi';

// DB의 timestampz 데이터를 순수 자바스크립트 Date 객체를 사용하여 포맷하는 함수
const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');

    return `${year}년 ${formattedMonth}월 ${formattedDay}일`;
};


// 최근 조회한 레시피를 표시하는 화면 컴포넌트
const ProfileRecentViewed = () => {
    const navigation = useNavigation();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    // ----------------------------------------------------------------------
    // [1] 데이터 페칭 함수
    // ----------------------------------------------------------------------

    const fetchRecentRecipes = useCallback(async () => {
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            Alert.alert('로그인 오류', '로그인 후 이용해 주세요.');
            setLoading(false);
            return;
        }

        try {
            // 서버 API를 통해 최근 조회한 레시피 목록 가져오기
            const data = await getRecentViewedRecipes(20);

            // 데이터를 사용하기 쉽게 변환
            const formattedRecipes = data.map(item => ({
                recipe_id: item.id,
                title: item.title,
                description: item.description,
                thumbnail: item.image_urls?.[0] || 'https://via.placeholder.com/100x70/E0E0E0/808080?text=No+Image',
                prep_time: item.prep_time,
                cook_time: item.cook_time,
                difficulty_level: item.difficulty_level,
                last_viewed_at: item.last_viewed_at,
            }));

            setRecipes(formattedRecipes);

        } catch (error) {
            console.error('최근 조회 레시피 불러오기 오류:', error.message);
            Alert.alert('오류', error.message || '최근 조회 레시피 목록을 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    // 화면이 포커스를 얻을 때마다 데이터를 새로고침
    useFocusEffect(
        useCallback(() => {
            fetchRecentRecipes();
        }, [fetchRecentRecipes])
    );

    // ----------------------------------------------------------------------
    // [2] 리스트 렌더링 함수
    // ----------------------------------------------------------------------

    const renderItem = ({ item }) => {
        const formattedDate = formatDate(item.last_viewed_at);
        
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() =>
                    navigation.navigate('SearchSummary', {
                        recipeId: item.recipe_id,
                        title: item.title,
                        thumbnail: item.thumbnail,
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
                    
                    {item.description && (
                        <Text style={styles.description} numberOfLines={1}>
                            {item.description}
                        </Text>
                    )}
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.viewedDate}>{formattedDate} 조회</Text>
                        {item.difficulty_level && (
                            <Text style={styles.difficulty}>
                                {item.difficulty_level === 'easy' ? '초급' : 
                                 item.difficulty_level === 'medium' ? '중급' : '고급'}
                            </Text>
                        )}
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
            <Text style={styles.header}>최근에 조회한 레시피</Text>
            
            {recipes.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>아직 조회한 레시피가 없습니다.</Text>
                </View>
            ) : (
                <FlatList
                    data={recipes}
                    keyExtractor={(item, index) => `${item.recipe_id}-${index}`}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
};

export default ProfileRecentViewed;

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
        marginBottom: 4,
    },
    description: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    viewedDate: {
        fontSize: 12,
        color: '#777',
        fontWeight: '500',
    },
    difficulty: {
        fontSize: 12,
        color: '#e67e22',
        fontWeight: '600',
        paddingHorizontal: 8,
        paddingVertical: 3,
        backgroundColor: '#fff3e0',
        borderRadius: 4,
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



