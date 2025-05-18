import React from "react";
import PropTypes from "prop-types";
import { View, Text, Image, StyleSheet } from "react-native";

const RewardItem = ({ logo, name, rating = 4.5, description, points, isLocalImage }) => {
  return (
    <View style={styles.rewardItem}>
      <View style={styles.rewardLogo}>
        <Image
          source={isLocalImage ? logo : { uri: logo }} // Handle local & remote images
          style={styles.rewardLogoImage}
        />
      </View>
      <View style={styles.rewardDetails}>
        <Text style={styles.rewardTitle}>
          {name} <Text style={styles.rating}>★★★★☆ {rating}</Text>
        </Text>
        <Text style={styles.rewardDescription}>{description}</Text>
      </View>
      <Text style={styles.rewardPoints}>{points} pts</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  rewardItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5, // for Android
  },
  rewardLogo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    overflow: "hidden",
  },
  rewardLogoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  rewardDetails: {
    flex: 1,
    marginLeft: 12,
  },
  rewardTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#333",
  },
  rating: {
    color: "#FFB800",
    fontSize: 12,
  },
  rewardDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  rewardPoints: {
    fontWeight: "700",
    fontSize: 16,
    color: "#333",
  },
});

RewardItem.propTypes = {
  logo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // Support both string & number
  name: PropTypes.string.isRequired,
  rating: PropTypes.number,
  description: PropTypes.string.isRequired,
  points: PropTypes.number.isRequired,
  isLocalImage: PropTypes.bool, // New prop to handle local images
};

export default RewardItem;
