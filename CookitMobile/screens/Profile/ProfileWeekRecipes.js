// 이번 주 완성한 요리 목록 화면

import React from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

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

// 이번 주 완성한 요리를 표시하는 화면 컴포넌트
const ProfileWeekRecipes = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const recipes = route.params?.recipes || [];

    // ----------------------------------------------------------------------
    // [1] 리스트 렌더링 함수
    // ----------------------------------------------------------------------

    const renderItem = ({ item }) => {
        const formattedDate = formatDate(item.created_at);
        const recipeTitle = item.recipes?.title || item.title;
        const thumbnail = item.image_urls?.[0] || item.recipes?.image_urls?.[0] || 'https://via.placeholder.com/100x70/E0E0E0/808080?text=No+Image';
        
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => {
                    // 레시피 ID가 있으면 레시피 상세로, 없으면 게시글 상세로 이동
                    if (item.recipe_id) {
                        navigation.navigate('SearchSummary', {
                            recipeId: item.recipe_id,
                            title: recipeTitle,
                            thumbnail: thumbnail,
                        });
                    } else if (item.post_id) {
                        navigation.navigate('CommunityDetail', {
                            postId: item.post_id,
                        });
                    }
                }}
            >
                <Image 
                    source={{ uri: thumbnail }} 
                    style={styles.thumbnail} 
                    onError={(e) => console.log('이미지 로드 오류:', e.nativeEvent.error)}
                />
                
                <View style={styles.textBox}>
                    <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                    
                    {recipeTitle && recipeTitle !== item.title && (
                        <Text style={styles.recipeTitle} numberOfLines={1}>
                            레시피: {recipeTitle}
                        </Text>
                    )}
                    
                    {item.content && (
                        <Text style={styles.content} numberOfLines={2}>
                            {item.content}
                        </Text>
                    )}
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.date}>{formattedDate}</Text>
                        <Text style={styles.badge}>완료 ✓</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>← 뒤로</Text>
                </TouchableOpacity>
                <Text style={styles.header}>이번 주 완성한 요리</Text>
                <View style={styles.backButton} />
            </View>
            
            {recipes.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>이번 주에 완성한 요리가 없습니다.</Text>
                </View>
            ) : (
                <FlatList
                    data={recipes}
                    keyExtractor={(item, index) => `${item.post_id || item.recipe_id}-${index}`}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
};

export default ProfileWeekRecipes;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    backButton: {
        width: 60,
    },
    backButtonText: {
        fontSize: 16,
        color: '#e67e22',
        fontWeight: '600',
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#e67e22',
        textAlign: 'center',
        flex: 1,
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
        height: 120,
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
    recipeTitle: {
        fontSize: 13,
        color: '#e67e22',
        marginBottom: 4,
        fontWeight: '600',
    },
    content: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    date: {
        fontSize: 12,
        color: '#777',
        fontWeight: '500',
    },
    badge: {
        fontSize: 12,
        color: '#4caf50',
        fontWeight: '600',
        paddingHorizontal: 8,
        paddingVertical: 3,
        backgroundColor: '#e8f5e9',
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



