import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import Feather from 'react-native-vector-icons/Feather';


const SignupSuccess = () => {
  const navigation = useNavigation();

//   const handleBackToLogin = () => {
//     // Navigate back to login screen
//     navigation.navigate('Authentication');
//   };

useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Auth', { screen: 'Authentication' });
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.checkmarkContainer}>
        <Feather name="check" size={45} color="orange" />
        </View>
        <Text style={styles.title}>Signup Successful!</Text>
        {/* <Text style={styles.subtitle}>Congratulations! Your password {'\n'} has been changed. Click continue to login.</Text>
         */}
        {/* <TouchableOpacity 
          style={styles.backToLoginButton}
          onPress={handleBackToLogin}
        >
          <Text style={styles.backToLoginText}>Continue</Text>
        </TouchableOpacity> */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Light green background
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  checkmarkContainer: {
    // width: 100,
    // height: 100,
    // borderRadius: 50,
    // backgroundColor: '#4CAF50', // Green color
    // justifyContent: 'center',
    // alignItems: 'center',
    // marginBottom: 20,
    width: 60,
  height: 60,
  borderRadius: 50,
  backgroundColor: '#ffffff', // White background
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 20,
  borderWidth: 2, // Added border to highlight error
  borderColor: 'orange', // Red border color to indicate error
  },
  checkmark: {
    fontSize: 50,
    color: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#222',

  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 80,
    textAlign: 'center',
    
  },
  backToLoginButton: {
   
      height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#FF8C00',
  },
  backToLoginText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#FD8424',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 25,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: "800",
  },
});

export default SignupSuccess;