import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Auth 관련 imports
import { AuthProvider } from './contexts/AuthContext';
import AuthNavigator from './components/AuthNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AuthNavigator />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
