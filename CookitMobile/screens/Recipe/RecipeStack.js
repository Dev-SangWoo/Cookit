import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RecipeMain from './RecipeMain';
import RecipeSummary from './RecipeSummary'; // ✅ 추가

const Stack = createNativeStackNavigator();

export default function RecipeStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="RecipeMain"
    >
      {/* ✅ 레시피 메인 화면 */}
      <Stack.Screen name="RecipeMain" component={RecipeMain} />

      {/* ✅ 요약 보기 화면 */}
      <Stack.Screen name="RecipeSummary" component={RecipeSummary} />
    </Stack.Navigator>
  );
}
