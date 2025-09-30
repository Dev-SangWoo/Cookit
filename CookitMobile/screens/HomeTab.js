import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './Home';
import History from './History';
import Shopping from './Shopping';
import Profile from './Profile';
import AIAnalyze from './AIAnalyze';
import CommunityStack from './community/CommunityStack';
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
          else if (route.name === 'Community') iconName = 'chatbubbles-outline';
          else if (route.name === 'AIAnalyze') iconName = 'sparkles-outline';
          else if (route.name === 'History') iconName = 'time-outline';
          else if (route.name === 'Profile') iconName = 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} options={{ title: '홈' }} />
      <Tab.Screen name="Community" component={CommunityStack} options={{ title: '커뮤니티' }} />
      <Tab.Screen name="AIAnalyze" component={AIAnalyze} options={{ title: 'AI 분석' }} />
      <Tab.Screen name="History" component={History} options={{ title: '내 레시피' }} />
      <Tab.Screen name="Profile" component={Profile} options={{ title: '프로필' }} />
    </Tab.Navigator>
  );
};

export default HomeTab;