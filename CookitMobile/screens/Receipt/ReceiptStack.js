import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReceiptMain from './ReceiptMain';

const Stack = createNativeStackNavigator();

export default function ReceiptStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="ReceiptMain"
    >
      <Stack.Screen name="ReceiptMain" component={ReceiptMain} />
    </Stack.Navigator>
  );
}



