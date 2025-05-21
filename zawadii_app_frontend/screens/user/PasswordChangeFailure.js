import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { Feather } from 'react-native-vector-icons'; // Make sure this is imported

const PasswordChangeFailure= () => {
  const navigation = useNavigation();

  const handleTryAgain = () => {
    // Navigate back to reset password screen
    navigation.navigate('ResetPassword');
  };

  const handleBackToLogin = () => {
    // Navigate back to login screen
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.errorContainer}>
        <Feather name="x" size={45} color="red" />
        </View>
        <Text style={styles.title}>Password changing failed!</Text>
        <Text style={styles.subtitle}>
          There's a temporary problem with the service, 
          please try again later.
        </Text>
        
        <TouchableOpacity 
          style={styles.tryAgainButton}
          onPress={handleTryAgain}
        >
          <Text style={styles.tryAgainText}>TRY AGAIN</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.backToLoginButton}
          onPress={handleBackToLogin}
        >
          <Text style={styles.backToLoginText}>BACK TO LOGIN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={() => navigation.navigate("PasswordChangeSuccess")}>
          <Text style={styles.nextButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDE7E9', // Light red background
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorContainer: {
    
  width: 60,
  height: 60,
  borderRadius: 50,
  backgroundColor: '#FFFFFF', // White background
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 20,
  borderWidth: 2, // Added border to highlight error
  borderColor: 'red', // Red border color to indicate error
  },
  errorSymbol: {
    fontSize: 50,
    color: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 70,
    textAlign: 'center',
  },
  tryAgainButton: {
    backgroundColor: '#007BFF',
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 15,
    marginTop: 35,
  },
  tryAgainText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  backToLoginButton: {
    backgroundColor: '#000000',
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
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

export default PasswordChangeFailure;