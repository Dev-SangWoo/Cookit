// App.js
import React, {useEffect} from 'react';
import { StyleSheet, View, ActivityIndicator,  } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Auth 관련 imports
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthScreen from './components/AuthScreen';

// 화면 imports
import ModalSummary from './screens/modal/ModalSummary';
import Search from './screens/search';
import Profile from './screens/Profile';
import Ingredients from './screens/Ingredients';
import Summary from './screens/Summary';
import SearchList from './screens/SearchList';
import SummaryChoice from './screens/SummaryChoice';
import ModalDelete from './screens/modal/ModalDelete';
import Recipe from './screens/Recipe';
import HomeTab from './screens/HomeTab';
import ModalLogout from './screens/modal/ModalLogout';
import ModalSelect from './screens/modal/ModalSelect';
import Community from './screens/community/Community';
import CreatePost from './screens/community/CreatePost';
import PostDetail from './screens/community/PostDetail';
import NicknameSetup from './screens/sign/NicknameSetup';
import ProfileSetup from './screens/sign/ProfileSetup';
import PreferenceSetup from './screens/sign/PreferenceSetup';
import IngredientsSetup from './screens/sign/IngredientsSetup';
import ModalInput from './screens/modal/ModalInput';

const Stack = createNativeStackNavigator();

function AppStack() {
  const { user, loading, session } = useAuth();
const navigation = useNavigation();

  // 🚨 로딩 중이거나 유저가 없는 경우를 먼저 처리합니다.
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  // 2. 세션이 없는 경우, 로그인 화면만 렌더링
  if (!session) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthScreen} />
      </Stack.Navigator>
    );
  }

  // 3. 세션이 있지만, user 객체가 null인 경우 (프로필 로딩 실패 등), 로그인 화면으로 돌아가게 함
  // 이 케이스는 발생하지 않는 것이 좋지만, 안전장치로 추가
  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthScreen} />
      </Stack.Navigator>
    );
  }

  // 4. 세션과 유저 객체가 모두 있는 경우, 온보딩 상태에 따라 라우팅
  // **주의: 온보딩 로직이 AuthProvider가 아닌, 로그인 성공 이후에 실행되도록 구성해야 함**
  // console.log('--- 현재 사용자 상태 ---');
  // console.log('user.name:', user.name);
  // console.log('user.bio:', user.bio);
  // console.log('user.cooking_level:', user.cooking_level);
  // console.log('user.favorite_cuisines:', user.favorite_cuisines);
  // console.log('user.dietary_restrictions:', user.dietary_restrictions);
  // console.log('-------------------------');

  let initialRouteName;

  if (user.name === null || user.cooking_level === null) {
    initialRouteName = 'NicknameSetup';
  } else if (user.bio === null ) {
    initialRouteName = 'ProfileSetup';
  } else if (user.favorite_cuisines === null ) {
    initialRouteName = 'PreferenceSetup';
  } else {
    initialRouteName = 'HomeTab';
  }

  useEffect(() => {
    // 모든 필수 정보가 채워졌는지 확인하는 함수
    const isProfileComplete = user?.name && user?.bio && user?.cooking_level && user?.favorite_cuisines;
    
    // 프로필이 완료되었다면 메인 화면으로 이동
    if (isProfileComplete) {
      console.log("프로필 완료! 홈 화면으로 리셋");
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeTab' }],
      });
    }
  }, [user, navigation]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
      {/* 로그인 화면*/}
      <Stack.Screen name="NicknameSetup" component={NicknameSetup} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetup} />
      <Stack.Screen name="PreferenceSetup" component={PreferenceSetup} />
      <Stack.Screen name="IngredientsSetup" component={IngredientsSetup} />

      {/* 메인 스크린들 */}
      <Stack.Screen name="HomeTab" component={HomeTab} />
      <Stack.Screen name="Search" component={Search} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Ingredients" component={Ingredients} />
      <Stack.Screen name="Community" component={Community} />
      <Stack.Screen name="CreatePost" component={CreatePost} />
      <Stack.Screen name="PostDetail" component={PostDetail} />
      <Stack.Screen name="Summary" component={Summary} />
      <Stack.Screen name="SearchList" component={SearchList} />
      <Stack.Screen name="SummaryChoice" component={SummaryChoice} />
      <Stack.Screen name="Recipe" component={Recipe} />

      {/* 모달 화면*/}
      <Stack.Screen name="ModalSummary" component={ModalSummary} />
      <Stack.Screen name="ModalDelete" component={ModalDelete} />
      <Stack.Screen name="ModalLogout" component={ModalLogout} />
      <Stack.Screen name="ModalSelect" component={ModalSelect} />
      <Stack.Screen name="ModalInput" component={ModalInput} />
    </Stack.Navigator>
  );
}

// 로딩 상태를 관리하고 네비게이션을 렌더링하는 래퍼 컴포넌트
function AppNavWrapper() {
  const { loading } = useAuth(); // ✅ useAuth는 여기서도 안전하게 사용됩니다.

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppStack />
    </NavigationContainer>
  );
}

// 최종 앱 컴포넌트
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppNavWrapper />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
});