import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RecipeMain from './RecipeMain';
import RecipeRating from './RecipeRating';
import RecipeRecord from './RecipeRecord';

const Stack = createNativeStackNavigator();

export default function RecipeStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="RecipeMain"
    >
      <Stack.Screen name="RecipeMain" component={RecipeMain} />
      <Stack.Screen name="RecipeRating" component={RecipeRating} />
      <Stack.Screen name="RecipeRecord" component={RecipeRecord} />
    </Stack.Navigator>
  );
}


