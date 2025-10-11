// 홈 화면 하단 탭

import React from 'react';
import { BottomTabNavigationProp, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CommunityStack from './community/CommunityStack'; 
import { CommunityStackParamList } from './community/CommunityStack';
import HomeMain from './Home/HomeMain';
import Ingredients from './Home/Ingredients';
import ProfileMain from './Profile/ProfileMain';
import Ionicons from '@expo/vector-icons/Ionicons';

export type HomeTabParamList = {
  HomeMain: undefined;
   CommunityStack: undefined;
  ProfileMain: undefined;
  Ingredients: undefined;
};

const Tab = createBottomTabNavigator<HomeTabParamList>();

const HomeTab = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: 'orange',
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'HomeMain') iconName = 'home-outline';
          else if (route.name === 'ProfileMain') iconName = 'person-outline';
          else if (route.name === 'CommunityStack') iconName = 'people-outline';
          else if (route.name === 'Ingredients') iconName = 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeMain" component={HomeMain} />
      <Tab.Screen name="Ingredients" component={Ingredients} />
      <Tab.Screen name="CommunityStack" component={CommunityStack} />
      <Tab.Screen name="ProfileMain" component={ProfileMain} />

    </Tab.Navigator>
  );
};

export default HomeTab;
