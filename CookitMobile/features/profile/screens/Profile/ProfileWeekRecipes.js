// 이번 주 완성한 요리 목록 화면

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getUserRatings } from '@features/profile/services/userApi';

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
    const [ratings, setRatings] = useState([]);
    const [loadingRatings, setLoadingRatings] = useState(true);

    // 별점/평점 데이터 로드
    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const ratingsData = await getUserRatings();
                setRatings(ratingsData);
            } catch (error) {
                console.error('별점/평점 로드 오류:', error);
            } finally {
                setLoadingRatings(false);
            }
        };
        fetchRatings();
    }, []);

    // 레시피 ID로 별점 찾기
    const getRatingForRecipe = (recipeId) => {
        if (!recipeId) return null;
        return ratings.find(r => r.recipe_id === recipeId);
    };

    // 별점 표시 함수
    const renderStars = (rating) => {
        if (!rating || rating === 0) return null;
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Text key={i} style={[styles.star, i <= rating && styles.filledStar]}>
                    ★
                </Text>
            );
        }
        return (
            <View style={styles.ratingStarsContainer}>
                {stars}
            </View>
        );
    };

    // ----------------------------------------------------------------------
    // [1] 리스트 렌더링 함수
    // ----------------------------------------------------------------------

    const renderItem = ({ item }) => {
        const recipeId = item.recipe_id || item.recipes?.id;
        const ratingData = getRatingForRecipe(recipeId);
        
        // 별점/평점이 있는 것만 표시
        if (!ratingData) return null;
        
        const recipe = ratingData.recipe;
        const thumbnail = recipe?.image_urls?.[0] || 'https://via.placeholder.com/100x100/E0E0E0/808080?text=No+Image';
        const formattedDate = formatDate(ratingData.created_at);
        
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => {
                    if (recipe?.id) {
                        navigation.navigate('Recipe', {
                            screen: 'RecipeMain',
                            params: { recipeId: recipe.id }
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
                    <Text style={styles.recipeTitle} numberOfLines={1}>
                        {recipe?.title || '레시피'}
                    </Text>
                    
                    {/* 별점/평점 표시 */}
                    <View style={styles.ratingContainer}>
                        {renderStars(ratingData.rating)}
                        {ratingData.comment && (
                            <Text style={styles.ratingComment} numberOfLines={2}>
                                {ratingData.comment}
                            </Text>
                        )}
                    </View>
                    
                    <Text style={styles.date}>{formattedDate}</Text>
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
            
            {loadingRatings ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#e67e22" />
                </View>
            ) : (
                (() => {
                    // 별점/평점이 있는 레시피만 필터링
                    const recipesWithRatings = recipes.filter(item => {
                        const recipeId = item.recipe_id || item.recipes?.id;
                        return getRatingForRecipe(recipeId) !== null;
                    });
                    
                    if (recipesWithRatings.length === 0) {
                        return (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>이번 주에 완성한 요리의 별점/평점이 없습니다.</Text>
                            </View>
                        );
                    }
                    
                    return (
                        <FlatList
                            data={recipesWithRatings}
                            keyExtractor={(item, index) => `${item.post_id || item.recipe_id}-${index}`}
                            renderItem={renderItem}
                            contentContainerStyle={styles.listContent}
                        />
                    );
                })()
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
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    thumbnail: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#E9ECEF',
    },
    textBox: {
        flex: 1,
        justifyContent: 'space-between',
    },
    recipeTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 8,
    },
    date: {
        fontSize: 12,
        color: '#ADB5BD',
        marginTop: 8,
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // 별점/평점 스타일
    ratingContainer: {
        marginBottom: 8,
    },
    ratingStarsContainer: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    star: {
        fontSize: 16,
        color: '#DEE2E6',
        marginRight: 2,
    },
    filledStar: {
        color: '#FFC107',
    },
    ratingComment: {
        fontSize: 12,
        color: '#6C757D',
        fontStyle: 'italic',
    },
});



