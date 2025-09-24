// HomeTab.tsx

import React from 'react';
import { BottomTabNavigationProp, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CommunityStack from './community/CommunityStack';
import { CommunityStackParamList } from './community/CommunityStack';
import Home from './Home';
// import History from './History';
// import Shopping from './Shopping';
import Ingredients from './Ingredients';
import Profile from './Profile';
import Ionicons from '@expo/vector-icons/Ionicons';

export type HomeTabParamList = {
  Home: undefined;
  // History: undefined;
  Community: undefined;
  // Shopping: undefined;
  Profile: undefined;
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
          if (route.name === 'Home') iconName = 'home-outline';
          // else if (route.name === 'History') iconName = 'time-outline';
          // else if (route.name === 'Shopping') iconName = 'cart-outline';
          else if (route.name === 'Profile') iconName = 'person-outline';
          else if (route.name === 'Community') iconName = 'person-outline';
          else if (route.name === 'Ingredients') iconName = 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      {/* <Tab.Screen name="History" component={History} /> */}
      <Tab.Screen name="Ingredients" component={Ingredients} />
      <Tab.Screen name="Community" component={CommunityStack} />
      {/* <Tab.Screen name="Shopping" component={Shopping} /> */}
      <Tab.Screen name="Profile" component={Profile} />

    </Tab.Navigator>
  );
};

export default HomeTab;