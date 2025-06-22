import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Pressable,
  ImageBackground,
  StatusBar,
  Modal,
  Linking,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../supabaseClient";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";

export default function SpecificRestaurantScreen() {
  const route = useRoute();
  const { businessId } = route.params;
  // const BUSINESS_ID = '4311dcf0-053c-4c57-98a2-22484bf2bd92';
  const BUSINESS_ID = businessId;
  const [authUser, setAuthUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [rewardsData, setRewardsData] = useState([]);
  const [customerPoints, setCustomerPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState("rewards"); // 'rewards' or 'deals'

  // Modal states - ALL modal visibility states are defined here
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [redeemConfirmModalVisible, setRedeemConfirmModalVisible] =
    useState(false);
  const [redemptionCodeModalVisible, setRedemptionCodeModalVisible] =
    useState(false);
  const [dealsModalVisible, setDealsModalVisible] = useState(false);

  // Data states for modals
  const [selectedReward, setSelectedReward] = useState(null);
  const [modalType, setModalType] = useState(null); // 'buy' or 'unavailable'
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [redemptionCode, setRedemptionCode] = useState("");
  const [boughtCodeId, setBoughtCodeId] = useState(null);
  const [favourites, setFavourites] = useState([]);

  const navigation = useNavigation();

  const loadAll = async () => {
    try {
      // 1) get auth user
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) {
        Alert.alert("Error", "You must be signed in to view your rewards.");
        return;
      }
      setAuthUser(user);
      // Fetch customer row to get favourites
      const { data: customer, error: custErr } = await supabase
        .from("customers")
        .select("favourites")
        .eq("id", user.id)
        .single();
      if (custErr) {
        console.error("Error loading customer favourites:", custErr);
      } else {
        setFavourites(customer?.favourites || []);
      }
      // 2) kick off business + rewards in parallel
      const businessPromise = supabase
        .from("businesses")
        .select(
          `
        id, name, description, logo_url, cover_image_url,
        phone_number, email, instagram, whatsapp, x, tiktok,
        points_conversion, created_at
        `
        )
        .eq("id", BUSINESS_ID)
        .single();

      const rewardsPromise = supabase
        .from("rewards")
        .select("*")
        .eq("business_id", BUSINESS_ID);

      const [
        { data: business, error: bizErr },
        { data: rewards, error: rewardsErr },
      ] = await Promise.all([businessPromise, rewardsPromise]);

      if (bizErr) {
        console.error("Error loading business:", bizErr);
        Alert.alert("Error", "Could not load restaurant info.");
        return;
      }
      if (rewardsErr) {
        console.error("Error loading rewards:", rewardsErr);
        // you can still continue, maybe there just aren't any
      }

      setRestaurant(business);
      setRewardsData(rewards || []);

      // 3) now load customer points
      const { data: cpData, error: cpErr } = await supabase
        .from("customer_points")
        .select("points")
        .eq("customer_id", user.id)
        .eq("business_id", BUSINESS_ID)
        .maybeSingle();

      if (cpErr) {
        console.error("Error loading customer points:", cpErr);
      } else {
        setCustomerPoints(cpData?.points ?? 0);
      }

      // 4) now load promotions for this business
      const { data: promos, error: promoErr } = await supabase
        .from("promotions")
        .select("*")
        .eq("business_id", BUSINESS_ID);

      if (promoErr) {
        console.error("Error loading promotions:", promoErr);
      } else {
        setPromotions(promos);
      }
    } catch (err) {
      console.error("Unexpected error in loadAll:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#FF8C00"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      />
    );
  }

  // Handler for when a reward item is pressed
  const handleRewardPress = (reward) => {
    setSelectedReward(reward);
    setModalType(reward.is_active ? "buy" : "unavailable");
    setPurchaseModalVisible(true);
  };

  // Handler for buy confirmation
  const handleBuyConfirm = async () => {
    setPurchaseModalVisible(false);

    if (!authUser) {
      return Alert.alert("Error", "You must be signed in to buy rewards.");
    }

    // Takes one unused code for the reward
    const { data: rows, error: fetchErr } = await supabase
      .from("reward_codes")
      .select("id, code")
      .eq("reward_id", selectedReward.id)
      .eq("business_id", BUSINESS_ID)
      .eq("status", "unused")
      .limit(1);

    if (fetchErr) {
      console.error("Error fetching reward code:", fetchErr);
      return Alert.alert("Error", "Could not fetch a reward code. Try again.");
    }

    const codeRow = rows?.[0];
    if (!codeRow) {
      return Alert.alert(
        "Sold Out",
        "No more codes are available for this reward."
      );
    }

    // Marks code as bought
    console.log("Marking code as bought, id=", codeRow.id);
    const { data: updated, error: updateError } = await supabase
      .from("reward_codes")
      .update({
        customer_id: authUser.id,
        status: "bought",
        bought_at: new Date().toISOString(),
      })
      .eq("id", codeRow.id)
      .select();

    if (updateError || !updated?.length) {
      console.error("Error updating reward code:", updateError);
      return Alert.alert("Error", "Could not buy your code. Try again.");
    }

    // store the redemption code for the modal
    setRedemptionCode(codeRow.code);
    setBoughtCodeId(codeRow.id);

    // 1. Subtract points locally and update state
    const newPoints = Math.max(
      0,
      customerPoints - selectedReward.points_required
    );
    setCustomerPoints(newPoints);

    // 2. Update the customer_points table in Supabase
    const { error: pointsUpdateError } = await supabase
      .from("customer_points")
      .update({ points: newPoints })
      .eq("customer_id", authUser.id)
      .eq("business_id", BUSINESS_ID);

    if (pointsUpdateError) {
      console.error("Error updating customer points:", pointsUpdateError);
      // Optionally, revert local state if needed
      setCustomerPoints(customerPoints);
      Alert.alert("Error", "Could not update your points balance.");
      return;
    }

    // Inserts a new customer_rewards row
    const { data: crRows, error: buyErr } = await supabase
      .from("customer_rewards")
      .insert([
        {
          customer_id: authUser.id,
          reward_id: selectedReward.id,
          business_id: BUSINESS_ID,
          points_spent: selectedReward.points_required,
          status: "bought",
          reward_code_id: codeRow.id,
        },
      ])
      .select();

    console.log("🆕 customer_rewards inserted →", buyErr, crRows);

    if (buyErr || !crRows?.length) {
      console.error("Buy error or zero rows:", buyErr, crRows);
      return Alert.alert("Error", "Could not record your buy. Try again.");
    }

    // 4) show the “Redeem Confirm” modal
    setRedeemConfirmModalVisible(true);
  };

  // Handler for showing redemption code
  const handleShowRedemptionCode = async () => {
    setRedeemConfirmModalVisible(false);

    if (!boughtCodeId) {
      console.warn("No code to redeem");
      return;
    }

    // mark it redeemed
    const { data: updatedCode, error: codeErr } = await supabase
      .from("reward_codes")
      .update({
        status: "redeemed",
        redeemed_at: new Date().toISOString(),
      })
      .eq("id", boughtCodeId);

    if (codeErr) {
      console.error("Error marking code redeemed:", error);
    }

    // Update the corresponding customer_rewards row
    const { data: updatedCR, error: crErr } = await supabase
      .from("customer_rewards")
      .update({
        status: "redeemed",
        redeemed_at: new Date().toISOString(),
      })
      .eq("reward_code_id", boughtCodeId)
      .select();

    if (crErr) {
      console.error("Failed updating customer_rewards:", crErr);
      return Alert.alert("Error", "Could not mark your reward as redeemed.");
    }

    setRedemptionCodeModalVisible(true);
  };

  // Handler for social media links
  const handleSocialMedia = (platform) => {
    // Maps platform names to the corresponding field on `restaurant`
    const urlMap = {
      instagram: restaurant.instagram,
      tiktok: restaurant.tiktok,
      x: restaurant.x,
      whatsapp: restaurant.whatsapp,
    };

    const raw = urlMap[platform];
    if (!raw) {
      return Alert.alert("Unavailable", `No ${platform} link provided.`);
    }

    let link = raw;
    switch (platform) {
      case "instagram":
        link = `https://instagram.com/${raw.replace(/^@/, "")}`;
        break;
      case "tiktok":
        link = `https://www.tiktok.com/@${raw.replace(/^@/, "")}`;
        break;
      case "x":
        link = `https://x.com/${raw.replace(/^@/, "")}`;
        break;
      case "whatsapp":
        const phone = raw.replace(/\D/g, "");
        link = `https://wa.me/${phone}`;
        break;
      default:
        break;
    }

    Linking.openURL(link).catch((err) => {
      console.error("Error opening URL:", err);
      Alert.alert("Error", "Could not open link.");
    });
  };

  // Welcome/Info Modal Component - Fixed the modalVisible prop issue
  const WelcomeModal = ({ visible, onClose }) => {
    return (
      <Modal
        animationType="none"
        transparent={true}
        visible={visible} // This now correctly receives infoModalVisible value
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close-circle" size={28} color="#888" />
            </TouchableOpacity>

            <Image
              source={require("../../assets/burger-friends.jpg")}
              style={styles.headerImage}
              resizeMode="cover"
            />

            <View style={styles.textContainer}>
              <Text style={styles.welcomeTitle}>
                Karibu! Welcome to the {restaurant.name} family!
              </Text>
              {/* <Text style={styles.welcomeText}>
                We started in 2015 with a simple goal: to bring the best, freshest burgers to Dar es Salaam. Now with locations in Mlimani City and Mikocheni, our passion for quality remains unchanged. Our goal is to ensure you enjoy every delicious bite and get rewarded for your loyalty. Start earning points today and experience the taste of Burger 53!
              </Text> */}
              <Text style={styles.welcomeText}>
                {restaurant.description || "We are excited to have you here!"}
              </Text>
            </View>

            <View style={styles.socialContainer}>
              {restaurant.instagram && (
                <TouchableOpacity
                  onPress={() => handleSocialMedia("instagram")}
                >
                  <Ionicons name="logo-instagram" size={24} color="#000" />
                </TouchableOpacity>
              )}
              {restaurant.tiktok && (
                <TouchableOpacity onPress={() => handleSocialMedia("tiktok")}>
                  <Ionicons name="logo-tiktok" size={24} color="#000" />
                </TouchableOpacity>
              )}
              {restaurant.x && (
                <TouchableOpacity onPress={() => handleSocialMedia("x")}>
                  <Ionicons name="logo-twitter" size={24} color="#000" />
                </TouchableOpacity>
              )}
              {restaurant.whatsapp && (
                <TouchableOpacity onPress={() => handleSocialMedia("whatsapp")}>
                  <Ionicons name="logo-whatsapp" size={24} color="#000" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading || !restaurant) {
    return (
      <Text style={{ flex: 1, alignSelf: "center", paddingTop: "50%" }}>
        Loading restaurant info…
      </Text>
    );
  }

  // Compute month.year string
  const memberSince = (() => {
    const d = new Date(restaurant.created_at);
    return `${d.getMonth() + 1}.${d.getFullYear()}`;
  })();

  const isFavourited = favourites.includes(BUSINESS_ID);

  const handleToggleFavourite = async () => {
    if (!authUser) {
      Alert.alert("Error", "You must be signed in to favourite a restaurant.");
      return;
    }
    let newFavourites;
    if (isFavourited) {
      newFavourites = favourites.filter((id) => id !== BUSINESS_ID);
    } else {
      newFavourites = [...favourites, BUSINESS_ID];
    }
    setFavourites(newFavourites);
    const { error } = await supabase
      .from("customers")
      .update({ favourites: newFavourites })
      .eq("id", authUser.id);
    if (error) {
      Alert.alert("Error", "Could not update favourites.");
      // Revert UI
      setFavourites(favourites);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background header image */}
      <ImageBackground
        source={require("../../assets/background.jpg")}
        style={styles.headerBackground}
      >
        <View style={styles.headerOverlay}>
          {/* Back button and info button */}
          <View style={styles.topNavigation}>
            {/* Info Button */}
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => setInfoModalVisible(true)}
            >
              <Ionicons
                name="information-circle-outline"
                size={26}
                color="white"
              />
            </TouchableOpacity>
          </View>

          {/* Gift icon and greeting */}
          <View style={styles.greetingContainer}>
            <View style={styles.giftIconContainer}>
              <Ionicons name="gift-outline" size={24} color="white" />
            </View>
            <Text style={styles.greetingText}>
              Hi, {authUser.user_metadata.full_name}!
            </Text>
          </View>

          {/* Restaurant name and member since */}
          <Text style={styles.restaurantName}>{restaurant?.name}</Text>
          <Text style={styles.memberSinceText}>Member since {memberSince}</Text>

          {/* Social media links */}
          <View style={styles.socialLinksContainer}>
            {restaurant.instagram && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialMedia("instagram")}
              >
                <Ionicons name="logo-instagram" size={18} color="white" />
              </TouchableOpacity>
            )}
            {restaurant.tiktok && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialMedia("tiktok")}
              >
                <Ionicons name="logo-tiktok" size={18} color="white" />
              </TouchableOpacity>
            )}
            {restaurant.x && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialMedia("x")}
              >
                <Ionicons name="logo-twitter" size={18} color="white" />
              </TouchableOpacity>
            )}
            {restaurant.whatsapp && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialMedia("whatsapp")}
              >
                <Ionicons name="logo-whatsapp" size={18} color="white" />
              </TouchableOpacity>
            )}
          </View>

          {/* Rewards and deals count */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="gift-outline" size={20} color="white" />
              <Text style={styles.statText}>
                {rewardsData.length} reward{rewardsData.length === 1 ? "" : "s"}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="pricetag-outline" size={20} color="white" />
              <Text style={styles.statText}>
                {promotions.length} {promotions.length === 1 ? "deal" : "deals"}
              </Text>
            </View>
          </View>

          {/* Points card */}
          <View style={styles.pointsCardContainer}>
            <View style={styles.pointsCard}>
              <View style={styles.pointsRow}>
                <Text style={styles.pointsValue}>
                  {customerPoints.toLocaleString()} pts
                </Text>
                <TouchableOpacity
                  style={[
                    styles.favouriteButton,
                    isFavourited ? styles.favourited : styles.notFavourited,
                  ]}
                  onPress={handleToggleFavourite}
                >
                  <Ionicons
                    name="star"
                    size={16}
                    color={isFavourited ? "white" : "#FF8C00"}
                  />
                  <Text
                    style={{
                      color: isFavourited ? "white" : "#FF8C00",
                      fontWeight: "bold",
                      marginLeft: 4,
                    }}
                  >
                    Favourite
                  </Text>
                </TouchableOpacity>
              </View>

              {/* <Text style={styles.pointsTillRewardText}>
                {restaurant?.pointsTillReward || 'some'} points till your next rewards
              </Text> */}

              <Text style={styles.pointsTillRewardText}>
                Use your points to buy rewards
              </Text>

              {/* Progress Bar */}
              {/* <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBar, 
                    {width: `${(restaurant.points / (restaurant.points + restaurant.pointsTillReward)) * 100}%`}
                  ]} 
                />
              </View> */}
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "rewards" && styles.activeTab]}
          onPress={() => setActiveTab("rewards")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "rewards" && styles.activeTabText,
            ]}
          >
            Rewards
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "deals" && styles.activeTab]}
          onPress={() => setActiveTab("deals")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "deals" && styles.activeTabText,
            ]}
          >
            Deals
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF8C00"]}
          />
        }
      >
        {activeTab === "rewards" ? (
          rewardsData.filter((reward) => reward.is_active).length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No rewards are available for {restaurant.name} at the moment.
              </Text>
            </View>
          ) : (
            // Only show rewards that are active
            rewardsData
              .filter((reward) => reward.is_active)
              .sort((a, b) => a.points_required - b.points_required)
              .map((reward) => {
                const canAfford = customerPoints >= reward.points_required;
                return (
                  <View key={reward.id} style={styles.rewardItem}>
                    <Image
                      source={{ uri: reward.image_url }}
                      style={styles.rewardImage}
                    />
                    <View style={styles.rewardInfo}>
                      <Text style={styles.rewardName}>{reward.title}</Text>
                      <Text style={styles.rewardPoints}>
                        {reward.points_required.toLocaleString()} pts
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        canAfford ? styles.buyButton : styles.unavailableButton, // greyed out if can't afford
                      ]}
                      onPress={() => canAfford && handleRewardPress(reward)}
                      disabled={!canAfford}
                    >
                      <Text style={styles.actionButtonText}>Buy</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
          )
        ) : // Deals list
        promotions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No deals are available for {restaurant.name} at the moment.
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.dealsContainer}
            showsVerticalScrollIndicator={false}
          >
            {promotions.map((promo) => (
              <TouchableOpacity
                key={promo.id}
                style={styles.dealCard}
                onPress={() => {
                  setSelectedDeal(promo);
                  setDealsModalVisible(true);
                }}
              >
                <Image
                  source={{ uri: promo.image_url }}
                  style={styles.dealImage}
                  resizeMode="cover"
                />
                <Text style={styles.dealTitle}>{promo.title}</Text>
                {promo.subtitle && (
                  <Text style={styles.dealSubtitle}>{promo.subtitle}</Text>
                )}
                {promo.points_required != null && (
                  <View style={styles.dealPoints}>
                    <Text style={styles.dealPointsText}>
                      {promo.points_required.toLocaleString()} pts
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Add some bottom padding for scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Info Modal */}
      <WelcomeModal
        visible={infoModalVisible}
        onClose={() => setInfoModalVisible(false)}
      />

      {/* Purchase/Buy Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={purchaseModalVisible}
        onRequestClose={() => setPurchaseModalVisible(false)}
      >
        <View style={styles.centeredView1}>
          <View style={styles.modalView1}>
            <View style={styles.orangeLine1} />
            <Pressable
              style={styles.closeButton1}
              onPress={() => setPurchaseModalVisible(false)}
            >
              <Text style={styles.closeButtonText1}>✕</Text>
            </Pressable>

            <Text style={styles.modalTitle1}>
              {modalType === "buy"
                ? `${restaurant.name} Rewards`
                : `${restaurant.name} Deals`}
            </Text>

            <View style={styles.imageContainer1}>
              {selectedReward?.image_url && (
                <Image
                  source={{ uri: selectedReward.image_url }}
                  style={styles.rewardImage1}
                />
              )}
            </View>

            <Text style={styles.rewardTitle1}>{selectedReward?.title}</Text>
            <Text style={styles.pointsText1}>
              {selectedReward?.points_required} Points
            </Text>
            <Text style={styles.rewardDescription1}>
              {modalType === "buy"
                ? `Buy your ${selectedReward?.title.toLowerCase()} at\n${
                    restaurant.name
                  }.`
                : `Unlock this deal on your next visit to\n${restaurant.name}.`}
            </Text>

            <TouchableOpacity
              style={styles.unavailableButton1}
              onPress={() => {
                if (modalType === "unavailable") {
                  // Handle buy action
                  setPurchaseModalVisible(false);
                } else {
                  // Handle buy action - show redemption confirmation
                  handleBuyConfirm();
                }
              }}
            >
              <Text style={styles.unavailableText1}>
                {modalType === "unavailable"
                  ? "Currently Unavailable"
                  : "Buy Reward"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Redemption Confirmation Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={redeemConfirmModalVisible}
        onRequestClose={() => setRedeemConfirmModalVisible(false)}
      >
        <View style={styles.centeredView1}>
          <View style={styles.modalView1}>
            <View style={styles.orangeLine1} />
            <Pressable
              style={styles.closeButton1}
              onPress={() => setRedeemConfirmModalVisible(false)}
            >
              <Text style={styles.closeButtonText1}>✕</Text>
            </Pressable>

            <Text style={styles.modalTitle1}>{restaurant.name} Rewards</Text>

            <View style={styles.imageContainer1}>
              {selectedReward?.image_url && (
                <Image
                  source={{ uri: selectedReward.image_url }}
                  style={styles.rewardImage1}
                />
              )}
            </View>

            <Text style={styles.rewardTitle1}>{selectedReward?.title}</Text>
            <Text style={styles.pointsText1}>Successfully bought!</Text>
            <Text style={styles.rewardDescription1}>
              Show this code to the cashier to redeem your reward.
            </Text>

            <TouchableOpacity
              style={styles.unavailableButton1}
              onPress={handleShowRedemptionCode}
            >
              <Text style={styles.unavailableButtonText1}>
                Show Redemption Code
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.unavailableButton1,
                { marginTop: 8, backgroundColor: "#999" },
              ]}
              onPress={() => setRedeemConfirmModalVisible(false)}
            >
              <Text style={styles.unavailableButtonText1}>Redeem Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Redemption Code Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={redemptionCodeModalVisible}
        onRequestClose={() => setRedemptionCodeModalVisible(false)}
      >
        <View style={styles.centeredView1}>
          <View style={styles.modalView1}>
            <Pressable
              style={styles.closeButton1}
              onPress={() => setRedemptionCodeModalVisible(false)}
            >
              <Text style={styles.closeButtonText1}>✕</Text>
            </Pressable>

            <View style={styles.imageContainer1}>
              {selectedReward?.image_url && (
                <Image
                  source={{ uri: selectedReward.image_url }}
                  style={styles.rewardImage1}
                />
              )}
            </View>

            <Text style={styles.rewardTitle1}>{selectedReward?.title}</Text>
            <Text style={styles.modalTitle1}>Your Redemption Code</Text>
            <Text style={styles.rewardTitle1}>{redemptionCode}</Text>

            <Text style={styles.rewardDescription1}>
              Present this code to the cashier when placing your order
            </Text>

            <TouchableOpacity
              style={styles.unavailableButton1}
              onPress={() => setRedemptionCodeModalVisible(false)}
            >
              <Text style={styles.unavailableButtonText1}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Deals Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
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
                // source={selectedDeal.image}
                source={{ uri: selectedDeal.image_url }}
                style={styles.dealImageModal}
                resizeMode="cover"
              />
            )}

            <Text style={styles.dealTitleModal}>{selectedDeal?.title}</Text>
            <Text style={styles.dealDescription}>
              {selectedDeal?.description}
            </Text>
            {(selectedDeal?.start_date || selectedDeal?.end_date) && (
              <View style={styles.dealDatesContainer}>
                {selectedDeal?.start_date && (
                  <View style={styles.dealDateBlock}>
                    <Text style={styles.dealDateLabel}>Starts</Text>
                    <Text style={styles.dealDateValue}>
                      {selectedDeal.start_date}
                    </Text>
                  </View>
                )}
                {selectedDeal?.end_date && (
                  <View style={styles.dealDateBlock}>
                    <Text style={styles.dealDateLabel}>Ends</Text>
                    <Text style={styles.dealDateValue}>
                      {selectedDeal.end_date}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Styles are omitted as requested
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 15,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: "80%",
  },
  closeButton: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 10,
    backgroundColor: "white",
    borderRadius: 15,
  },
  headerImage: {
    width: "100%",
    height: 200,
  },
  textContainer: {
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#444",
    textAlign: "center",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 20,
    paddingTop: 10,
    gap: 30,
  },
  headerBackground: {
    height: 300,
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 16,
  },
  topNavigation: {
    width: "100%",
    paddingTop: 30,
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'flex-end',
    // backgroundColor: 'red',
  },
  infoButton: {
    padding: 4,
    alignSelf: "flex-end",
  },
  greetingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  giftIconContainer: {
    marginRight: 8,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginTop: 4,
  },
  memberSinceText: {
    fontSize: 12,
    color: "white",
    marginTop: 2,
  },
  socialLinksContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  socialButton: {
    marginRight: 12,
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  statText: {
    color: "white",
    marginLeft: 4,
    fontSize: 14,
  },
  pointsCardContainer: {
    // paddingHorizontal: 16,
    marginVertical: 10,
  },
  pointsCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pointsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pointsValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addPointsButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF8C00",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  addPointsText: {
    color: "#FF8C00",
    fontSize: 12,
    marginLeft: 2,
  },
  pointsTillRewardText: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#EDEDED",
    borderRadius: 4,
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#FF8C00",
    borderRadius: 4,
  },
  tabsContainer: {
    flexDirection: "row",
    marginTop: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EDEDED",
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#FF8C00",
  },
  tabText: {
    fontSize: 16,
    color: "#999",
  },
  activeTabText: {
    color: "#FF8C00",
    fontWeight: "500",
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  rewardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  rewardImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  rewardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: "500",
  },
  rewardPoints: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  buyButton: {
    backgroundColor: "#FF8C00",
  },
  unavailableButton: {
    backgroundColor: "#999",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
  },
  bottomPadding: {
    height: 20,
  },
  dealsContainer: {
    flex: 1,
    // paddingHorizontal: 16,
    marginTop: 10,
  },
  dealCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  dealImage: {
    width: "100%",
    height: 170,
    borderRadius: 8,
    marginBottom: 8,
  },
  dealTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  dealSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  dealPoints: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF2E5",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  dealPointsText: {
    color: "#FF8C00",
    fontSize: 12,
    fontWeight: "bold",
  },

  centeredView1: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalView1: {
    width: "75%",
    // height: '55%',
    minHeight: 300,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    paddingTop: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: "relative",
  },
  orangeLine1: {
    position: "absolute",
    top: 0,
    width: 30,
    height: 3,
    backgroundColor: "#FF9800",
    borderRadius: 2,
    marginTop: 12,
  },
  closeButton1: {
    position: "absolute",
    right: 15,
    top: 15,
    width: 16,
    height: 16,
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  closeButtonText1: {
    fontSize: 14,
    color: "#555",
  },
  modalTitle1: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 1,
    color: "#333",
  },
  imageContainer1: {
    width: 100,
    height: 100,
    borderRadius: 75,
    overflow: "hidden",
    marginVertical: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff8e1",
    borderWidth: 1,
    marginBottom: 1,
    borderColor: "#f0f0f0",
  },
  rewardImage1: {
    width: 130,
    height: 130,
    resizeMode: "cover",
  },
  rewardTitle1: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    color: "#333",
  },
  pointsText1: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
    color: "#555",
  },
  rewardDescription1: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 25,
    color: "#555",
    lineHeight: 22,
  },
  unavailableButton1: {
    backgroundColor: "#FF9800",
    borderRadius: 25,
    paddingVertical: 15,
    width: "100%",
    alignItems: "center",
    marginTop: 5,
  },
  unavailableText1: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  centeredViewDeal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  modalViewDeal: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    paddingBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  closeButtonDeal: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  closeButtonTextDeal: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },

  dealImageModal: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  dealTitleModal: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 15,
  },

  dealDescription: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 20,
    color: "#555",
  },
  dealDatesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    width: "80%",
    marginTop: 25,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  dealDateBlock: {
    alignItems: "center",
  },
  dealDateLabel: {
    fontSize: 12,
    color: "#999",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  dealDateValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },

  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  favouriteButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#FF8C00",
  },
  favourited: {
    backgroundColor: "#FF8C00",
  },
  notFavourited: {
    backgroundColor: "white",
  },
});
