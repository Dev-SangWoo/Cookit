import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SearchMain from './SearchMain';
import SearchList from './SearchList';
import SearchSummary from './SearchSummary';

const Stack = createNativeStackNavigator();

export default function SearchStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="SearchMain"
    >
      {/* 🔍 검색 메인 화면 */}
      <Stack.Screen name="SearchMain" component={SearchMain} />

      {/* 📋 검색 결과 목록 */}
      <Stack.Screen name="SearchList" component={SearchList} />

      {/* 🧾 검색 요약 화면 */}
      <Stack.Screen name="SearchSummary" component={SearchSummary} />
    </Stack.Navigator>
  );
}
