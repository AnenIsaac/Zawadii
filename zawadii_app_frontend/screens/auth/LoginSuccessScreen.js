import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation, CommonActions } from '@react-navigation/native'; // Import CommonActions

const LoginSuccessScreen = () => {
  const navigation = useNavigation();
  const animationRef = useRef(null);

  useEffect(() => {
    animationRef.current?.play();
  }, []);

  const onAnimationFinish = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main' }], // Change 'MainTabs' to 'Main'
      })
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.content}>
        <View style={styles.animationContainer}>
          <LottieView
            ref={animationRef}
            source={require('../../assets/lottie/success_check.json')}
            autoPlay={false}
            loop={false}
            style={styles.animation}
            onAnimationFinish={onAnimationFinish}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  animationContainer: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});

export default LoginSuccessScreen;
