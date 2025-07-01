import React, { useState, useRef, useEffect } from 'react'; // Added useEffect
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
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  Pressable,
  Modal,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getValidPromotions } from '../../utils/getValidPromotions';
import { supabase } from '../../supabaseClient';
import LottieView from 'lottie-react-native';

// Constants for promotion carousel
const PROMOTION_CARD_WIDTH = 300; // from styles.promotionCard.width
const PROMOTION_CARD_MARGIN_LEFT = 15; // from styles.promotionCard.marginLeft
const PROMOTION_SNAP_INTERVAL = PROMOTION_CARD_WIDTH + PROMOTION_CARD_MARGIN_LEFT;


// const HomeScreen = ({ navigation, showSidebar }) => {
const HomeScreen = ({ navigation }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activePromotionIndex, setActivePromotionIndex] = useState(0);
  const promotionsScrollViewRef = useRef(null);
  const [promotionsData, setPromotionsData] = useState([]);
  const [loadingPromotions, setLoadingPromotions] = useState(true);
  const [dealsModalVisible, setDealsModalVisible] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [favouriteBusinesses, setFavouriteBusinesses] = useState([]);
  const [favouriteLoading, setFavouriteLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [homeRewards, setHomeRewards] = useState([]);
  const [loadingHomeRewards, setLoadingHomeRewards] = useState(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      setLoadingPromotions(true);
      try {
        const promos = await getValidPromotions(4);
        setPromotionsData(promos || []);
      } catch (e) {
        setPromotionsData([]);
        console.error('Failed to fetch promotions:', e);
      } finally {
        setLoadingPromotions(false);
      }
    };
    fetchPromotions();
  }, []);

  useEffect(() => {
    const fetchFavourites = async () => {
      setFavouriteLoading(true);
      try {
        const { data: { user }, error: userErr } = await supabase.auth.getUser();
        if (userErr || !user) {
          setFavouriteBusinesses([]);
          setFavouriteLoading(false);
          return;
        }
        const { data: customer, error: custErr } = await supabase
          .from('customers')
          .select('favourites')
          .eq('id', user.id)
          .single();
        if (custErr || !customer?.favourites?.length) {
          setFavouriteBusinesses([]);
          setFavouriteLoading(false);
          return;
        }
        const businessIds = customer.favourites;
        const { data: businesses, error: bizErr } = await supabase
          .from('businesses')
          .select('id, name, cover_image_url')
          .in('id', businessIds);
        const { data: pointsRows, error: pointsErr } = await supabase
          .from('customer_points')
          .select('business_id, points')
          .eq('customer_id', user.id)
          .in('business_id', businessIds);
        const favsWithCounts = await Promise.all(
          businesses.map(async (biz) => {
            // 1) get all rewards for this business
            const { data: rewardsList } = await supabase
              .from("rewards")
              .select("id, points_required, is_active")
              .eq("business_id", biz.id);
            const rewardsCount = rewardsList?.filter(r => r.is_active).length || 0;
            // 2) count promotions
            const { count: dealsCount } = await supabase
              .from('promotions')
              .select('id', { head: true, count: 'exact' })
              .eq('business_id', biz.id)
              .eq('status', 'active');

            // 3) find this user’s points
            const points = pointsRows.find(p => p.business_id === biz.id)?.points || 0

            // 4) affordable rewards count
            const affordableCount = rewardsList?.filter(r => r.is_active && points >= r.points_required).length || 0;

            // 5) progress bar logic
            const thresholds = rewardsList?.filter(r => r.is_active).map(r => r.points_required).sort((a, b) => a - b) || [];
            let progressMax = thresholds[0] || 1;
            if (points >= progressMax && thresholds.length > 1) {
              const nextThreshold = thresholds.find(t => t > thresholds[0]);
              progressMax = nextThreshold || thresholds[thresholds.length - 1];
            }
            const progressPercent = Math.min(points / progressMax, 1) * 100;

            return {
              id: biz.id,
              name: biz.name,
              image: biz.cover_image_url, // FIX: Don't use require() here. Fallback is handled in the render method.
              points,
              rewardsCount,
              dealsCount,
              affordableCount,
              progressPercent,
            }
          })
        )

        setFavouriteBusinesses(favsWithCounts)

      } catch (e) {
        setFavouriteBusinesses([]);
      } finally {
        setFavouriteLoading(false);
      }
    };
    fetchFavourites();
  }, []);

  useEffect(() => {
    async function fetchHomeRewards() {
      setLoadingHomeRewards(true);
      try {
        // Fetch all available rewards from the rewards table, joined with business info
        const { data, error } = await supabase
          .from('rewards')
          .select(`
            id,
            title,
            image_url,
            points_required,
            business:businesses(id, name)
          `)
          .order('created_at', { ascending: false })
          .limit(10);
        if (error) {
          setHomeRewards([]);
        } else {
          setHomeRewards(data || []);
        }
      } catch (e) {
        setHomeRewards([]);
      } finally {
        setLoadingHomeRewards(false);
      }
    }
    fetchHomeRewards();
  }, []);

  const handlePromotionScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.floor(scrollPosition / PROMOTION_SNAP_INTERVAL + 0.5);
    if (currentIndex >= 0 && currentIndex < promotionsData.length) {
      setActivePromotionIndex(currentIndex);
    }
  };

  const handlePromotionPress = promo => {
    setSelectedDeal(promo);
    setDealsModalVisible(true);
  };

  const refreshHomeScreen = async () => {
    setRefreshing(true)
    setLoadingPromotions(true)
    setFavouriteLoading(true)
    setLoadingHomeRewards(true)

    try {
      // Re-fetch promotions
      const promos = await getValidPromotions(4);
      setPromotionsData(promos || []);

      // Re-fetch favourites and counts
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (!userErr && user) {
        const { data: customer } = await supabase
          .from('customers')
          .select('favourites')
          .eq('id', user.id)
          .single();
        if (customer?.favourites?.length) {
          const businessIds = customer.favourites;
          const { data: businesses } = await supabase
            .from('businesses')
            .select('id, name, cover_image_url')
            .in('id', businessIds);
          const { data: pointsRows } = await supabase
            .from('customer_points')
            .select('business_id, points')
            .eq('customer_id', user.id)
            .in('business_id', businessIds);

          const favsWithCounts = await Promise.all(businesses.map(async biz => {
            // 1) count rewards
            const { count: rewardsCount } = await supabase
              .from('rewards')
              .select('id', { head: true, count: 'exact' })
              .eq('business_id', biz.id)
              .eq('is_active', true);

            // 2) count promotions
            const { count: dealsCount } = await supabase
              .from('promotions')
              .select('id', { head: true, count: 'exact' })
              .eq('business_id', biz.id)
              .eq('status', 'active');

            // 3) find this user’s points
            const points = pointsRows.find(p => p.business_id === biz.id)?.points || 0

            // 4) calculate progress towards next reward (assuming 100 points per reward for progress bar)
            const progressPercent = Math.min((points % 100) / 100 * 100, 100);

            // 5) find affordable rewards count
            const { count: affordableCount } = await supabase
              .from('rewards')
              .select('id', { head: true, count: 'exact' })
              .eq('business_id', biz.id)
              .lte('points_required', points)
              .eq('is_active', true);

            return {
              id: biz.id,
              name: biz.name,
              image: biz.cover_image_url, // Use URL, fallback is handled in render
              points,
              rewardsCount,
              dealsCount,
              progressPercent,
              affordableCount,
            }
          }))
          setFavouriteBusinesses(favsWithCounts)
        } else {
          setFavouriteBusinesses([])
        }
      } else {
        setFavouriteBusinesses([])
      }

      // Home rewards
      const { data: rewards } = await supabase
        .from('rewards')
        .select(`
          id,
          title,
          image_url,
          points_required,
          business:businesses(id, name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      setHomeRewards(rewards || []);

    } catch (e) {
      console.error('Refresh error:', e)
    } finally {
      setLoadingPromotions(false)
      setFavouriteLoading(false)
      setLoadingHomeRewards(false)
      setRefreshing(false)
    }
  }

  // Remove unique business filter so all rewards (including multiple from the same business) are shown
  // Show only the 4 most recent rewards
  const rewardsToShow = homeRewards.slice(0, 4);

  return (
    <>
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FF8924" />
      
      {/* Header - Fixed */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)}>
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.headerTitle}>ZAWADII</Text>
        </View>
      </View>
      
      {/* Main Content with Linear Gradient Background */}
      <LinearGradient
        colors={['#FD8424', '#F6F6F6', '#F6F6F6']}
        locations={[0.13, 0.32, 1]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.mainScrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refreshHomeScreen} />
          }
        >
          {/* Promotions Carousel */}
          {loadingPromotions ? (
            <View style={{height: 180, justifyContent: 'center', alignItems: 'center'}}>
              <Text>Loading promotions...</Text>
            </View>
          ) : promotionsData.length === 0 ? (
            <View style={{height: 180, justifyContent: 'center', alignItems: 'center'}}>
              <Text>No promotions available.</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.promotionsContainer}
              ref={promotionsScrollViewRef}
              snapToInterval={PROMOTION_SNAP_INTERVAL}
              decelerationRate="fast"
              onMomentumScrollEnd={handlePromotionScroll}
              contentContainerStyle={{ paddingRight: PROMOTION_CARD_MARGIN_LEFT }}
            >
              {promotionsData.map((promotion) => (
                <TouchableOpacity
                  key={promotion.id}
                  onPress={() => handlePromotionPress(promotion)}
                  activeOpacity={0.8}
                >
                  <View
                    key={promotion.id}
                    style={styles.promotionCard}
                  >
                    {promotion.image_url ? (
                      <Image
                        source={{ uri: promotion.image_url }}
                        style={styles.promotionImage}
                      />
                    ) : (
                      <View style={[styles.promotionImage, {backgroundColor:'#eee', justifyContent:'center', alignItems:'center'}]}>
                        <Text>No Image</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Carousel Indicators */}
          {promotionsData.length > 1 && (
            <View style={styles.indicatorsContainer}>
              {promotionsData.map((_, index) => (
                <View
                  key={`indicator-${index}`}
                  style={[
                    styles.indicator,
                    activePromotionIndex === index ? styles.activeIndicator : null,
                  ]}
                />
              ))}
            </View>
          )}
          
          {/* Favourites Section */}
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Favourites</Text>
            <TouchableOpacity
              style={styles.seeMoreButton}
              onPress={() => navigation.navigate('Favourites')}
            >
              <Text style={styles.seeMoreButtonText}>See more</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.favouritesContainer}
            snapToInterval={300 + 15} // Card width + margin
            decelerationRate="fast"
            contentContainerStyle={{ paddingRight: 15 }}
          >
            {favouriteLoading ? (
              <View style={{justifyContent:'center',alignItems:'center',height:160, width: Dimensions.get('window').width, alignSelf: 'center', flexDirection: 'column'}}>
                <ActivityIndicator size="large" color="#FF8924" />
              </View>
            ) : favouriteBusinesses.length === 0 ? (
              <View style={{justifyContent:'center',alignItems:'center',height:160, width: Dimensions.get('window').width, alignSelf: 'center', flexDirection: 'column'}}>
                <LottieView
                  source={require('../../assets/lottie/empty.json')}
                  autoPlay
                  loop
                  style={{width:100,height:100,marginBottom:10}}
                />
                <Text style={{fontWeight:'bold',fontSize:16,color:'#FF8924',marginBottom:4, textAlign: 'center'}}>No Favourites Yet</Text>
                <Text style={{color:'#888',fontSize:14,textAlign:'center',maxWidth:180, height: 40}}>
                  Add a restaurant to favourites to see it here!
                </Text>
              </View>
            ) : favouriteBusinesses.slice(0, 3).map(biz => (
              <TouchableOpacity
                key={biz.id}
                style={styles.favouriteCard}
                onPress={() => navigation.navigate('SpecificRestaurantScreen', { businessId: biz.id })}
              >
                <ImageBackground 
                  source={biz.image ? { uri: biz.image } : require('../../assets/loyalty-card.jpeg')} 
                  style={styles.favouriteBackground}
                  imageStyle={{ borderRadius: 15 }}
                >
                  <View style={styles.favouriteContent}>
                    <View style={styles.favouriteHeader}>
                      <Text style={styles.favouriteName}>{biz.name}</Text>
                    </View>
                    <Text style={styles.favouritePoints}>{biz.points.toLocaleString()} pts</Text>
                    {/* Progress bar and affordable rewards circle */}
                    {biz.rewardsCount > 0 && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                        <View style={[styles.progressBarBackground, { flex: 1 }]}> 
                          <View
                            style={[
                              styles.progressBar,
                              { width: `${biz.progressPercent}%` },
                            ]}
                          />
                        </View>
                        <View style={styles.affordableCircleContainer}>
                          <View style={styles.affordableCircle}>
                            <Text style={styles.affordableCircleText}>{biz.affordableCount}</Text>
                          </View>
                        </View>
                      </View>
                    )}
                    <Text style={styles.favouritePointsToNext}>Use your points to buy rewards</Text>
                    {/* <View style={styles.progressBarContainer}>
                      <View style={styles.progressBarBackground}>
                        <View style={styles.progressBar}></View>
                      </View>
                    </View> */}
                    <View style={styles.favouriteFooter}>
                      <View style={styles.favouriteFooterItem}>
                        <MaterialIcons name="card-giftcard" size={18} color="#FFFFFF" />
                        <Text style={styles.favouriteFooterText}>
                          {biz.rewardsCount} reward{biz.rewardsCount === 1 ? '' : 's'}
                        </Text>
                      </View>
                      <View style={styles.favouriteFooterItem}>
                        <FontAwesome name="tag" size={18} color="#FFFFFF" />
                        <Text style={styles.favouriteFooterText}>
                          {biz.dealsCount} deal{biz.dealsCount === 1 ? '' : 's'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Rewards Section */}
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Rewards</Text>
          </View>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.rewardsContainer}
            contentContainerStyle={{ paddingLeft: 10, paddingRight: 16 }}
          >
            {loadingHomeRewards ? (
              <View style={{ width: 180, justifyContent: 'center', alignItems: 'center', height: 160 }}>
                <ActivityIndicator size="small" color="#FF8924" />
              </View>
            ) : rewardsToShow.length === 0 ? (
              <View style={{ width: 180, justifyContent: 'center', alignItems: 'center', height: 160 }}>
                <Text style={{ color: '#888' }}>No rewards available.</Text>
              </View>
            ) : (
              rewardsToShow.map((reward) => (
                <TouchableOpacity
                  key={reward.id}
                  style={styles.largeRewardCard}
                  onPress={() => {
                    if (reward.business && reward.business.id) {
                      navigation.navigate('SpecificRestaurantScreen', { businessId: reward.business.id });
                    }
                  }}
                >
                  <Image source={{ uri: reward.image_url }} style={styles.largeRewardImage} />
                  <Text style={styles.largeRewardTitle} numberOfLines={1}>{reward.title}</Text>
                  <Text style={styles.largeRewardSubtitle} numberOfLines={1}>{reward.business?.name || ''}</Text>
                  <View style={styles.largeRewardPointsBadge}>
                    <Ionicons name="star" size={16} color="#fff" style={{ marginRight: 3 }} />
                    <Text style={styles.largeRewardPointsText}>{reward.points_required.toLocaleString()} pts</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
          
          {/* Add some padding at the bottom to ensure scrollability */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </LinearGradient>

      {/* Deals Detail Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={dealsModalVisible}
        onRequestClose={() => setDealsModalVisible(false)}
      >
        <View style={styles.centeredViewDeal}>
          <View style={styles.modalViewDeal}>
            <Pressable
              style={styles.closeButtonDeal}
              onPress={() => setDealsModalVisible(false)}
            >
              <Text style={styles.closeButtonTextDeal}>✕</Text>
            </Pressable>

            {selectedDeal?.image_url && (
              <Image
                source={{ uri: selectedDeal.image_url }}
                style={styles.dealImageModal}
                resizeMode="cover"
              />
            )}

            <Text style={styles.dealTitleModal}>{selectedDeal?.title}</Text>
            <Text style={styles.dealDescription}>{selectedDeal?.description}</Text>

            {/* Show business name if available */}
            {selectedDeal?.business?.name && (
              <View>
                <TouchableOpacity
                  onPress={() => {
                    setDealsModalVisible(false);
                    if (selectedDeal?.business_id) {
                      navigation.navigate('SpecificRestaurantScreen', { businessId: selectedDeal.business_id });
                    }
                  }}
                >
                  <Text style={[styles.dealTitleModal, { fontSize: 16, color: '#FF8924', textDecorationLine: 'underline' }]}>
                    {selectedDeal.business.name}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {(selectedDeal?.start_date || selectedDeal?.end_date) && (
              <View style={styles.dealDatesContainer}>
                {selectedDeal?.start_date && (
                  <View style={styles.dealDateBlock}>
                    <Text style={styles.dealDateLabel}>Starts</Text>
                    <Text style={styles.dealDateValue}>{selectedDeal.start_date}</Text>
                  </View>
                )}
                {selectedDeal?.end_date && (
                  <View style={styles.dealDateBlock}>
                    <Text style={styles.dealDateLabel}>Ends</Text>
                    <Text style={styles.dealDateValue}>{selectedDeal.end_date}</Text>
                  </View>
                )}
              </View>
            )}


          </View>
        </View>
      </Modal>
      
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
    // justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FF8924',
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingTop: 30,
    zIndex: 10,
  },
  headerTitle: {
    justifyContent: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  seeMoreButton: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
    // backgroundColor: '#ffffff',
    alignSelf: 'center',
  },
  seeMoreButtonText: {
    color: '#FF8924',
    fontWeight: 'bold',
    fontSize: 13,
    borderBottomColor: '#FF8924',
    borderBottomWidth: 1,
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
    height: '100%',
    // alignItems: 'center',
    justifyContent: 'center',
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
    color: '#FFA100',
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
    backgroundColor: 'rgba(255,255,255,0.3)',
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
  modernRewardCard: {
    width: 160,
    marginRight: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  modernRewardImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#f6f6f6',
  },
  modernRewardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
    textAlign: 'center',
  },
  modernRewardSubtitle: {
    fontSize: 13,
    color: '#FF8924',
    marginBottom: 7,
    textAlign: 'center',
  },
  modernRewardPointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF8924',
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginTop: 2,
  },
  modernRewardPointsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  smallRewardCard: {
    width: 90,
    marginRight: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 6,
  },
  smallRewardImage: {
    width: 45,
    height: 45,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: '#f6f6f6',
  },
  smallRewardTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#222',
    marginBottom: 1,
    textAlign: 'center',
  },
  smallRewardSubtitle: {
    fontSize: 10,
    color: '#FF8924',
    marginBottom: 4,
    textAlign: 'center',
  },
  smallRewardPointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF8924',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginTop: 1,
  },
  smallRewardPointsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
  },
  largeRewardCard: {
    width: 120,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  largeRewardImage: {
    width: 100,
    height: 90,
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: '#f6f6f6',
  },
  largeRewardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    marginBottom: 3,
    textAlign: 'center',
  },
  largeRewardSubtitle: {
    fontSize: 10,
    color: '#FF8924',
    marginBottom: 8,
    textAlign: 'center',
  },
  largeRewardPointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF8924',
    borderRadius: 14,
    paddingVertical: 2,
    paddingHorizontal: 10,
    marginTop: 3,
  },
  largeRewardPointsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  centeredViewDeal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalViewDeal: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    elevation: 5,
  },
  closeButtonDeal: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  closeButtonTextDeal: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  dealImageModal: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dealTitleModal: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15,
  },
  dealDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
    color: '#555',
  },
  dealDatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingHorizontal: 20,
  },
  dealDateBlock: {
    alignItems: 'center',
  },
  dealDateLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dealDateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  affordableCircleContainer: {
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15, // Added to ensure it aligns with the progress bar
  },
  affordableCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center', // ensure vertical centering
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  affordableCircleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

export default HomeScreen;