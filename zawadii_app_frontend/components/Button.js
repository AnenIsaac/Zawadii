// import React from "react";
// import { TouchableOpacity, Text, StyleSheet } from "react-native";
// import PropTypes from "prop-types";

// const Button = ({ children, variant = "primary", onPress }) => {
//   return (
//     <TouchableOpacity
//       style={[
//         styles.button,
//         variant === "primary" ? styles.primary : styles.secondary,
//       ]}
//       onPress={onPress}
//     >
//       <Text style={styles.buttonText}>{children}</Text>
//     </TouchableOpacity>
//   );
// };

// Button.propTypes = {
//   children: PropTypes.node.isRequired,
//   variant: PropTypes.oneOf(["primary", "secondary"]),
//   onPress: PropTypes.func,
// };

// const styles = StyleSheet.create({
//   button: {
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 25,
//     alignItems: "center",
//   },
//   primary: {
//     backgroundColor: "#FFB800", // Primary button color
//   },
//   secondary: {
//     backgroundColor: "#DDDDDD", // Secondary button color
//   },
//   buttonText: {
//     fontSize: 16,
//     fontWeight: "500",
//     color: "#FFFFFF",
//   },
// });

// export default Button;

import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";

export default function Button({ title, onPress, backgroundColor, textColor }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: backgroundColor || "#007AFF" }]} // Default color
        onPress={onPress}
      >
        <Text style={[styles.buttonText, { color: textColor || "#FFF" }]}>
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10, // Spacing between buttons
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 3, // Shadow for Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
