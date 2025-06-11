import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

const MODERN_PRIMARY_COLOR = '#FFA500'; // Or another color like '#007AFF' for blue

const ScannerFrame = () => {
  const scanLineAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnimation, {
          toValue: 1,
          duration: 2500, // Slower, more subtle animation
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnimation, {
          toValue: 0,
          duration: 0, // Reset immediately
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [scanLineAnimation]);

  const scanLineTranslateY = scanLineAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 240], // Adjust based on frameHeight - lineHeight
  });

  const frameSize = 250;
  const cornerLength = 30;
  const cornerThickness = 4; // Thicker, more visible corners

  return (
    <View style={styles.container}>
      <View style={[styles.scannerFrame, { width: frameSize, height: frameSize }]}>
        {/* Corner Brackets */}
        <View style={[styles.cornerBracket, styles.topLeft, { width: cornerLength, height: cornerThickness, top: -cornerThickness/2, left: -cornerThickness/2 }]} />
        <View style={[styles.cornerBracket, styles.topLeft, { width: cornerThickness, height: cornerLength, top: -cornerThickness/2, left: -cornerThickness/2 }]} />

        <View style={[styles.cornerBracket, styles.topRight, { width: cornerLength, height: cornerThickness, top: -cornerThickness/2, right: -cornerThickness/2 }]} />
        <View style={[styles.cornerBracket, styles.topRight, { width: cornerThickness, height: cornerLength, top: -cornerThickness/2, right: -cornerThickness/2 }]} />

        <View style={[styles.cornerBracket, styles.bottomLeft, { width: cornerLength, height: cornerThickness, bottom: -cornerThickness/2, left: -cornerThickness/2 }]} />
        <View style={[styles.cornerBracket, styles.bottomLeft, { width: cornerThickness, height: cornerLength, bottom: -cornerThickness/2, left: -cornerThickness/2 }]} />

        <View style={[styles.cornerBracket, styles.bottomRight, { width: cornerLength, height: cornerThickness, bottom: -cornerThickness/2, right: -cornerThickness/2 }]} />
        <View style={[styles.cornerBracket, styles.bottomRight, { width: cornerThickness, height: cornerLength, bottom: -cornerThickness/2, right: -cornerThickness/2 }]} />

        {/* Animated Scan Line */}
        <Animated.View
          style={[
            styles.scanLine,
            { transform: [{ translateY: scanLineTranslateY }] },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { // This container can be used to center the frame if needed
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0,0,0,0.1)', // Example: slight overlay if this component handles it
  },
  scannerFrame: {
    // width: 250, // Set dynamically
    // height: 250, // Set dynamically
    // borderWidth: 2, // Optional: if you want a thin border for the frame itself
    // borderColor: 'rgba(255, 255, 255, 0.5)', // Light border for the frame
    position: 'relative',
    borderRadius: 15, // Softer edges
    overflow: 'hidden', // Important for the scan line to not exceed frame
  },
  cornerBracket: {
    position: 'absolute',
    backgroundColor: MODERN_PRIMARY_COLOR, // Use a modern color
  },
  topLeft: { top: 0, left: 0 },
  topRight: { top: 0, right: 0 },
  bottomLeft: { bottom: 0, left: 0 },
  bottomRight: { bottom: 0, right: 0 },
  scanLine: {
    width: '100%',
    height: 2,
    backgroundColor: MODERN_PRIMARY_COLOR,
    position: 'absolute',
    top: 0, // Starts at the top
    // Shadow for a glowing effect (optional)
    shadowColor: MODERN_PRIMARY_COLOR,
    shadowOpacity: 0.7,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5, // For Android shadow
  },
});

export default ScannerFrame;