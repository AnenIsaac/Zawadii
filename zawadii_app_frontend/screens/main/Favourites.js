import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ImageBackground,
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabaseClient';
import LottieView from 'lottie-react-native';

export default function Favourites({ navigation }) {
  const [favouriteBusinesses, setFavouriteBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavourites = async () => {
      setLoading(true);
      try {
        const { data: { user }, error: userErr } = await supabase.auth.getUser();
        if (userErr || !user) {
          setFavouriteBusinesses([]);
          setLoading(false);
          return;
        }
        const { data: customer, error: custErr } = await supabase
          .from('customers')
          .select('favourites')
          .eq('id', user.id)
          .single();
        if (custErr || !customer?.favourites?.length) {
          setFavouriteBusinesses([]);
          setLoading(false);
          return;
        }
        const businessIds = customer.favourites;
        const { data: businesses } = await supabase
          .from('businesses')
          .select('id, name')
          .in('id', businessIds);
        const { data: pointsRows } = await supabase
          .from('customer_points')
          .select('business_id, points')
          .eq('customer_id', user.id)
          .in('business_id', businessIds);
        // Dummy image assignment for now
        const images = [require('../../assets/fav1.jpg'), require('../../assets/fav2.jpg'), require('../../assets/fav3.jpg'), require('../../assets/fav1.jpg')];
        const favs = businesses.map((biz, i) => ({
          id: biz.id,
          name: biz.name,
          points: pointsRows.find(p => p.business_id === biz.id)?.points || 0,
          pointsTillReward: 500, // dummy
          rewards: 5, // dummy
          deals: 3, // dummy
          image: images[i % images.length],
        }));
        setFavouriteBusinesses(favs);
      } catch (e) {
        setFavouriteBusinesses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFavourites();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} />
        ) : favouriteBusinesses.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <LottieView
              source={require('../../assets/lottie/empty.json')}
              autoPlay
              loop
              style={{ width: 120, height: 120, marginBottom: 10 }}
            />
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#FF8924', marginBottom: 4 }}>
              You don't have any favourites right now
            </Text>
          </View>
        ) : favouriteBusinesses.map((restaurant) => (
          <TouchableOpacity key={restaurant.id} style={styles.restaurantCard} onPress={() => navigation?.navigate?.('SpecificRestaurantScreen', { businessId: restaurant.id })}>
            <ImageBackground 
              source={restaurant.image} 
              style={styles.restaurantImage}
              imageStyle={styles.restaurantImageStyle}
            >
              <View style={styles.cardOverlay}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.pointsText}>{restaurant.points}pts</Text>
                <Text style={styles.pointsTillRewardText}>
                  {restaurant.pointsTillReward} points till your next rewards
                </Text>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBar, 
                      {width: `${(restaurant.points / (restaurant.points + restaurant.pointsTillReward)) * 100}%`}
                    ]} 
                  />
                </View>
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
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
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

