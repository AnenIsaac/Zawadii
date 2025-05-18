import React from "react";
import { Text, StyleSheet } from "react-native";

const Logo = () => {
  return <Text style={styles.logo}>ZAWADII</Text>;
};

const styles = StyleSheet.create({
  logo: {
    // fontSize: 50,
    // fontWeight: "bold",
    // color: "#FFB800", // Adjust color as necessary
    // textAlign: "center", // Center the logo text
    fontSize: 35,
    fontWeight: '800',
    color: '#FD8424',
    marginBottom: 0,
    textAlign: "center"
  },
});

export default Logo;
