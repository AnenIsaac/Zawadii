import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

// Import Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import RewardsScreen from '../screens/main/RewardsScreen';
import ScanScreen from '../screens/main/ScanScreen';
import SearchScreen from '../screens/main/SearchScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

const styles = StyleSheet.create({
  scanButtonContainer: {
    top: -20, // Raise the button above the tab bar
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFA500',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#fff', // Optional: white border for contrast
  },
});

function ScanTabBarButton({ children, onPress }) {
  return (
    <TouchableOpacity
      style={styles.scanButtonContainer}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.scanButton}>
        <Ionicons name="scan" size={32} color="#fff" />
      </View>
    </TouchableOpacity>
  );
}

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
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
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
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <Ionicons name="scan" size={28} color={focused ? "#FFA500" : "#ccc"} />
          ),
          tabBarButton: (props) => <ScanTabBarButton {...props} />,
        }}
      />
      <Tab.Screen name="Rewards" component={RewardsScreen} />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ headerShown: false }} 
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
