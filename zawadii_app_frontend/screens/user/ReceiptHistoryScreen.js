// screens/user/ReceiptHistoryScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../supabaseClient'; // Adjust path as necessary
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const ReceiptHistoryScreen = ({ navigation }) => {
  const [receipts, setReceipts] = useState([]);
  const [unverifiedReceipts, setUnverifiedReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [rescanLoading, setRescanLoading] = useState(false);

  // --- timezone helpers ---
  // Use the UTC time from the database, but display in local time zone
  const formatTimeFromUTC = (isoString) => {
    if (!isoString) return '';
    const dt = new Date(isoString);
    return dt.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const formatDateFromUTC = (isoString) => {
    if (!isoString) return '';
    const dt = new Date(isoString);
    return dt.toLocaleDateString();
  };
  // Format date and time in local timezone for verified receipts
  const formatDateTZ = (isoString) => {
    if (!isoString) return '';
    const dt = new Date(isoString);
    return dt.toLocaleDateString();
  };
  const formatTimeTZ = (isoString) => {
    if (!isoString) return '';
    const dt = new Date(isoString);
    return dt.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error.message);
        Alert.alert('Error', 'Could not fetch user session.');
        return;
      }
      if (user) {
        setUserId(user.id);
      } else {
        Alert.alert('Not Logged In', 'You need to be logged in to see receipt history.');
        // navigation.goBack(); // Or navigate to login
      }
    };
    fetchUser();
  }, []);

  const fetchReceipts = useCallback(async (currentUserId) => {
    if (!currentUserId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    setLoading(true);
    try {
      // Fetch businesses for mapping
      const { data: businesses, error: businessesError } = await supabase
        .from('businesses')
        .select('tin, name');
      if (businessesError) throw businessesError;
      const businessTinMap = businesses.reduce((map, business) => {
        if (business.tin) map[business.tin] = business.name;
        return map;
      }, {});
      // Fetch verified receipts
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('customer_id', currentUserId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const enrichedReceipts = data.map(receipt => ({
        ...receipt,
        business_name: businessTinMap[receipt.tin_num] || 'Unknown Business',
        isUnverified: false,
      }));
      setReceipts(enrichedReceipts);
      // Fetch unverified receipts
      const { data: unver, error: unverError } = await supabase
        .from('unverified_receipts')
        .select('*')
        .eq('customer_id', currentUserId)
        .order('created_at', { ascending: false });
      if (!unverError && unver) {
        setUnverifiedReceipts(unver.map(r => ({ ...r, isUnverified: true })));
      } else {
        setUnverifiedReceipts([]);
      }
    } catch (error) {
      console.error('--- Error caught in fetchReceipts ---');
      // Attempt to log the full error object structure if possible
      try {
        console.error('Logged error object (JSON.stringify):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      } catch (e) {
        console.error('Could not stringify the error object directly, logging properties individually.');
      }
      console.error('error.message:', error.message);
      console.error('error.name:', error.name);
      // Log Supabase specific fields if they exist
      if (error.code) console.error('error.code:', error.code);
      if (error.details) console.error('error.details:', error.details);
      if (error.hint) console.error('error.hint:', error.hint);
      if (error.stack) console.error('error.stack:', error.stack);
      console.error('--- End of error details ---');

      Alert.alert(
        'Error Fetching Receipts',
        'Could not load your receipt history. ' + (error.message || 'An unknown error occurred.'),
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Use useFocusEffect to refresh data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchReceipts(userId);
      }
    }, [userId, fetchReceipts])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (userId) {
      fetchReceipts(userId);
    } else {
      setRefreshing(false); // Stop refreshing if no userId
    }
  }, [userId, fetchReceipts]);

  // Helper to rescan an unverified receipt
  const handleRescan = async (scanned_url) => {
    setRescanLoading(true);
    try {
      const apiUrl = `https://scraper.zawadii.app/api/scrape-receipt/?url=${encodeURIComponent(scanned_url)}`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Could not fetch receipt data.');
      const receiptData = await response.json();
      const tin = receiptData?.company_info?.tin || null;
      if (!tin) {
        Alert.alert('Error', 'Could not extract TIN from the receipt.');
        setRescanLoading(false);
        return;
      }
      setRescanLoading(false);
      navigation.navigate('ValidTRAReceipt', { receiptData, tin, scannedUrl: scanned_url });
    } catch (e) {
      setRescanLoading(false);
      Alert.alert('Error', 'Failed to rescan receipt. Please try again.');
    }
  };

  const renderReceiptItem = ({ item }) => {
    if (item.isUnverified) {
      // Unverified receipt card styled like verified, but with orange border and no points
      return (
        <View style={styles.unverifiedReceiptItem}>
          <View style={styles.receiptInfo}>
            <Text style={styles.unverifiedTitle}>Unverfied Receipt</Text>
            {/* Show scanned_url as subtitle, and receipt_no if available */}
            {item.receipt_no && <Text style={styles.receiptDetail}>Receipt No: {item.receipt_no}</Text>}
            {/* <Text style={styles.unverifiedUrl} numberOfLines={1}>{item.scanned_url}</Text> */}
            <Text style={styles.unverifiedDate}>{formatDateFromUTC(item.created_at)} {formatTimeFromUTC(item.created_at)}</Text>
          </View>
          <TouchableOpacity
            style={styles.rescanButton}
            onPress={() => handleRescan(item.scanned_url)}
          >
            <Text style={styles.rescanButtonText}>Rescan</Text>
          </TouchableOpacity>
        </View>
      );
    }
    // Verified receipt card
    return (
      <TouchableOpacity 
        style={styles.receiptItem}
        onPress={() => navigation.navigate('ReceiptDetailScreen', {
          json: item.json,
          points: item.points,
          business_name: item.business_name,
          created_at: item.created_at
        })}
      >
        <View style={styles.receiptInfo}>
          <Text style={styles.businessName}>{item.business_name}</Text>
          <Text style={styles.receiptDetail}>Amount: {item.total_incl_tax.toLocaleString()}</Text>
          {item.points !== undefined && <Text style={styles.receiptDetail}>Points: {item.points}</Text>}
        </View>
        <Text style={styles.receiptDate}>{formatDateTZ(item.created_at)} {formatTimeTZ(item.created_at)}</Text>
      </TouchableOpacity>
    );
  };

  if (loading && receipts.length === 0 && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading receipts...</Text>
      </View>
    );
  }
  
  if (!userId && !loading) {
     return (
      <View style={styles.centered}>
        <Text>Please log in to view your receipt history.</Text>
      </View>
    );
  }

  if ((receipts.length === 0 && unverifiedReceipts.length === 0) && !loading) {
    return (
      <View style={styles.centered}>
        <Text>No receipts found.</Text>
        <TouchableOpacity onPress={onRefresh} style={{marginTop: 16, padding: 10, backgroundColor: '#FFA500', borderRadius: 8}}>
          <Text style={{color: '#fff', fontWeight: 'bold'}}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {rescanLoading && (
        <View style={styles.rescanLoadingOverlay}>
          <ActivityIndicator size="large" color="#FFA500" />
          <Text style={{ color: '#FFA500', marginTop: 10, fontWeight: 'bold' }}>Loading receipt...</Text>
        </View>
      )}
      <FlatList
        data={[...unverifiedReceipts, ...receipts]}
        renderItem={renderReceiptItem}
        keyExtractor={(item) => (item.id ? item.id.toString() : item.scanned_url)}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    paddingVertical: 10,
  },
  receiptItem: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  unverifiedReceiptItem: {
    backgroundColor: '#FFF7E6',
    borderColor: '#FFA500',
    borderWidth: 1,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  receiptInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  receiptDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  receiptDate: {
    fontSize: 12,
    color: '#888',
  },
  unverifiedTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFA500',
  },
  unverifiedUrl: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    maxWidth: 180,
  },
  unverifiedDate: {
    fontSize: 12,
    color: '#FFA500',
    marginTop: 4,
  },
  rescanButton: {
    backgroundColor: '#FFA500',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rescanButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  rescanLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.85)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    backgroundColor: '#f5f5f5',
  },
  refreshButton: {
    padding: 6,
    borderRadius: 20,
  },
});

export default ReceiptHistoryScreen;
