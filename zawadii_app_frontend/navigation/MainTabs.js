import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import RewardsScreen from '../screens/main/RewardsScreen';
import ScanScreen from '../screens/main/ScanScreen';
import Favourites from '../screens/main/Favourites';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          const activeColor = 'orange';
          const inactiveColor = color;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Rewards') {
            iconName = focused ? 'gift' : 'gift-outline';
          } else if (route.name === 'Scan') {
            iconName = focused ? 'scan' : 'scan-outline';
          } else if (route.name === 'Favourites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          // You can return any component that you like here!
          return <Ionicons name={iconName} size={size} color={focused ? activeColor : inactiveColor} />;
        },
        tabBarActiveTintColor: 'orange',
        tabBarInactiveTintColor: 'gray', // You can set a default inactive color
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Rewards" component={RewardsScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Favourites" component={Favourites} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabs;
