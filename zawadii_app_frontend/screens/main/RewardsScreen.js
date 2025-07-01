import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
} from "react-native";
import { supabase } from "../../supabaseClient";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

export default function RewardsScreen() {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customerRewards, setCustomerRewards] = useState([]);
  const [redemptionCodeModalVisible, setRedemptionCodeModalVisible] =
    useState(false);
  const [modalPayload, setModalPayload] = useState({
    image: "",
    title: "",
    code: "",
  });
  const [refreshing, setRefreshing] = useState(false);

  const toTZDate = (isoString, offsetHours = 3) => {
    // Parse the UTC timestamp...
    const dt = new Date(isoString);
    // ...then shift it by offsetHours
    dt.setHours(dt.getHours() + offsetHours);
    return dt;
  };

  const formatTimeTZ = (isoString) => {
    const dt = toTZDate(isoString, /*UTC+3*/ 3);
    return dt.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTZ = (isoString) => {
    const dt = toTZDate(isoString, 3);
    return dt.toLocaleDateString();
  };

  const loadRewards = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    setAuthUser(user);

    // Fetch customer_rewards and join on businesses + rewards
    const { data, error } = await supabase
      .from("customer_rewards")
      .select(
        `
        id,
        status,
        points_spent,
        claimed_at,
        redeemed_at,
        reward:rewards!inner(title, image_url),
        business:businesses!inner(name),
        reward_code:reward_codes!inner(id, code)
      `
      )
      .eq("customer_id", user.id);

    if (error) {
      console.error("Error loading customer rewards:", error);
    } else {
      setCustomerRewards(data);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadRewards();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadRewards();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadRewards();
  };

  const redeem = async (cr) => {
    try {
      // Mark the reward_code itself as redeemed
      const { error: codeErr } = await supabase
        .from("reward_codes")
        .update({
          status: "redeemed",
          redeemed_at: new Date().toISOString(),
        })
        .eq("id", cr.reward_code.id);

      if (codeErr) throw codeErr;

      // Mark the customer_rewards row as redeemed
      const { error: crErr } = await supabase
        .from("customer_rewards")
        .update({
          status: "redeemed",
          redeemed_at: new Date().toISOString(),
        })
        .eq("id", cr.id);

      if (crErr) throw crErr;

      // Update local state so the card re‑renders as redeemed
      setCustomerRewards((rs) =>
        rs.map((r) =>
          r.id === cr.id
            ? {
                ...r,
                status: "redeemed",
                redeemed_at: new Date().toISOString(),
              }
            : r
        )
      );

      // set up modal
      setModalPayload({
        image: cr.reward.image_url,
        title: cr.reward.title,
        code: cr.reward_code.code,
      });
      setRedemptionCodeModalVisible(true);
    } catch (err) {
      console.error("Redeem error:", err);
      Alert.alert("Error", "Could not mark your reward as redeemed.");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  if (!authUser) {
    return (
      <Text style={styles.emptyText}>Please sign in to view your rewards.</Text>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#FF8C00"]}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Rewards</Text>
      </View>
      {(() => {
        // Sort: bought first (most recent at top), then redeemed (most recent at top)
        const sortedRewards = [...customerRewards].sort((a, b) => {
          // 1. Status: bought before redeemed
          if (a.status === b.status) {
            // 2. Most recent first (by claimed_at for bought, redeemed_at for redeemed)
            const aDate = new Date(
              a.status === "bought" ? a.claimed_at : a.redeemed_at
            );
            const bDate = new Date(
              b.status === "bought" ? b.claimed_at : b.redeemed_at
            );
            return bDate - aDate;
          }
          return a.status === "bought" ? -1 : 1;
        });
        return sortedRewards.map((cr) => (
          <View key={cr.id} style={styles.card}>
            {/* 1) IMAGE */}
            <Image
              source={{ uri: cr.reward.image_url }}
              style={styles.cardImage}
            />

            {/* 2) Info column */}
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{cr.reward.title}</Text>

              <View style={styles.cardMeta}>
                <Text style={styles.cardBusiness}>{cr.business.name}</Text>
                {cr.status === "bought" && (
                  <Text style={styles.cardSubtitle}>
                    Bought at {formatTimeTZ(cr.claimed_at)}
                  </Text>
                )}
                {cr.status === "redeemed" && (
                  <Text style={styles.cardSubtitle}>
                    Redeemed at {formatTimeTZ(cr.redeemed_at)}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.lastRow}>
              <Text style={styles.cardDate}>
                {formatDateTZ(
                  cr.status === "bought" ? cr.claimed_at : cr.redeemed_at
                )}
              </Text>

              {cr.status === "bought" ? (
                <TouchableOpacity
                  style={styles.redeemButton}
                  onPress={() => redeem(cr)}
                >
                  <Text style={styles.redeemButtonText}>Redeem</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.greyCode}>
                  <Text style={styles.cardCode}>{cr.reward_code.code}</Text>
                </View>
              )}
            </View>
          </View>
        ));
      })()}
      {!customerRewards.length && (
        <Text style={styles.emptyText}>No rewards yet.</Text>
      )}

      {/* Redemption Code Modal */}
      <Modal
        animationType="none"
        transparent
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
              {modalPayload.image && (
                <Image
                  source={{ uri: modalPayload.image }}
                  style={styles.rewardImage1}
                />
              )}
            </View>

            <Text style={styles.rewardTitle1}>{modalPayload.title}</Text>
            <Text style={styles.modalTitle1}>Your Redemption Code</Text>
            <Text style={styles.rewardTitle1}>{modalPayload.code}</Text>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  cardImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  cardInfo: {
    flex: 1,
    // width: '90%',
    marginHorizontal: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  cardDate: {
    fontSize: 12,
    color: "#666",
    paddingBottom: 15,
    textAlign: "right",
  },
  cardMeta: {
    marginTop: 4,
  },
  cardBusiness: {
    fontSize: 14,
    color: "#444",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  lastRow: {
    width: 110,
    alignItems: "flex-end",
    // backgroundColor: 'green',
  },
  redeemButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    // marginHorizontal: 20,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF8C00",
  },
  redeemButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
  },
  greyCode: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cardCode: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333",
  },
  centeredView1: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalView1: {
    width: "75%",
    height: "55%",
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
  modalTitle1: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 1,
    color: "#333",
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
  unavailableButtonText1: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#888",
    fontSize: 14,
  },
});
