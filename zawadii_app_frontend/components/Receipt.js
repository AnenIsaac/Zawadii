import React from "react";
import { View, Text, StyleSheet } from "react-native";
import QRCode from "./QRCode"; // Assuming QRCode is a separate component

const Receipt = () => {
  return (
    <View style={styles.receipt}>
      <View style={styles.header}>
        <Text style={styles.headerText}>FIGMA RECEIPT</Text>
        <Text>03/03/2025 - 14:44:16 PM</Text>
        <Text>ORDER #5557</Text>
      </View>

      <View style={styles.details}>
        <Text>CUSTOMER: Caroline</Text>
        <Text>MENU: Qt Code Scanner (Community)</Text>
        <Text>SERVED BY: Gynamola Akinleye</Text>
      </View>

      <View style={styles.components}>
        <Text>COMPONENTS 0</Text>
        <Text>INSTANCES 0</Text>
        <Text>STYLES 0</Text>
        <Text>FRAMES 0</Text>
      </View>

      <View style={styles.score}>
        <Text>POWER SCORE: 5/100</Text>
        <Text>FINAL RANK: GHOSTWRITER</Text>
      </View>

      <View style={styles.qrCodeContainer}>
        <QRCode />
      </View>

      <View style={styles.footer}>
        <View style={styles.wave}>
          <Text style={styles.waveText}>~~~~~~~~~~~~~~~~~~~~~</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  receipt: {
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5, // for Android
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  details: {
    marginBottom: 16,
  },
  components: {
    marginBottom: 16,
  },
  score: {
    marginBottom: 16,
  },
  qrCodeContainer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  footer: {
    alignItems: "center",
    marginTop: 8,
  },
  wave: {
    width: "100%",
    height: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  waveText: {
    fontFamily: "monospace",
    fontSize: 10,
    color: "#DDDDDD",
  },
});

export default Receipt;
