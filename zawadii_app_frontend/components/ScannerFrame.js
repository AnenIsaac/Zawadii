import React from 'react';
import { View, StyleSheet } from 'react-native';

const ScannerFrame = () => {
  return (
    <View style={styles.container}>
      <View style={styles.scannerFrame}>
        <View style={[styles.corner, styles.topLeftHorizontal]} />
        <View style={[styles.corner, styles.topLeftVertical]} />
        
        <View style={[styles.corner, styles.topRightHorizontal]} />
        <View style={[styles.corner, styles.topRightVertical]} />
        
        <View style={[styles.corner, styles.bottomLeftHorizontal]} />
        <View style={[styles.corner, styles.bottomLeftVertical]} />
        
        <View style={[styles.corner, styles.bottomRightHorizontal]} />
        <View style={[styles.corner, styles.bottomRightVertical]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    position: 'relative',
    borderRadius: 15,
  },
  corner: {
    position: 'absolute',
    backgroundColor: 'white',
  },
  // Top Left Corners
  topLeftHorizontal: {
    top: -2,
    left: -2,
    width: 30,
    height: 3,
  },
  topLeftVertical: {
    top: -2,
    left: -2,
    width: 3,
    height: 30,
  },
  // Top Right Corners
  topRightHorizontal: {
    top: -2,
    right: -2,
    width: 30,
    height: 3,
  },
  topRightVertical: {
    top: -2,
    right: -2,
    width: 3,
    height: 30,
  },
  // Bottom Left Corners
  bottomLeftHorizontal: {
    bottom: -2,
    left: -2,
    width: 30,
    height: 3,
  },
  bottomLeftVertical: {
    bottom: -2,
    left: -2,
    width: 3,
    height: 30,
  },
  // Bottom Right Corners
  bottomRightHorizontal: {
    bottom: -2,
    right: -2,
    width: 30,
    height: 3,
  },
  bottomRightVertical: {
    bottom: -2,
    right: -2,
    width: 3,
    height: 30,
  },
});

export default ScannerFrame;