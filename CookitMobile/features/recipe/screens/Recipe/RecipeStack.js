import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RecipeMain from '@features/recipe/screens/Recipe/RecipeMain';
import RecipeRating from '@features/recipe/screens/Recipe/RecipeRating';
import RecipeRecord from '@features/recipe/screens/Recipe/RecipeRecord';

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


