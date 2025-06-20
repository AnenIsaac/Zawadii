import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  SafeAreaView,
  ImageBackground,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Dummy data for favourite restaurants
const favoriteRestaurants = [
  { 
    id: '1', 
    name: 'Burger 53', 
    points: 1240, 
    pointsTillReward: 760,
    rewards: 5,
    deals: 3,
    image: require('../../assets/fav1.jpg'), // Replace with your actual image path
    notification: true
  },
  { 
    id: '2', 
    name: 'Sea Cliff Restaurant', 
    points: 960, 
    pointsTillReward: 250,
    rewards: 5,
    deals: 3,
    image: require('../../assets/fav2.jpg'), // Replace with your actual image path
    // notification: false
  },
  { 
    id: '3', 
    name: 'Akemi Revolving Restaurant', 
    points: 650, 
    pointsTillReward: 300,
    rewards: 5,
    deals: 3,
    image: require('../../assets/fav3.jpg'), // Replace with your actual image path
    // notification: true
  },
  { 
    id: '4', 
    name: 'Shawarma 27', 
    points: 480, 
    pointsTillReward: 520,
    rewards: 5,
    deals: 3,
    image: require('../../assets/fav1.jpg'), // Replace with your actual image path
    // notification: true
  },
];

export default function Favourites() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Favourites</Text>
        <View style={styles.headerRightSpace} />
      </View> */}
      
      {/* Main Content - Scrollable */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {favoriteRestaurants.map((restaurant) => (
          <TouchableOpacity key={restaurant.id} style={styles.restaurantCard}>
            {/* Use ImageBackground for the card background */}
            <ImageBackground 
              source={restaurant.image} 
              style={styles.restaurantImage}
              imageStyle={styles.restaurantImageStyle}
            >
              {/* Overlay to ensure text visibility */}
              <View style={styles.cardOverlay}>
                {/* Notification badge if exists */}
                {/* {restaurant.notification && (
                  <View style={styles.notificationBadge}>
                    <View style={styles.notificationDot} />
                  </View>
                )} */}
                
                {/* Restaurant name */}
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                
                {/* Points */}
                <Text style={styles.pointsText}>{restaurant.points}pts</Text>
                <Text style={styles.pointsTillRewardText}>
                  {restaurant.pointsTillReward} points till your next rewards
                </Text>
                
                {/* Progress Bar */}
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBar, 
                      {width: `${(restaurant.points / (restaurant.points + restaurant.pointsTillReward)) * 100}%`}
                    ]} 
                  />
                </View>
                
                {/* Rewards and Deals */}
                <View style={styles.benefitsContainer}>
                  <View style={styles.benefitItem}>
                    <Ionicons name="gift-outline" size={18} color="white" />
                    <Text style={styles.benefitText}>{restaurant.rewards} rewards</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Ionicons name="pricetag-outline" size={18} color="white" />
                    <Text style={styles.benefitText}>{restaurant.deals} deals</Text>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
        
        {/* Add some padding at the bottom for scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Bottom Navigation */}
      {/* <BottomNav /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    // flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 25,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRightSpace: {
    width: 24, // Balance the header
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  restaurantCard: {
    height: 180,
    borderRadius: 15,
    // overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  restaurantImage: {
    flex: 1,
    width: '100%',
    resizeMode: 'cover',
    justifyContent: 'flex-end',
  },
  restaurantImageStyle: {
    borderRadius: 15,
  },
  cardOverlay: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    borderRadius: 15,
  },
  // notificationBadge: {
  //   position: 'absolute',
  //   top: -3,
  //   right: -3,
  //   width: 12,
  //   height: 12,
  //   borderRadius: 12,
  //   backgroundColor: 'rgba(0,0,0,0.2)',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   zIndex: 10,
  //   overflow: 'visible',  // Allows the dot to extend outside the badge
  // },
  // notificationDot: {
  //   width: 12,
  //   height: 12,
  //   borderRadius: 12,
  //   backgroundColor: '#FF5722',
  //   position: 'absolute',  // Keeps the dot inside the badge
  //   top: 0,                // Keeps it inside the parent container
  //   right: 0,              // Aligns it at the top-right of the badge
  // },  
  // notificationBadge: {
  //   position: 'absolute',
  //   top: 16,
  //   right: 16,
  //   width: 24,
  //   height: 24,
  //   borderRadius: 12,
  //   backgroundColor: 'rgba(0,0,0,0.2)',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  // notificationDot: {
  //   width: 18,
  //   height: 18,
  //   borderRadius: 12,
  //   backgroundColor: '#FF5722',

  //   position: 'absolute',  // Allows precise positioning
  //   top: -20,              // Moves it 10 pixels **above** the container
  //   right: -20,            // Moves it 10 pixels **outside** the right edge
  //   zIndex: 10,            // Ensures it stays on top of other elements
  //   // backgroundColor: 'white', // Optional: Makes it more visible
  //   // borderRadius: 20,      // Rounds the button for a better look
  //   // // padding: 5,            // Adds padding for better tap area
  //   // elevation: 5,          // Adds a shadow on Android for depth
  //   // shadowColor: '#000',   // Adds shadow on iOS
  //   // shadowOffset: { width: 0, height: 2 },
  //   // shadowOpacity: 0.2,
  //   // shadowRadius: 3
  // },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 19,
  },
  pointsText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
  },
  pointsTillRewardText: {
    fontSize: 12,
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#FF8C00',
    borderRadius: 4,
  },
  benefitsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitText: {
    fontSize: 12,
    color: 'white',
    marginLeft: 4,
  },
});

