import React, { useState } from 'react';
import SimpleSidebar from '../components/SimpleSidebar'; 
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
                source={require('../assets/happy-man.jpeg')}
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
                source={require('../assets/offer2.jpg')}
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
    source={require('../assets/loyalty-card.jpeg')} 
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
                source={require('../assets/fries1.jpeg')}
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
                source={require('../assets/burger1.jpeg')}
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
                source={require('../assets/soda1.jpeg')}
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
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#FF8924" />
        </TouchableOpacity>
        <TouchableOpacity 
            style={styles.navItem} onPress={() => navigation.navigate('SearchScreen')}
            >
          <Ionicons name="search" size={24} color="#AAAAAA" />
        </TouchableOpacity>

        <TouchableOpacity 
           style={styles.navItem} onPress={() => navigation.navigate('ScanScreen')}
        >
          <View style={styles.qrButtonContainer}>
            <Ionicons name="scan" size={28} color="#AAAAAA" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
         style={styles.navItem} onPress={() => navigation.navigate('RewardsScreen')}
        >
          <Ionicons name="gift-outline" size={24} color="#AAAAAA" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem} onPress={() => navigation.navigate('ProfileScreen')}
        >
          <Ionicons name="person-outline" size={24} color="#AAAAAA" />
        </TouchableOpacity>
      </View>
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
    borderRadius: 15,
    overflow: 'hidden', // Ensures rounded corners on the background image
  },
  
//   favouriteBackground: {
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center', // Align content in the center
//     padding: 15,
//   },
  
  favouriteContent: {
    backgroundColor: 'rgba(0,0,0,0.4)', // Optional overlay for better readability
    padding: 10,
    borderRadius: 15,
  },
  
  favouriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  favouriteName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
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
    width: '85%',  // Adjust width as needed
  },
  progressBar: {
    width: '60%',
    height: 6,
    backgroundColor: '#FF8924',
    borderRadius: 3,
  },
  favouriteFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  favouriteFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  favouriteFooterText: {
    fontSize: 12,
    color: 'white',
    marginLeft: 5,
  },
  addFavouriteButton: {
    width: 80,
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    
  },
  addFavouriteCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardsContainer: {
    paddingLeft: 15,
    paddingBottom: 20,
  },
  rewardCard: {
    width: 120,
    backgroundColor: 'white',
    borderRadius: 15,
    marginRight: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardImage: {
    width: 120,
    height: 90,
    resizeMode: 'cover',
  },
  rewardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  rewardSubtitle: {
    fontSize: 12,
    color: '#777777',
    paddingHorizontal: 10,
  },
  rewardPoints: {
    backgroundColor: '#F5F5F5',
    padding: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  rewardPointsText: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: 'white',
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrButtonContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    marginTop: 0,
    borderWidth: 4,
    borderColor: 'white',
  },
});

export default HomeScreen;