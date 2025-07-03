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
import { supabase } from '../../supabaseClient'; // Import Supabase client

const MODERN_PRIMARY_COLOR = '#FFA500';
const OVERLAY_COLOR = 'rgba(0, 0, 0, 0.6)'; // Semi-transparent overlay

const ScanScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Added isLoading state
  const [modalInfo, setModalInfo] = useState({ visible: false, title: '', message: '', allowSave: false, scannedUrl: '' });
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
      setScanned(false);
      return;
    }
    if (isLoading || !isFocused) return;
    setScanned(true);
    const scannedUrl = scanEvent.data;
    console.log('Scanned QR Data:', scannedUrl);

    // 1. Check for verify.tra.go.tz (case-insensitive, robust, trim whitespace)
    const urlToCheck = scannedUrl.trim().toLowerCase();
    if (!urlToCheck.includes('verify.tra.go.tz')) {
      setModalInfo({
        visible: true,
        title: 'Invalid Receipt',
        message: 'This receipt is not from TRA.',
        allowSave: false,
        scannedUrl: ''
      });
      return;
    }

    // 2. Extract TIN (handle both TIN=... and no TIN param)
    let tin = null;
    let receiptData = null;
    const tinMatch = urlToCheck.match(/tin=([0-9]+)/i);
    if (tinMatch && tinMatch[1]) {
      tin = tinMatch[1];
    } else {
      // Try to fetch TIN from the API if not present in URL
      setIsLoading(true);
      try {
        const apiUrl = `https://scraper.zawadii.app/api/scrape-receipt/?url=${encodeURIComponent(scannedUrl)}`;
        const response = await fetch(apiUrl);
        if (response.ok) {
          receiptData = await response.json();
          if (receiptData && receiptData.company_info && receiptData.company_info.tin) {
            tin = receiptData.company_info.tin;
          }
        }
      } catch (e) {
        // ignore, will show error below if tin is still null
      }
      setIsLoading(false);
    }
    if (!tin) {
      setModalInfo({
        visible: true,
        title: 'Invalid Receipt',
        message: 'Could not extract TIN from the receipt.',
        allowSave: false,
        scannedUrl: ''
      });
      return;
    }
    setIsLoading(true);
    // 3. Check TIN in businesses
    const { data: business, error } = await supabase
      .from('businesses')
      .select('id')
      .eq('tin', tin)
      .maybeSingle(); // <-- use maybeSingle instead of single
    setIsLoading(false);
    // If business is not found, navigate to ValidTRAReceipt with businessId: null
    if (!business) {
      if (!receiptData) {
        setIsLoading(true);
        try {
          const apiUrl = `https://scraper.zawadii.app/api/scrape-receipt/?url=${encodeURIComponent(scannedUrl)}`;
          const response = await fetch(apiUrl);
          if (response.ok) {
            receiptData = await response.json();
          }
        } catch (e) {}
        setIsLoading(false);
      }
      if (!receiptData || !receiptData.company_info || !receiptData.totals) {
        setModalInfo({
          visible: true,
          title: 'Invalid Receipt',
          message: 'Invalid receipt data provided.',
          allowSave: false,
          scannedUrl: ''
        });
        return;
      }
      navigation.navigate('ValidTRAReceipt', {
        receiptData,
        tin,
        businessId: null,
        scannedUrl
      });
      return;
    }
    // 4. If business found, always fetch receipt data for navigation
    if (!receiptData) {
      setIsLoading(true);
      try {
        const apiUrl = `https://scraper.zawadii.app/api/scrape-receipt/?url=${encodeURIComponent(scannedUrl)}`;
        const response = await fetch(apiUrl);
        if (response.ok) {
          receiptData = await response.json();
        }
      } catch (e) {}
      setIsLoading(false);
    }
    if (!receiptData || !receiptData.company_info || !receiptData.totals) {
      setModalInfo({
        visible: true,
        title: 'Invalid Receipt',
        message: 'Invalid receipt data provided.',
        allowSave: false,
        scannedUrl: ''
      });
      return;
    }
    navigation.navigate('ValidTRAReceipt', {
      receiptData,
      tin,
      businessId: business.id,
      scannedUrl
    });
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

      {/* Modal for invalid/unknown receipts */}
      <Modal
        visible={modalInfo.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalInfo({ ...modalInfo, visible: false })}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 28, alignItems: 'center', width: 320, elevation: 8 }}>
            {modalInfo.title === 'Business Not Registered' ? (
              <Ionicons name="storefront-outline" size={70} color="#FFA500" style={{ marginBottom: 10 }} />
            ) : (
              <Ionicons name="close-circle-outline" size={70} color="#FF4C4C" style={{ marginBottom: 10 }} />
            )}
            <Text style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 10, color: '#333', textAlign: 'center' }}>{modalInfo.title}</Text>
            <Text style={{ fontSize: 16, color: '#666', marginBottom: 24, textAlign: 'center' }}>{modalInfo.message}</Text>
            {modalInfo.allowSave && (
              <TouchableOpacity
                style={{ backgroundColor: '#FFA500', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, width: '100%', alignItems: 'center', marginBottom: 10 }}
                onPress={async () => {
                  setIsLoading(true);
                  const { data: { user }, error: userError } = await supabase.auth.getUser();
                  if (userError || !user) {
                    Alert.alert('Error', 'Could not save receipt. Please log in.');
                    setIsLoading(false);
                    setModalInfo({ ...modalInfo, visible: false });
                    setScanned(false);
                    return;
                  }
                  // Check if this scanned_url already exists for this user
                  const { data: existing, error: existingError } = await supabase
                    .from('unverified_receipts')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('scanned_url', modalInfo.scannedUrl)
                    .maybeSingle();
                  if (existing) {
                    Alert.alert('Already Saved', 'This receipt is already in your unverified receipts.');
                    setIsLoading(false);
                    setModalInfo({ ...modalInfo, visible: false });
                    setScanned(false);
                    return;
                  }
                  // Use user.id for both user_id and customer_id (to match ValidTRAReceipt logic)
                  const { error: insertError } = await supabase
                    .from('unverified_receipts')
                    .insert([{ user_id: user.id, customer_id: user.id, scanned_url: modalInfo.scannedUrl, status: 'pending' }]);
                  setIsLoading(false);
                  if (insertError) {
                    Alert.alert('Error', 'Could not save receipt. Please try again.');
                  } else {
                    Alert.alert('Saved', 'Receipt saved! You can try again later from your history.');
                  }
                  setModalInfo({ ...modalInfo, visible: false });
                  setScanned(false);
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Save Receipt</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={{ marginTop: 5, alignItems: 'center' }}
              onPress={() => {
                setModalInfo({ ...modalInfo, visible: false });
                setScanned(false);
              }}
            >
              <Text style={{ color: modalInfo.title === 'Business Not Registered' ? '#FFA500' : '#FF4C4C', fontWeight: 'bold', fontSize: 15 }}>Close</Text>
            </TouchableOpacity>
            {modalInfo.title === 'Business Not Registered' && (
              <Text style={{ color: '#888', fontSize: 14, marginTop: 10, textAlign: 'center' }}></Text>
            )}
          </View>
        </View>
      </Modal>
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