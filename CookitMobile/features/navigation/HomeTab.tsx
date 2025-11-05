import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// 화면 imports
import HomeMain from '@features/recipe/screens/HomeMain';
import Ingredients from '@features/refrigerator/screens/Ingredients';
import CommunityStack from '@features/community/screens/community/CommunityStack';
import ProfileMain from '@features/profile/screens/Profile/ProfileMain';

const Tab = createBottomTabNavigator();

export default function HomeTab() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Refrigerator') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Community') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeMain}
        options={{
          tabBarLabel: '홈',
        }}
      />
      <Tab.Screen 
        name="Refrigerator" 
        component={Ingredients}
        options={{
          tabBarLabel: '냉장고',
        }}
      />
      <Tab.Screen 
        name="Community" 
        component={CommunityStack}
        options={{
          tabBarLabel: '커뮤니티',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileMain}
        options={{
          tabBarLabel: '프로필',
        }}
      />
    </Tab.Navigator>
  );
}

