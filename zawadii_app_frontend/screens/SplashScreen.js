import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkLoginState = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
          // User is logged in, navigate to Main screen
          navigation.replace('Main'); 
        } else {
          // User is not logged in, navigate to Onboarding
          navigation.replace('Onboarding', { screen: 'OnboardingStep1' });
        }
      } catch (e) {
        // Error reading value or other error
        console.error("Failed to load user token from storage", e);
        // Fallback to onboarding/auth flow
        navigation.replace('Onboarding', { screen: 'OnboardingStep1' });
      }
    };

    const timer = setTimeout(() => {
      checkLoginState();
    }, 2000); // Keep the splash screen visible for a bit

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/thelogo.png')} // ✅ Use require for static local images
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.tagline}>A little extra, just for you</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
     flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 250, // 👈 Adjust this value as needed
  },
  logo: {
    width: 200, // Adjust to your image size
    height: 200,
    marginBottom: -15,
  },
  tagline: {
    fontSize: 16,
    color: '#FF8C00',
    fontWeight: '400',
    textAlign: 'center',
  },
});

export default SplashScreen;
