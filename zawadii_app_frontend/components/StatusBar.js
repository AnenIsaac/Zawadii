import React from "react";
import { View, Text, StyleSheet } from "react-native";

const StatusBar = ({ time }) => {
  return (
    <View style={styles.statusBar}>
      <Text style={styles.time}>{time}</Text>
      <View style={styles.icons}>
        <Text style={styles.icon}>●●●</Text>
        <Text style={styles.icon}>●●</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#FFF8E7", // You can change the color to suit your design
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0", // Optional border for separation
  },
  time: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  icons: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    fontSize: 18,
    marginLeft: 8, // Space between icons
  },
});

export default StatusBar;
