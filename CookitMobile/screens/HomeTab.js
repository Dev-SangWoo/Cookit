import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './Home';
import History from './History';
import Shopping from './Shopping';
import Profile from './Profile';
import AIAnalyze from './AIAnalyze';
import Ionicons from '@expo/vector-icons/Ionicons';



const Tab = createBottomTabNavigator();

const HomeTab = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: 'orange',
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'History') iconName = 'time-outline';
          else if (route.name === 'Shopping') iconName = 'cart-outline';
          else if (route.name === 'Profile') iconName = 'person-outline';
          else if (route.name === 'AIAnalyze') iconName = 'sparkles-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="History" component={History} />
      <Tab.Screen name="Shopping" component={Shopping} />
      <Tab.Screen name="AIAnalyze" component={AIAnalyze} options={{ title: 'AI 분석' }} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default HomeTab;

// 홈 화면의 하단 탭 화면에 보여질 부분은 
// Home 화면에 하단 탭을 더한 HomeTaaab.js 파일