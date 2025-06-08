import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  Alert,
  StatusBar,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ToastAndroid } from 'react-native';
import { supabase } from '../../supabaseClient';
import { useNavigation, useRoute } from '@react-navigation/native';

const EnterSignupCode = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Extract email, phoneNumber and fullName from route params or use a placeholder
  const email = route.params?.email || 'contact@dpscode.com';
  const fullName = route.params?.fullName || '';
  const phoneNumber = route.params?.phoneNumber || '';
  const gender = route.params?.gender || '';
  const password = route.params?.password || '';
  
  // State for verification code (6 digits)
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isValid, setIsValid] = useState(false);
  
  // Refs for TextInput focus management
  const inputRefs = useRef([]);

  // Check if code is complete
  useEffect(() => {
    const codeComplete = code.every(digit => digit !== '');
    setIsValid(codeComplete);
  }, [code]);

  // Handle input changes
  const handleCodeChange = (text, index) => {
    if (text.length > 1) {
      // If pasting multiple digits, distribute them across fields
      const digits = text.split('').slice(0, 6);
      const newCode = [...code];
      
      digits.forEach((digit, idx) => {
        if (index + idx < 6) {
          newCode[index + idx] = digit;
        }
      });
      
      setCode(newCode);
      
      // Focus on appropriate field
      const focusIndex = Math.min(index + digits.length, 5);
      if (focusIndex < 6) {
        inputRefs.current[focusIndex].focus();
      } else {
        Keyboard.dismiss();
      }
    } else {
      // Normal single digit input
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);
      
      // Auto-advance to next field
      if (text !== '' && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  // Handle backspace
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) {
      // Move to previous field on backspace when current field is empty
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    if (!isValid) {
      return;
    }
    const otpCode = code.join('');

    try {
      // 1) Call Supabase to verify OTP (type: 'signup')
      const { data: verifyData, error: verifyError } =
        await supabase.auth.verifyOtp({
          email,
          token: otpCode,
          type: 'signup',
        });

      if (verifyError) {
        console.error('OTP verification error:', verifyError.message);
        Alert.alert(
          'Invalid Code',
          'The code you entered is incorrect or expired.'
        );
        return;
      }

      // Now we have a valid session and `verifyData.user` is the confirmed user
      const user = verifyData.user;
      const userId = user.id;
      // Use the passed‐in params if available; otherwise read from user_metadata
      const fullName = fullName || user.user_metadata?.full_name || '';
      const phoneNumber = phoneNumber || user.user_metadata?.phone || '';
      const gender = gender || user.user_metadata?.gender || 'Male';

      // 2) Insert into customers table under RLS
      const { error: customerError } = await supabase
        .from('customers')
        .insert([
          {
            id: userId, // Must match auth.uid()
            full_name: fullName,
            email: email,
            phone_number: phoneNumber,
            gender: gender,
          },
        ]);

      if (customerError) {
        console.error(
          'Error inserting into customers:',
          customerError.message
        );
        Alert.alert(
          'Database Error',
          'Your account was confirmed, but we could not save your customer record. Please try again.'
        );
        return;
      }

      // 3) Success! Show a toast and navigate into the app
      ToastAndroid.show(
        'Account confirmed! Welcome aboard.',
        ToastAndroid.SHORT
      );

      navigation.navigate('SignupSuccess');
    } catch (err) {
      console.error('Unexpected error in handleVerify:', err);
      Alert.alert(
        'Unexpected Error',
        'Something went wrong. Please try again later.'
      );
    }

  };

  const handleResendEmail = async () => {
    try {
      // Re-call signUp to force Supabase to send another 'signup' OTP.
      const { data: resendData, error: resendError } = await supabase.auth.signUp({ 
        email, password, 
        options: { data: { full_name: fullName, phone: phoneNumber, gender: gender } } 
      });

      if (resendError) {
        console.error('Error resending OTP:', resendError.message);
        Alert.alert(
          'Could not resend code',
          'Please check your email address or try again later.'
        );
        return;
      }

      ToastAndroid.show(
        'Verification code resent to your email.',
        ToastAndroid.SHORT
      );
    } catch (err) {
      console.error('Unexpected error in handleResendEmail:', err);
      Alert.alert(
        'Unexpected Error',
        'Cannot resend code at the moment. Try again in a bit.'
      );
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  // Mask email for privacy (show only first 3 chars + domain)
  const maskEmail = (email) => {
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    
    const username = parts[0];
    const domain = parts[1];
    
    const visiblePart = username.substring(0, 3);
    const hiddenPart = '•'.repeat(Math.max(1, username.length - 3));
    
    return `${visiblePart}${hiddenPart}@${domain}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>
          We sent a code to {maskEmail(email)}{'\n'}
          Enter 6-digit code mentioned in the email
        </Text>
        
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => inputRefs.current[index] = ref}
              style={styles.codeInput}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              autoFocus={index === 0}
            />
          ))}
        </View>
        
        <TouchableOpacity 
          style={[
            styles.verifyButton, 
            isValid ? styles.verifyButtonActive : styles.verifyButtonInactive
          ]}
          onPress={handleVerify}
          disabled={!isValid}
        >
          <Text style={styles.verifyButtonText}>Verify Code</Text>
        </TouchableOpacity>
        
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Haven't got the email yet? </Text>
          <TouchableOpacity onPress={handleResendEmail}>
            <Text style={styles.resendLink}>Resend email</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 22,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  codeInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 5,
  },
  verifyButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  verifyButtonActive: {
    backgroundColor: '#FF8C00', // Orange color from the image
  },
  verifyButtonInactive: {
    backgroundColor: '#FFCC99', // Lighter orange for inactive state
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  resendText: {
    color: '#666666',
    fontSize: 14,
  },
  resendLink: {
    color: '#FF8C00',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EnterSignupCode;