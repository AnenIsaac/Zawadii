import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  AppState,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator, // Added ActivityIndicator
} from 'react-native';
import { Camera, CameraView } from 'expo-camera'; // Modified import
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';

const ScanScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Added isLoading state
  // const [cameraRef, setCameraRef] = useState(null); // Removed: CameraView might not need explicit ref for this usage
  const appState = useRef(AppState.currentState);

  const getCameraPermission = async () => {
    console.log("getCameraPermission: Attempting to request camera permissions...");
    try {
      const permissionsResponse = await Camera.requestCameraPermissionsAsync(); // Changed to Camera.requestCameraPermissionsAsync
      const status = permissionsResponse.status;

      console.log("getCameraPermission: Permission status received:", status);
      console.log("getCameraPermission: Full permission response:", permissionsResponse);

      if (status === 'granted') {
        setHasPermission(true);
      } else {
        setHasPermission(false);
        if (!permissionsResponse.canAskAgain) {
          Alert.alert(
            "Permission Denied",
            "Camera permission was denied and cannot be requested again through the app. You may need to enable it in your device settings.",
            [{ text: "OK" }]
          );
        }
      }
    } catch (error) {
      console.error("getCameraPermission: Error requesting camera permissions:", error);
      setHasPermission(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const { status } = await Camera.getCameraPermissionsAsync(); // Changed to Camera.getCameraPermissionsAsync
        if (status !== 'granted') {
          setHasPermission(false);
        } else {
          setHasPermission(true);
        }
      })();
      setScanned(false); // Reset scanner state when screen comes into focus
      console.log("ScanScreen focused, scanner reset.");
      return () => {
        // Optional: cleanup when screen loses focus
        console.log("ScanScreen unfocused.");
      };
    }, [setHasPermission, setScanned]) // Added dependencies
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground, resetting scanner.');
        setScanned(false); // Reset scanner when app comes to foreground
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [setScanned]); // Added setScanned as dependency

  const handleBarCodeScanned = async (scanEvent) => {
    if (!scanEvent || typeof scanEvent.data === 'undefined') {
      console.warn("handleBarCodeScanned: Received undefined or incomplete scan event:", scanEvent);
      setScanned(false); // Allow further scans
      return;
    }

    setScanned(true); // Keep scanned true to prevent multiple rapid scans
    const scannedUrl = scanEvent.data;
    console.log('Scanned URL:', scannedUrl);

    if (!scannedUrl.startsWith('https://verify.tra.go.tz/')) {
      Alert.alert('Invalid QR Code', 'This QR code does not seem to be a valid TRA receipt.', [
        { text: 'OK', onPress: () => setScanned(false) },
      ]);
      return;
    }

    setIsLoading(true); // Set loading true before API call
    const apiUrl = `https://scraper.zawadii.app/api/scrape-receipt/?url=${scannedUrl}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

    try {
      console.log('Fetching receipt data from:', apiUrl);
      const response = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Could not retrieve error details.');
        console.error('API request failed:', response.status, errorText);
        Alert.alert(
          'API Error',
          `Failed to fetch receipt data. Status: ${response.status}. ${errorText}`,
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
        return;
      }

      const receiptData = await response.json();
      console.log('Receipt Data:', receiptData);

      if (receiptData && receiptData.company_info && receiptData.company_info.tin && receiptData.totals && receiptData.totals.total_incl_of_tax) {
        const tin = receiptData.company_info.tin;
        const amountSpent = receiptData.totals.total_incl_of_tax;

        console.log('Extracted TIN:', tin);
        console.log('Extracted Amount Spent:', amountSpent);

        // Navigate to the confirmation screen with all necessary data
        navigation.navigate('ValidTRAReceipt', {
          receiptData, // Full data for display and further processing
          tin,
          amountSpent,
          scannedUrl, // Original scanned URL for reference or re-query if needed
        });
        // setScanned(false) will be handled by the navigation or when returning to this screen
      } else {
        console.error('Invalid or incomplete data from API:', receiptData);
        Alert.alert('Processing Error', 'Could not extract necessary details from the receipt data.', [
          { text: 'OK', onPress: () => setScanned(false) },
        ]);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error('API request timed out:', error);
        Alert.alert('Request Timeout', 'The system is experiencing some trouble. Please try again later.', [
          { text: 'OK', onPress: () => setScanned(false) },
        ]);
      } else {
        console.error('Error fetching or processing receipt data:', error);
        Alert.alert('Error', 'The receipt may be invalid or there was a problem fetching the data. Please try again.', [
          { text: 'OK', onPress: () => setScanned(false) },
        ]);
      }
    } finally {
      setIsLoading(false); // Reset loading state in finally block
    }
  };
  
  const cancelScanning = () => {
    navigation.goBack();
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.permissionDeniedContainer}>
        {Platform.OS === 'android' && <StatusBar hidden />}
        <Text style={styles.permissionText}>No access to camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={getCameraPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={cancelScanning}>
          <Ionicons name="close-circle-outline" size={20} color="black" />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === 'android' && <StatusBar hidden />}
      <CameraView
        // ref={setCameraRef} // Removed
        style={styles.camera}
        facing="back" // Changed from 'type'
        barcodeScannerSettings={{ // Changed from 'barCodeScannerSettings'
          barcodeTypes: ['qr'], // Ensure this format is correct for CameraView
        }}
        onBarcodeScanned={scanned || isLoading ? undefined : handleBarCodeScanned} // Prevent scanning if loading
      >
        <View style={styles.overlay}>
          <View style={styles.scannerContainer}>
            <View style={styles.scannerFrame}>
              <View style={styles.cornerTopLeft} />
              <View style={styles.cornerTopRight} />
              <View style={styles.cornerBottomLeft} />
              <View style={styles.cornerBottomRight} />
              <View style={styles.scanLine} />
            </View>
            <Text style={styles.scannerText}>Scan QR Code</Text>
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={cancelScanning} disabled={isLoading}>
            <Ionicons name="close-circle-outline" size={20} color="black" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFA500" />
          <Text style={styles.loadingText}>Processing Receipt...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionDeniedContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: 'orange',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginBottom: 20,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
    width: '100%', // Ensure camera view takes full width if container has alignItems/justifyContent
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: { // Added styles for loading overlay
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10, // Ensure it's on top
  },
  loadingText: { // Added styles for loading text
    color: 'white',
    fontSize: 18,
    marginTop: 12,
  },
  scannerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderRadius: 12,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: 'white',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: 'white',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: 'white',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: 'white',
  },
  scanLine: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 2,
    backgroundColor: 'orange',
  },
  scannerText: {
    color: 'white',
    fontSize: 16,
    marginTop: 20,
    fontWeight: '500',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 30,
  },
  cancelButtonText: {
    color: 'black',
    marginLeft: 5,
    fontSize: 14,
  },
});

export default ScanScreen;