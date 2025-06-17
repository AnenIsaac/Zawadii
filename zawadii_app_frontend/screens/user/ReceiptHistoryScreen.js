// screens/user/ReceiptHistoryScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../supabaseClient'; // Adjust path as necessary
import { useFocusEffect } from '@react-navigation/native';

const ReceiptHistoryScreen = ({ navigation }) => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);

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
      // First, get business details to map tin to business_name
      const { data: businesses, error: businessesError } = await supabase
        .from('businesses')
        .select('tin, name'); // MODIFIED: Select tin and name

      if (businessesError) {
        throw businessesError;
      }

      // MODIFIED: Create a map from tin to name
      const businessTinMap = businesses.reduce((map, business) => {
        if (business.tin) { // Ensure tin is not null or undefined
          map[business.tin] = business.name;
        }
        return map;
      }, {});

      // Then, fetch receipts for the user
      const { data, error } = await supabase
        .from('receipts')
        .select('*') // Assuming tin_num is selected if available in the table
        .eq('customer_id', currentUserId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      
      // MODIFIED: Enrich receipts using tin_num to find business_name
      const enrichedReceipts = data.map(receipt => ({
        ...receipt,
        business_name: businessTinMap[receipt.tin_num] || 'Unknown Business',
      }));

      setReceipts(enrichedReceipts);
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

  const renderReceiptItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.receiptItem}
      onPress={() => Alert.alert(item.business_name, `Amount: ${item.total_incl_tax.toLocaleString()}\nPoints: ${item.points}\nDate: ${new Date(item.created_at).toLocaleDateString()}`)}
    >
      <View style={styles.receiptInfo}>
        <Text style={styles.businessName}>{item.business_name}</Text>
        <Text style={styles.receiptDetail}>Amount: {item.total_incl_tax.toLocaleString()}</Text>
        <Text style={styles.receiptDetail}>Points: {item.points}</Text>
        {/* <Text style={styles.receiptDetail}>Receipt number: {item.receipt_no}</Text> */}
      </View>
      <Text style={styles.receiptDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

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

  if (receipts.length === 0 && !loading) {
    return (
      <View style={styles.centered}>
        <Text>No receipts found.</Text>
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={receipts}
        renderItem={renderReceiptItem}
        keyExtractor={(item) => item.id.toString()}
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
});

export default ReceiptHistoryScreen;
