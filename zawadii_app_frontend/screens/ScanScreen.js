// import React, { useState, useEffect } from 'react';
// import { Text, View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
// import { BarCodeScanner } from 'expo-barcode-scanner';
// import * as Permissions from 'expo-permissions';

// function ScanScreen() {
//   const [hasPermission, setHasPermission] = useState(null);
//   const [scanned, setScanned] = useState(false);
//   const [scannedData, setScannedData] = useState('');

//   useEffect(() => {
//     (async () => {
//       const { status } = await BarCodeScanner.requestPermissionsAsync();
//       setHasPermission(status === 'granted');
//     })();
//   }, []);

//   const handleBarCodeScanned = ({ type, data }) => {
//     setScanned(true);
//     setScannedData(data);
//     alert(`Bar code with type ${type} and data ${data} has been scanned!`);
//   };

//   const handleScanAgain = () => {
//     setScanned(false);
//     setScannedData('');
//   };

//   if (hasPermission === null) {
//     return <Text style={styles.statusText}>Requesting camera permission...</Text>;
//   }
//   if (hasPermission === false) {
//     return <Text style={styles.statusText}>No access to camera</Text>;
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.background}>
//         <BarCodeScanner
//           onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
//           style={StyleSheet.absoluteFillObject}
//         />
//         {scanned && (
//           <View style={styles.resultContainer}>
//             <Text style={styles.resultText}>Scanned Data:</Text>
//             <Text style={styles.dataText}>{scannedData}</Text>
//             <TouchableOpacity style={styles.scanAgainButton} onPress={handleScanAgain}>
//               <Text style={styles.scanAgainText}>Scan Again</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>
//       <View style={styles.overlay}>
//         <View style={styles.header}>
//           <Text style={styles.scanText}>Scan QR code</Text>
//           <View>
//             <Text style={styles.explanationText}>
//               {scanned ? 'QR code scanned successfully!' : 'Position the QR code within the frame.'}
//             </Text>
//           </View>
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#132D7B',
//   },
//   background: {
//     backgroundColor: '#132D7B',
//     width: '100%',
//     height: '60%',
//     top: '10%',
//     justifyContent: 'center',
//     borderRadius: 20,
//     position: 'relative',
//     overflow: 'hidden',
//   },
//   statusText: {
//     fontSize: 18,
//     color: '#FFFFFF',
//     textAlign: 'center',
//   },
//   overlay: {
//     width: '100%',
//     height: '10%',
//     alignItems: 'center',
//     paddingTop: '15%',
//     paddingHorizontal: 30,
//     backgroundColor: '#132D7B',
//     ...StyleSheet.absoluteFillObject,
//   },
//   scanText: {
//     fontSize: 40,
//     fontWeight: '500',
//     color: '#FFFFFF',
//   },
//   explanationText: {
//     fontSize: 16,
//     color: '#FFFFFF',
//     textAlign: 'center',
//     marginTop: 10,
//   },
//   resultContainer: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   resultText: {
//     fontSize: 20,
//     color: '#FFFFFF',
//     marginBottom: 10,
//   },
//   dataText: {
//     fontSize: 16,
//     color: '#FFFFFF',
//     marginBottom: 20,
//   },
//   scanAgainButton: {
//     backgroundColor: '#FFFFFF',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 5,
//   },
//   scanAgainText: {
//     color: '#132D7B',
//     fontSize: 16,
//   },
// });

// export default ScanScreen;