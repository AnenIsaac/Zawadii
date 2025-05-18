import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native'; // Import useNavigation and useRoute hooks

const BottomNav = () => {
  const navigation = useNavigation();  // Access navigation using the hook
  const route = useRoute();  // Get current screen name to highlight active tab

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => navigation.navigate('HomeScreen')}
      >
        <Ionicons 
          name="home" 
          size={24} 
          color={route.name === 'HomeScreen' ? "#FF8924" : "#AAAAAA"} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => navigation.navigate('SearchScreen')}
      >
        <Ionicons 
          name="search" 
          size={24} 
          color={route.name === 'SearchScreen' ? "#FF8924" : "#AAAAAA"} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => navigation.navigate('ScanScreen')}
      >
        <View style={styles.qrButtonContainer}>
          <Ionicons 
            name="scan" 
            size={28} 
            color={route.name === 'PointsEarnedScreen' ? "#FF8924" : "#AAAAAA"} 
          />
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => navigation.navigate('RewardsScreen')}
      >
        <Ionicons 
          name="gift-outline" 
          size={24} 
          color={route.name === 'RewardsScreen' ? "#FF8924" : "#AAAAAA"} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => navigation.navigate('ProfileScreen')}
      >
        <Ionicons 
          name="person-outline" 
          size={24} 
          color={route.name === 'ProfileScreen' ? "#FF8924" : "#AAAAAA"} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: 'white',
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrButtonContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    borderWidth: 4,
    borderColor: 'white',
  },
});

export default BottomNav;

