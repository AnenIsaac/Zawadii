import React, { useState } from 'react';
import SimpleSidebar from '../../components/SimpleSidebar'; 
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  ImageBackground,
   
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// const HomeScreen = ({ navigation, showSidebar }) => {
const HomeScreen = ({ navigation }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  return (
    <>
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FF8924" />
      
      {/* Header - Fixed */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)}>
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ZAWADII</Text>
        <TouchableOpacity
         onPress={() => {
           navigation.navigate('NotificationsScreen');
                }}
        >
          <Ionicons name="notifications-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Main Content with Linear Gradient Background */}
      <LinearGradient
        colors={['#FD8424', '#F6F6F6', '#F6F6F6']}
        locations={[0.13, 0.32, 1]}
        style={styles.gradient}
      >
        <ScrollView style={styles.mainScrollView}>
          {/* Promotions Carousel */}
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.promotionsContainer}
          >
            {/* KUKU TUESDAY Promotion */}
            <View style={styles.promotionCard}>
              {/* <View style={styles.promotionTextContainer}>
                <Text style={styles.promotionAmount}>TZS 12,000</Text>
                <Text style={styles.promotionDescription}>Chicken Bucket Deal</Text>
                <Text style={styles.promotionValidity}>VALID 20ᵗʰ JUNE 2023</Text>
              </View> */}
              <Image 
                source={require('../../assets/happy-man.jpeg')}
                style={styles.promotionImage}
              />
              {/* <View style={styles.promotionTagContainer}>
                <Text style={styles.promotionTagText}>KUKU</Text>
                <Text style={styles.promotionTagText2}>TUESDAY</Text>
              </View> */}
            </View>
            
            {/* More promotion cards would go here */}
            <View style={[styles.promotionCard, {marginRight: 20}]}>
              {/* Another promotion content */}
              <Image 
                source={require('../../assets/offer2.jpg')}
                style={styles.promotionImage}
              />
            </View>
          </ScrollView>
          
          {/* Carousel Indicators */}
          <View style={styles.indicatorsContainer}>
            <View style={[styles.indicator, styles.activeIndicator]}></View>
            <View style={styles.indicator}></View>
            <View style={styles.indicator}></View>
            <View style={styles.indicator}></View>
          </View>
          
          {/* Favourites Section */}
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Favourites</Text>
          </View>
          
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.favouritesContainer}
          >
          

<View style={styles.favouriteCard}>
  <ImageBackground 
    source={require('../../assets/loyalty-card.jpeg')} 
    style={styles.favouriteBackground}
    imageStyle={{ borderRadius: 15 }} // Ensures rounded corners
  >
    <View style={styles.favouriteContent}>
      <View style={styles.favouriteHeader}>
        <Text style={styles.favouriteName}>Burger 53</Text>
        <FontAwesome name="star" size={16} color="#FF6B00" />
      </View>

      <Text style={styles.favouritePoints}>1240pts</Text>
      <Text style={styles.favouritePointsToNext}>760 points till your next rewards</Text>
     
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View style={styles.progressBar}></View>
        </View>
      </View>

      <View style={styles.favouriteFooter}>
        <View style={styles.favouriteFooterItem}>
          <MaterialIcons name="card-giftcard" size={18} color="#FFFFFF" />
          <Text style={styles.favouriteFooterText}>5 rewards</Text>
        </View>
        <View style={styles.favouriteFooterItem}>
          <FontAwesome name="tag" size={18} color="#FFFFFF" />
          <Text style={styles.favouriteFooterText}>3 deals</Text>
        </View>
      </View>
    </View>
  </ImageBackground>
</View>

            {/* Add Favorites Button */}
            <TouchableOpacity 
              style={styles.addFavouriteButton}
              onPress={() => navigation.navigate('Favourites')}
            >
              <View style={styles.addFavouriteCircle}>
                <Ionicons name="add" size={30} color="#FF8924" />
              </View>
            </TouchableOpacity>
          </ScrollView>
          
          {/* Rewards Section */}
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Rewards</Text>
          </View>
          
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.rewardsContainer}
          >
            {/* Reward Item - Free Chips */}
            <View style={styles.rewardCard}>
              <Image 
                source={require('../../assets/fries1.jpeg')}
                style={styles.rewardImage}
              />
              <Text style={styles.rewardTitle}>Free Chips</Text>
              <Text style={styles.rewardSubtitle}>Shawarma 27</Text>
              <View style={styles.rewardPoints}>
                <Text style={styles.rewardPointsText}>20 pts</Text>
              </View>
            </View>
            
            {/* Reward Item - Free Burger */}
            <View style={styles.rewardCard}>
              <Image 
                source={require('../../assets/burger1.jpeg')}
                style={styles.rewardImage}
              />
              <Text style={styles.rewardTitle}>Free Burger</Text>
              <Text style={styles.rewardSubtitle}>Burger 53</Text>
              <View style={styles.rewardPoints}>
                <Text style={styles.rewardPointsText}>50 pts</Text>
              </View>
            </View>
            
            {/* Reward Item - Free Soda */}
            <View style={styles.rewardCard}>
              <Image 
                source={require('../../assets/soda1.jpeg')}
                style={styles.rewardImage}
              />
              <Text style={styles.rewardTitle}>Free Soda</Text>
              <Text style={styles.rewardSubtitle}>Shishi Food</Text>
              <View style={styles.rewardPoints}>
                <Text style={styles.rewardPointsText}>20 pts</Text>
              </View>
            </View>
          </ScrollView>
          
          {/* Add some padding at the bottom to ensure scrollability */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </LinearGradient>
      
      {/* Bottom Navigation - Fixed */}
      {/* <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#FF8924" />
        </TouchableOpacity>
        <TouchableOpacity 
            style={styles.navItem} onPress={() => navigation.navigate('SearchScreen')}
            >
          <Ionicons name="search" size={24} color="#AAAAAA" />
        </TouchableOpacity>
        <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => navigation.navigate('ScanScreen')}
        >
          <View style={styles.qrButtonContainer}>
            <Ionicons name="scan" size={28} color="#AAAAAA" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('RewardsScreen')}>
          <Ionicons name="gift-outline" size={24} color="#AAAAAA" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ProfileScreen')}>
          <Ionicons name="person-outline" size={24} color="#AAAAAA" />
        </TouchableOpacity>
      </View> */}
    </SafeAreaView>
     {/* Sidebar */}
     <SimpleSidebar 
        visible={sidebarVisible} 
        onClose={() => setSidebarVisible(false)} 
        navigation={navigation}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    // paddingBottom: 0,
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FF8924',
    paddingHorizontal: 15,
    paddingVertical: 15,
    zIndex: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  gradient: {
    flex: 1,
  },
  mainScrollView: {
    flex: 1,
  },
  promotionsContainer: {
    paddingTop: 15,
  },
  promotionCard: {
    width: 300,
    height: 180,
    marginLeft: 15,
    borderRadius: 15,
    backgroundColor: '#333333',
    overflow: 'hidden',
    position: 'relative',
  },
//   promotionTextContainer: {
//     position: 'absolute',
//     left: 15,
//     top: 15,
//     zIndex: 2,
//   },
//   promotionAmount: {
//     color: 'white',
//     fontSize: 22,
//     fontWeight: 'bold',
//   },
//   promotionDescription: {
//     color: 'white',
//     fontSize: 14,
//   },
//   promotionValidity: {
//     color: 'white',
//     fontSize: 10,
//     marginTop: 10,
//   },
//


    promotionImage: {
        width: '100%', // Make it stretch across the full width
        height: '100%', // Make it cover the full height
        position: 'absolute', // Ensure it fills the container
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        resizeMode: 'cover', // Ensure the image covers the space properly
    },
  
  promotionTagContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: 'black',
    padding: 10,
    borderBottomRightRadius: 15,
  },
  promotionTagText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  promotionTagText2: {
    color: '#FF0000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  indicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  indicator: {
    width: 16,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DDDDDD',
    marginHorizontal: 3,
  },
  activeIndicator: {
    backgroundColor: '#FF8924',
    width: 16,
  },
  sectionTitleContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  favouritesContainer: {
    paddingLeft: 15,
  },
//   favouriteCard: {
//     width: 300,
//     backgroundColor: '#1F1F1F',
//     borderRadius: 15,
//     padding: 15,
//     // marginRight: 15,
//   },
favouriteCard: {
    width: 300,
    height: 180,
    marginLeft: 10,
    marginRight: 5, // Added for spacing if there are multiple cards
    borderRadius: 15,
    backgroundColor: '#333333', // Fallback color
    overflow: 'hidden', // Ensures content stays within bounds
    position: 'relative', // For absolute positioning of children if needed
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Shadow for Android
  },
  favouriteBackground: {
    flex: 1, // Make sure it fills the card
    justifyContent: 'flex-end', // Align content to the bottom
  },
  favouriteContent: {
    padding: 15, // Padding inside the card
    backgroundColor: 'rgba(0,0,0,0.4)', // Semi-transparent overlay for text readability
  },
  favouriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  favouriteName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  favouritePoints: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    textAlign: 'center',
  },
  favouritePointsToNext: {
    fontSize: 12,
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  // progressBarBackground: {
  //   height: 6,
  //   backgroundColor: '#FFFFFF',
  //   borderRadius: 3,
  //   marginBottom: 15,
    
    
  // },
  progressBarContainer: {
    flexDirection: 'row',      // If you want the children to be in a row (default)
    justifyContent: 'center',  // This will center the progress bar horizontally
    alignItems: 'center',      // This will center the progress bar vertically if needed
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    marginBottom: 15,
    width: '80%', // Control the width of the background
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF6B00',
    borderRadius: 3,
  },
  favouriteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Distributes space between items
    alignItems: 'center',
    marginTop: 10, // Adds some space above the footer
  },
  favouriteFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favouriteFooterText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 8, // Adds space between the icon and text
  },
  rewardsContainer: {
    paddingLeft: 15,
    paddingBottom: 10, // Added padding at the bottom of the scroll view
  },
  rewardCard: {
    width: 150,
    marginRight: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  rewardImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  rewardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  rewardSubtitle: {
    fontSize: 12,
    color: '#777777',
    marginBottom: 5,
  },
  rewardPoints: {
    backgroundColor: '#FFF2E5',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  rewardPointsText: {
    color: '#FF8924',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default HomeScreen;