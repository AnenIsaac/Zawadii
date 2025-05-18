import React from "react";
import { View, StyleSheet } from "react-native";

const PageIndicator = ({ total, current }) => {
  return (
    <View style={styles.pageIndicator}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.indicator,
            i === current - 1 && styles.activeIndicator,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  pageIndicator: {
    flexDirection: "row", // Horizontal layout for indicators
    justifyContent: "center", // Center the indicators
    alignItems: "center",
    marginVertical: 10,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#DDDDDD", // Inactive dot color
    marginHorizontal: 5, // Space between dots
  },
  activeIndicator: {
    backgroundColor: "#FFB800", // Active dot color
  },
});

export default PageIndicator;
