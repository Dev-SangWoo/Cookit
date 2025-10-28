import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RecipeMain from './RecipeMain';

const Stack = createNativeStackNavigator();

export default function RecipeStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="RecipeMain"
    >
      <Stack.Screen name="RecipeMain" component={RecipeMain} />
    </Stack.Navigator>
  );
}


