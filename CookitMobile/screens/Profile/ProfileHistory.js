// 요리 활동 기록 화면(히스토리) / 미완성
// user_recipe_activities 테이블 정리가 끝나면 구현 예정

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// TODO: 이 컴포넌트에 사용자의 요리 기록(Recipe History) 데이터를 불러와 보여주는 로직을 추가해야 합니다.

const ProfileHistory = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>요리 기록</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.mainText}>이곳은 사용자의 요리 기록이 표시될 공간입니다.</Text>
        <Text style={styles.subText}>완료된 요리 목록, 진행 상황 등 다양한 정보를 보여줄 수 있어요.</Text>
        {/*
          TODO: 
          1. Firestore 또는 Supabase에서 'user_history' 같은 테이블을 만들어 데이터를 가져옵니다.
          2. FlatList를 사용하여 요리 기록 카드들을 나열합니다.
        */}
      </View>
    </SafeAreaView>
  );
};

export default ProfileHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  }
});