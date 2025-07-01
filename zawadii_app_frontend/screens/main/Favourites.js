import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../supabaseClient";
import LottieView from "lottie-react-native";

export default function Favourites({ navigation }) {
  const [favouriteBusinesses, setFavouriteBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavourites = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();
        if (userErr || !user) {
          setFavouriteBusinesses([]);
          setLoading(false);
          return;
        }
        const { data: customer, error: custErr } = await supabase
          .from("customers")
          .select("favourites")
          .eq("id", user.id)
          .single();
        if (custErr || !customer?.favourites?.length) {
          setFavouriteBusinesses([]);
          setLoading(false);
          return;
        }
        const businessIds = customer.favourites;
        const { data: businesses } = await supabase
          .from("businesses")
          .select("id, name, cover_image_url")
          .in("id", businessIds);
        const { data: pointsRows } = await supabase
          .from("customer_points")
          .select("business_id, points")
          .eq("customer_id", user.id)
          .in("business_id", businessIds);
        // Dummy image assignment for now
        // const images = [require('../../assets/fav1.jpg'), require('../../assets/fav2.jpg'), require('../../assets/fav3.jpg'), require('../../assets/fav1.jpg')];
        // const favs = businesses.map((biz, i) => ({
        //   id: biz.id,
        //   name: biz.name,
        //   points: pointsRows.find(p => p.business_id === biz.id)?.points || 0,
        //   pointsTillReward: 500, // dummy
        //   rewards: 5, // dummy
        //   deals: 3, // dummy
        //   image: images[i % images.length],
        // }));
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
              .from("promotions")
              .select("id", { head: true, count: "exact" })
              .eq("business_id", biz.id)
              .eq('status', 'active');
            // 3) find this user’s points
            const points =
              pointsRows.find((p) => p.business_id === biz.id)?.points || 0;
            // 4) affordable rewards count
            const affordableCount = rewardsList?.filter(r => r.is_active && points >= r.points_required).length || 0;
            // 5) progress bar logic
            const thresholds = rewardsList?.filter(r => r.is_active).map(r => r.points_required).sort((a, b) => a - b) || [];
            let progressMax = thresholds[0] || 1;
            if (points >= progressMax && thresholds.length > 1) {
              const nextThreshold = thresholds.find(t => t > thresholds[0]);
              progressMax = nextThreshold || thresholds[thresholds.length - 1];
            }
            const clampedProgressPercent = Math.min(points / progressMax, 1) * 100;
            return {
              id: biz.id,
              name: biz.name,
              image: biz.cover_image_url, // Only assign string or null
              points,
              rewardsCount,
              dealsCount,
              affordableCount,
              progressPercent: clampedProgressPercent,
            };
          })
        );
        setFavouriteBusinesses(favsWithCounts);
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
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#FF8C00" />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {favouriteBusinesses.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <LottieView
                source={require("../../assets/lottie/empty.json")}
                autoPlay
                loop
                style={{ width: 120, height: 120, marginBottom: 10 }}
              />
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  color: "#FF8924",
                  marginBottom: 4,
                }}
              >
                You don't have any favourites right now
              </Text>
            </View>
          ) : (
            favouriteBusinesses.map((restaurant) => (
              <TouchableOpacity
                key={restaurant.id}
                style={styles.restaurantCard}
                onPress={() =>
                  navigation?.navigate?.("SpecificRestaurantScreen", {
                    businessId: restaurant.id,
                  })
                }
              >
                <ImageBackground
                  source={
                    restaurant.image
                      ? { uri: restaurant.image }
                      : require("../../assets/fav1.jpg")
                  }
                  style={styles.restaurantImage}
                  imageStyle={styles.restaurantImageStyle}
                >
                  <View style={styles.cardOverlay}>
                    <Text style={styles.restaurantName}>{restaurant.name}</Text>
                    <Text style={styles.pointsText}>
                      {restaurant.points.toLocaleString()} pts
                    </Text>
                    {/* Progress bar and affordable rewards circle */}
                    {restaurant.rewardsCount > 0 && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                        <View style={[styles.progressBarBackground, { flex: 1 }]}> 
                          <View
                            style={[
                              styles.progressBar,
                              { width: `${restaurant.progressPercent}%` },
                            ]}
                          />
                        </View>
                        <View style={styles.affordableCircleContainer}>
                          <View style={styles.affordableCircle}>
                            <Text style={styles.affordableCircleText}>{restaurant.affordableCount}</Text>
                          </View>
                        </View>
                      </View>
                    )}
                    <Text style={styles.pointsTillRewardText}>
                      Use your points to get rewards
                    </Text>
                    {/* <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${
                              (restaurant.points /
                                (restaurant.points +
                                  restaurant.pointsTillReward)) *
                              100
                            }%`,
                          },
                        ]}
                      />
                    </View> */}
                    <View style={styles.benefitsContainer}>
                      <View style={styles.benefitItem}>
                        <Ionicons name="gift-outline" size={18} color="white" />
                        <Text style={styles.benefitText}>
                          {restaurant.rewardsCount} reward{restaurant.rewardsCount === 1 ? "" : "s"}
                        </Text>
                      </View>
                      <View style={styles.benefitItem}>
                        <Ionicons
                          name="pricetag-outline"
                          size={18}
                          color="white"
                        />
                        <Text style={styles.benefitText}>
                          {restaurant.dealsCount} deal{restaurant.dealsCount === 1 ? "" : "s"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))
          )}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  restaurantImage: {
    flex: 1,
    width: "100%",
    resizeMode: "cover",
    justifyContent: "flex-end",
  },
  restaurantImageStyle: {
    borderRadius: 15,
  },
  cardOverlay: {
    flex: 1,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    borderRadius: 15,
    height: "100%",
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 19,
  },
  pointsText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFA100",
    marginBottom: 4,
    textAlign: "center",
  },
  pointsTillRewardText: {
    fontSize: 12,
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#FF8C00",
    borderRadius: 4,
  },
  benefitsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  benefitText: {
    fontSize: 12,
    color: "white",
    marginLeft: 4,
  },
  affordableCircleContainer: {
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  affordableCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
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
