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
  Modal,
  Dimensions,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera'; // Modified import
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import ScannerFrame from '../../components/ScannerFrame'; // Import the updated ScannerFrame

const MODERN_PRIMARY_COLOR = '#FFA500';
const OVERLAY_COLOR = 'rgba(0, 0, 0, 0.6)'; // Semi-transparent overlay

const ScanScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Added isLoading state
  const appState = useRef(AppState.currentState);
  const isFocused = useIsFocused(); // Hook to check if screen is focused

  // Get screen dimensions for scanner size
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const scannerSize = screenWidth * 0.7; // Make scanner 70% of screen width

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
      setIsLoading(false); // Also reset loading state
      console.log("ScanScreen focused, scanner reset.");
      return () => {
        // Optional: cleanup when screen loses focus
        console.log("ScanScreen unfocused.");
      };
    }, [setHasPermission, setScanned, setIsLoading]) // Added dependencies
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

    if (isLoading || !isFocused) return; // Prevent multiple triggers or if not focused

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
      <View style={styles.centeredMessage}>
        <Text>Requesting for camera permission...</Text>
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
      {isFocused && ( // Only render CameraView if the screen is focused
        <CameraView
          // ref={setCameraRef} // Removed
          style={StyleSheet.absoluteFillObject} // Camera fills the whole screen
          facing="back" // Changed from 'type'
          barcodeScannerSettings={{ // Changed from 'barCodeScannerSettings'
            barcodeTypes: ['qr'], // Ensure this format is correct for CameraView
          }}
          onBarcodeScanned={scanned || isLoading ? undefined : handleBarCodeScanned} // Prevent scanning if loading
        />
      )}

      {/* Overlay and Scanner Frame */}
      <View style={StyleSheet.absoluteFillObject}>
        {/* Top Overlay */}
        <View style={[styles.overlay, { height: (screenHeight - scannerSize) / 2 - 50 }]} /> 
        <View style={{ flexDirection: 'row' }}>
          {/* Left Overlay */}
          <View style={[styles.overlay, { width: (screenWidth - scannerSize) / 2 }]} />
          {/* Scanner Frame Area (Transparent) */}
          <View style={{ width: scannerSize, height: scannerSize }}>
            {isFocused && <ScannerFrame />} 
          </View>
          {/* Right Overlay */}
          <View style={[styles.overlay, { width: (screenWidth - scannerSize) / 2 }]} />
        </View>
        {/* Bottom Overlay */}
        <View style={[styles.overlay, { flex: 1 }]} />
      </View>

      {isLoading && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={isLoading}
          onRequestClose={() => {}}>
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={MODERN_PRIMARY_COLOR} />
            <Text style={styles.loadingText}>Fetching Receipt Details...</Text>
          </View>
        </Modal>
      )}

      {!isLoading && isFocused && (
         <View style={styles.instructionsContainer}>
           <Text style={styles.instructionsText}>Align QR code within frame</Text>
         </View>
       )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black', // Background for the camera view area
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
  overlay: {
    backgroundColor: OVERLAY_COLOR,
  },
  loadingOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)', // Darker overlay for loading
  },
  loadingText: {
    marginTop: 15,
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 70, // Positioned higher
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 25, // Rounded corners for the instruction box
    marginHorizontal: '15%', // Give some horizontal margin
 },
 instructionsText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
 }
});

export default ScanScreen;