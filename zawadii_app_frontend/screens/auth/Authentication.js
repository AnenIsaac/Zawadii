import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { ToastAndroid } from 'react-native';
import { Alert } from 'react-native';



const Authentication = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [wrongPassword, setWrongPassword] = useState(false);
  
  // Signup form state
  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });


  const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^[0-9]{10,15}$/;
  return phoneRegex.test(phone);
};

  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isPasswordStrong, setIsPasswordStrong] = useState(true);


  const isStrongPassword = (password) => {
  const minLength = /.{8,}/;
  const upper = /[A-Z]/;
  const lower = /[a-z]/;
  const number = /[0-9]/;
  const special = /[!@#$%^&*(),.?":{}|<>]/;


//   const isStrongPassword = (password) => {
//   const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
//   return strongPasswordRegex.test(password);
// };


  return (
    minLength.test(password) &&
    upper.test(password) &&
    lower.test(password) &&
    number.test(password) &&
    special.test(password)
  );
};

  // Common handlers
  const switchTab = (tab) => {
    setActiveTab(tab);
  };

  // Login handlers
  const handleLoginChange = (field, value) => {
    setLoginData({
      ...loginData,
      [field]: value
    });
    
    // Reset wrong password state if user is typing in password field
    if (field === 'password' && wrongPassword) {
      setWrongPassword(false);
    }
  };

  const toggleLoginPasswordVisibility = () => {
    setShowLoginPassword(!showLoginPassword);
  };

  const handleContinue = () => {

    const { email, password } = loginData;

  // Empty fields check
  if ( !email || !password ) {
    Alert.alert('Missing Fields', 'Please fill in all fields.');
    return;
  }

    // Validate credentials
    if (!isValidEmail(email)) {
    Alert.alert('Invalid Email', 'Please enter a valid email address.');
    return;
  }
    // For demo purposes, just showing wrong password state
    setWrongPassword(true);
    
    // If successful, navigate to home screen
    navigation.navigate('Main', { screen: 'HomeScreen' });
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  // Signup handlers
  const handleSignupChange = (field, value) => {
  setSignupData({
    ...signupData,
    [field]: value
  });

  if (field === 'password') {
    setIsPasswordStrong(isStrongPassword(value));
  }
};

  const toggleSignupPasswordVisibility = () => {
    setShowSignupPassword(!showSignupPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const toggleTermsAccepted = () => {
    setTermsAccepted(!termsAccepted);
  };

 
const handleNext = () => {
  const { fullName, email, phoneNumber, password, confirmPassword } = signupData;

  // Empty fields check
  if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
    Alert.alert('Missing Fields', 'Please fill in all fields.');
    return;
  }

  // Email validation
  if (!isValidEmail(email)) {
    Alert.alert('Invalid Email', 'Please enter a valid email address.');
    return;
  }

  // Phone number validation
  if (!isValidPhoneNumber(phoneNumber)) {
    Alert.alert('Invalid Phone Number', 'Please enter a valid phone number.');
    return;
  }

  // Password strength check
  if (!isStrongPassword(password)) {
    Alert.alert('Weak Password', 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
    return;
  }

  // Password match check
  if (password !== confirmPassword) {
    Alert.alert('Password Mismatch', 'Passwords do not match.');
    return;
  }

  // Terms not accepted
  if (!termsAccepted) {
    Alert.alert('Terms Required', 'You must agree to the terms and conditions.');
    return;
  }

  // If all checks pass
  ToastAndroid.show('Account created successfully! Please log in.', ToastAndroid.SHORT);

  setSignupData({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  setTermsAccepted(false);

   navigation.navigate('EnterSignupCode');
};



   const isFormValid = 
  isStrongPassword(signupData.password) &&
  signupData.password === signupData.confirmPassword &&
  termsAccepted;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'login' && styles.activeTab]}
              onPress={() => switchTab('login')}
            >
              <Text style={activeTab === 'login' ? styles.tabTextActive : styles.tabTextInactive}>
                Log in
              </Text>
              {activeTab === 'login' && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
              onPress={() => switchTab('signup')}
            >
              <Text style={activeTab === 'signup' ? styles.tabTextActive : styles.tabTextInactive}>
                Sign up
              </Text>
              {activeTab === 'signup' && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          </View>

          {/* Login Form */}
          {activeTab === 'login' && (
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Your Email</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="contact@discodetech.com"
                    keyboardType="email-address"
                    value={loginData.email}
                    onChangeText={(text) => handleLoginChange('email', text)}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[styles.inputContainer, wrongPassword && styles.errorInput]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    secureTextEntry={!showLoginPassword}
                    value={loginData.password}
                    onChangeText={(text) => handleLoginChange('password', text)}
                  />
                  <TouchableOpacity style={styles.iconContainer} onPress={toggleLoginPasswordVisibility}>
                    <Feather name={showLoginPassword ? "eye" : "eye-off"} size={20} color="#666" />
                  </TouchableOpacity>
                </View>
                
                {/* Error message and Forgot password */}
                <View style={styles.passwordHelpContainer}>
                  {wrongPassword && (
                    <Text style={styles.errorText}>Wrong password</Text>
                  )}
                  <TouchableOpacity 
                    style={styles.forgotPasswordContainer} 
                    onPress={handleForgotPassword}
                  >
                    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleContinue}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
              </TouchableOpacity>

              

              {/* No Account Prompt */}
              <View style={styles.accountPromptContainer}>
                <Text style={styles.accountPromptText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => switchTab('signup')}>
                  <Text style={styles.accountPromptLink}>Sign up</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Signup Form */}
          {activeTab === 'signup' && (
            <View style={styles.form}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Get Started</Text>
                <Text style={styles.subtitle}>by creating a free account </Text>
              </View>

              {/* Full Name Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  value={signupData.fullName}
                  onChangeText={(text) => handleSignupChange('fullName', text)}
                />
                <View style={styles.iconContainer}>
                 <Feather name="user" size={20} color="#666" />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  keyboardType="email-address"
                  value={signupData.email}
                  onChangeText={(text) => handleSignupChange('email', text)}
                />
                <View style={styles.iconContainer}>
                  <Feather name="mail" size={20} color="#666" style={styles.inputIcon} />
                </View>
              </View>

              {/* Phone Number Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Phone number"
                  keyboardType="phone-pad"
                  value={signupData.phoneNumber}
                  onChangeText={(text) => handleSignupChange('phoneNumber', text)}
                />
                <View style={styles.iconContainer}>
                 <Feather name="phone" size={20} color="#666" />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry={!showSignupPassword}
                  value={signupData.password}
                  onChangeText={(text) => handleSignupChange('password', text)}
                />
                <TouchableOpacity style={styles.iconContainer} onPress={toggleSignupPasswordVisibility}>
                    <Feather name={showSignupPassword ? "eye" : "eye-off"} size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {!isPasswordStrong && signupData.password.length > 0 && (
                <Text style={styles.weakPasswordText}>
                  Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
                </Text>
              )}

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  secureTextEntry={!showConfirmPassword}
                  value={signupData.confirmPassword}
                  onChangeText={(text) => handleSignupChange('confirmPassword', text)}
                />
                <TouchableOpacity style={styles.iconContainer} onPress={toggleConfirmPasswordVisibility}>
                    <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {signupData.confirmPassword.length > 0 && signupData.password !== signupData.confirmPassword && (
                  <Text style={styles.weakPasswordText}>
                    Passwords do not match.
                  </Text>
                )}

              {/* Terms & Conditions */}
              <View style={styles.termsContainer}>
                 <TouchableOpacity onPress={toggleTermsAccepted}>
                  <Feather
                    name={termsAccepted ? "check-square" : "square"}
                    size={20}
                    color="#666"
                    style={styles.checkbox}
                  />
              </TouchableOpacity>
                <Text style={styles.termsText}>
                  By checking this box you agree to our <Text style={styles.termsLink}>Terms</Text> and <Text style={styles.termsLink}>Conditions</Text>.
                </Text>
              </View>

              {/* Next Button */}
              <TouchableOpacity
                  style={[styles.primaryButton, (!isFormValid && styles.disabledButton)]}
                  onPress={handleNext}
                  disabled={!isFormValid}
                >
                  <Text style={styles.primaryButtonText}>Next</Text>
                  <Text style={styles.nextButtonIcon}>›</Text>
                </TouchableOpacity>


              {/* Already Have Account Prompt */}
              <View style={styles.accountPromptContainer}>
                <Text style={styles.accountPromptText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => switchTab('login')}>
                  <Text style={styles.accountPromptLink}>Log in</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 30,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 0,
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#FF8C00',
  },
  tabTextInactive: {
    color: '#999',
    fontSize: 16,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FF8C00',
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    width: '100%',
     marginTop: 20,
    marginBottom: 30,
  },
  // Login specific styles
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
    marginBottom: 8,
  },
  passwordHelpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
  },
  forgotPasswordContainer: {
    marginLeft: 'auto',
  },
  forgotPasswordText: {
    color: '#FF8C00',
    fontSize: 14,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#999',
    fontSize: 14,
  },
  socialButtonsContainer: {
    gap: 15,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  socialIconContainer: {
    marginRight: 10,
    width: 20,
    alignItems: 'center',
  },
  appleIcon: {
    fontSize: 16,
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  socialButtonText: {
    fontSize: 16,
    color: '#333',
  },
  // Signup specific styles
 header: {
  marginBottom: 30,
  alignItems: 'center',
  paddingHorizontal: 20, // give it a bit more room to breathe
  width: '100%',         // ensure full width of screen
},

  title: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 5,
  },
  subtitle: {
  fontSize: 16,
  color: '#666',
  textAlign: 'center', // ensure proper wrapping in center
},

  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  checkbox: {
    // width: 20,
    // height: 20,
    // borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: '#FF8C00',
    borderRadius: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 10,
    color: '#666',
  },
  termsLink: {
    color: '#FF8C00',
    fontWeight: '500',
  },
  nextButtonIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  // Common styles for both forms
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    height: 50,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  errorInput: {
    borderColor: '#FF6B6B',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    color: '#888',
  },
  primaryButton: {
    backgroundColor: '#FF8C00',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#FFCF9E',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  accountPromptContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  accountPromptText: {
    fontSize: 14,
    color: '#666',
  },
  accountPromptLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8C00',
  },
  weakPasswordText: {
  color: 'red',
  fontSize: 12,
  marginTop: 4,
  paddingHorizontal: 5
}

});

export default Authentication;
