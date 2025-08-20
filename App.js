// App.js
import { StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { navigationRef } from './lib/navigationRef';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Alert } from 'react-native';

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
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('App.js Auth State Change Event:', event);

      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        if (session?.user) {
          console.log('App.js: User signed in. Checking profile...');

          try {
            const userId = session.user.id;
            console.log('App.js: User ID to check:', userId);
            console.log('App.js: Starting Supabase query...');
            const { data: profiles, error } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', userId)
              .limit(1);

            console.log('App.js: Supabase query completed.');
            console.log('App.js: Profiles data:', profiles);

            if (error) {
              console.error('Supabase query error:', error);
              Alert.alert('프로필 로딩 오류', '프로필 정보를 가져오는 데 실패했습니다.');
              setInitialRoute('Login'); // 오류 시 로그인 화면으로
              return;
            }

            const profile = profiles?.[0] || null;
            if (profile) {
              console.log('App.js: Profile data found:', profile);
              console.log('App.js: Profile exists. Navigating to HomeTab.');
              setInitialRoute('HomeTab');
              if (navigationRef.current?.getCurrentRoute()?.name !== 'HomeTab') {
                navigationRef.current?.reset({
                  index: 0,
                  routes: [{ name: 'HomeTab' }],
                });
              }
            } else {
              console.log('App.js: No profile found for ID:', userId);
              console.log('App.js: No profile. Navigating to NicknameSetup.');
              const userMetadata = session.user.user_metadata || {};
              setInitialRoute('NicknameSetup');
              if (navigationRef.current?.getCurrentRoute()?.name !== 'NicknameSetup') {
                navigationRef.current?.reset({
                  index: 0,
                  routes: [{
                    name: 'NicknameSetup',
                    params: {
                      userId: session.user.id,
                      email: session.user.email,
                      googleName: userMetadata.full_name || '',
                      googleAvatar: userMetadata.avatar_url || ''
                    }
                  }],
                });
              }
            }
          } catch (e) {
            console.error('App.js: An unexpected error occurred while checking profile:', e);
            Alert.alert('오류', '로그인 처리 중 문제가 발생했습니다.');
            setInitialRoute('Login'); // 오류 시 로그인 화면으로
          }
        } else {
          setInitialRoute('Login');
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('App.js: User signed out. Navigating to Login.');
        setInitialRoute('Login');
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (!initialRoute) return null;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => console.log('NavigationContainer is ready!')}
        >
          <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
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