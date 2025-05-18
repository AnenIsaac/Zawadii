
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('OnboardingStep1');
    }, 2000);
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
