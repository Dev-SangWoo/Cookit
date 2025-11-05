import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SearchMain from '@features/recipe/screens/Search/SearchMain';
import SearchList from '@features/recipe/screens/Search/SearchList';
import SearchSummary from '@features/recipe/screens/Search/SearchSummary';

const Stack = createNativeStackNavigator();

export default function SearchStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="SearchMain"
    >
      <Stack.Screen name="SearchMain" component={SearchMain} />
      <Stack.Screen name="SearchList" component={SearchList} />
      <Stack.Screen name="SearchSummary" component={SearchSummary} />
    </Stack.Navigator>
  );
}