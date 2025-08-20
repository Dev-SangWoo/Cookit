import { StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { navigationRef } from './lib/navigationRef';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import 'react-native-url-polyfill/auto';

import Login from './screens/Login';
import OnBoard from './screens/OnBoard';
import ModalSummary from './screens/modal/ModalSummary';
import Search from './screens/search';
import Profile from './screens/Profile';
import Summary from './screens/Summary';
import SearchList from './screens/SearchList';
import SummaryChoice from './screens/SummaryChoice';
import ModalDelete from './screens/modal/ModalDelete';
import Recipe from './screens/Recipe';
import HomeTab from './component/HomeTab';
import Community from './screens/Community';
import Post from './screens/Post';
import CreatePost from './screens/CreatePost';
import ModalComment from './screens/modal/ModalComment';
import NicknameSetup from './screens/sign/NicknameSetup';
import ProfileSetup from './screens/sign/ProfileSetup';
import PreferenceSetup from './screens/sign/PreferenceSetup';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();
const Stack = createNativeStackNavigator();

export default function App() {
  const [initialState, setInitialState] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
       await supabase.auth.signOut();
     console.log('App.js: Checking initial session...');
        const { data: { session } } = await supabase.auth.getSession();

      // 세션이 없으면 로그인 화면으로 설정
      if (!session) {
        console.log('App.js: No session found. Initializing to Login.');
        setInitialState({ routes: [{ name: 'Login' }] });
        return;
      }
      
      // 세션이 있으면 프로필 확인
      console.log('App.js: Session found. Checking for profile...');
      try {
        const { data: profiles, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .limit(1);

        if (error) {
          console.error('Supabase query error:', error);
          setInitialState({ routes: [{ name: 'Login' }] });
          return;
        }

        const profileExists = profiles && profiles.length > 0;
        if (profileExists) {
          console.log('App.js: Profile found. Navigating to HomeTab.');
          setInitialState({ routes: [{ name: 'HomeTab' }] });
        } else {
          console.log('App.js: No profile found. Navigating to NicknameSetup.');
          setInitialState({ 
            routes: [{ 
              name: 'NicknameSetup', 
              params: {
                userId: session.user.id,
                email: session.user.email,
                googleName: session.user.user_metadata.full_name,
                googleAvatar: session.user.user_metadata.avatar_url,
              }
            }]
          });
        }
      } catch (e) {
        console.error('App.js: An unexpected error occurred:', e);
        setInitialState({ routes: [{ name: 'Login' }] });
      }
    };
    
    checkAuth();
  }, []);

  if (!initialState) return null; // 초기 상태가 설정되기 전에는 아무것도 렌더링하지 않음

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer ref={navigationRef} initialState={initialState}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name='OnBoard' component={OnBoard} />
            <Stack.Screen name='Login' component={Login} />
            <Stack.Screen name='NicknameSetup' component={NicknameSetup} />
            <Stack.Screen name='ProfileSetup' component={ProfileSetup} />
            <Stack.Screen name='PreferenceSetup' component={PreferenceSetup} />
            <Stack.Screen name='HomeTab' component={HomeTab} />
            <Stack.Screen name='Search' component={Search} />
            <Stack.Screen name='Profile' component={Profile} />
            <Stack.Screen name='Summary' component={Summary} />
            <Stack.Screen name='SearchList' component={SearchList} />
            <Stack.Screen name='SummaryChoice' component={SummaryChoice} />
            <Stack.Screen name='Recipe' component={Recipe} />
            <Stack.Screen name='Community' component={Community} />
            <Stack.Screen name='CreatePost' component={CreatePost} />
            <Stack.Screen name='Post' component={Post} />
            <Stack.Screen name='ModalSummary' component={ModalSummary} />
            <Stack.Screen name='ModalDelete' component={ModalDelete} />
            <Stack.Screen name='ModalComment' component={ModalComment} />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({});