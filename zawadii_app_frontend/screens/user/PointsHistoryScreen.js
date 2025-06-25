import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Image, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { supabase } from '../../supabaseClient';
import { Ionicons } from '@expo/vector-icons';

export default function PointsHistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [interactions, setInteractions] = useState([]);

  // --- timezone helpers ---
  const toTZDate = (isoString, offsetHours = 3) => {
    const dt = new Date(isoString);
    dt.setHours(dt.getHours() + offsetHours);
    return dt;
  };
  const formatTimeTZ = (isoString) => {
    return toTZDate(isoString, 3).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const formatDateTZ = (isoString) => {
    return toTZDate(isoString, 3).toLocaleDateString();
  };

  // Function to get status color and label
  // const getStatusStyle = (status) => {
  //   switch (status) {
  //     case 'earned':
  //       return { color: '#4CAF50', label: 'earned', backgroundColor: '#E8F5E9' };
  //     case 'redeemed':
  //       return { color: '#9E9E9E', label: 'redeemed', backgroundColor: '#F5F5F5' };
  //     case 'rejected':
  //       return { color: '#F44336', label: 'rejected', backgroundColor: '#FFEBEE' };
  //     default:
  //       return { color: '#9E9E9E', label: '', backgroundColor: 'transparent' };
  //   }
  // };

  useEffect(() => {
    async function loadHistory() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setAuthUser(user);

      const { data, error } = await supabase
        .from('customer_business_interactions')
        .select(`
          id,
          interaction_type,
          points_awarded,
          created_at,
          business:businesses!inner(name, logo_url)
        `)
        .order('created_at', { ascending: false })
        .eq('customer_id', user.id);

      if (error) {
        console.error('Error loading interactions:', error);
      } else {
        setInteractions(data);
      }
      setLoading(false);
    };

    loadHistory();
  }, []);

  // human‑readable mapping for interaction_type
  const humanizeType = (type) => {
    switch (type) {
      case 'purchase_receipt_scan':
        return 'Receipt scanned';
      case 'dashboard_entry':
        return 'Dashboard entry';
      // add more mappings as needed
      default:
        return type.replace(/_/g, ' ');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#FF8C00" style={{ flex:1, justifyContent:'center', alignItems: "center" }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>POINTS HISTORY</Text>
      </View> */}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {interactions.map((tx) => {
          {/* const statusStyle = getStatusStyle(interactions.status); */}
          const logo = tx.business.logo_url
          {/* console.log('logo url:', tx.business.logo_url); */}
          
          return (
            <View key={tx.id} style={styles.transactionCard}>
              {/* Logo */}
              <Image 
                source={{ uri:logo }}
                style={styles.logo}
                resizeMode="cover"
                onError={e => console.warn('Image load failed:', e.nativeEvent.error)}
              />
              
              {/* Transaction Details */}
              <View style={styles.detailsContainer}>
                <Text style={styles.merchantName}>{tx.business.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: '#E8F5E9' }]}>
                  <Text style={[styles.statusText, { color: '#4CAF50' }]}>
                    {humanizeType(tx.interaction_type)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.rightContainer}>
                <Text style={styles.pointsText}>
                  {tx.points_awarded} {tx.points_awarded === 1 ? 'point' : 'points'}
                </Text>
                <Text style={styles.dateText}>{formatDateTZ(tx.created_at)}</Text>
                <Text style={styles.timeText}>{formatTimeTZ(tx.created_at)}</Text>
              </View>
            </View>
          );
        })}

        {!interactions.length && (
          <Text style={styles.emptyText}>No history available.</Text>
        )}
      </ScrollView>      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3ef',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
    // marginTop: 20,
    // marginBottom: 17,
    
  },
  detailsContainer: {
    flex: 1,
    // justifyContent: 'center',
  },
  merchantName: {
    // width: '95%',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
    // backgroundColor: 'red',
    paddingLeft: 5,
    // textAlign: 'center',
    // marginBottom: 2,
  },
  // sourceText: {
    //   fontSize: 13,
  //   color: '#666',
  //   marginBottom: 2,
  // },
  transactionIdText: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: 80,
    alignItems: 'flex-end',
    justifyContent: 'center',
    // paddingLeft: 8,
  },
  pointsText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  statusBadge: {
    alignSelf: 'flex-start', // Fit to content width
    flexShrink: 1, // Allow shrinking if needed
    maxWidth: '70%', // Don't exceed 70% of container
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'right',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    justifyContent: 'space-around',
    paddingBottom: 20, // Extra padding for iOS home indicator area
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
    fontSize: 14,
  },
});