import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabaseClient'; // Assuming your supabase client is here

// Function to parse amount strings like "21,000.00" into a number
const parseAmount = (amountStr) => {
  if (typeof amountStr === 'number') return amountStr;
  if (typeof amountStr === 'string') {
    return parseFloat(amountStr.replace(/,/g, ''));
  }
  return 0;
};

const ValidTRAReceiptScreen = ({ route, navigation }) => {
  const { receiptData, tin, amountSpent, scannedUrl } = route.params || {};
  const [isLoading, setIsLoading] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [pointsToAward, setPointsToAward] = useState(0);
  const [businessId, setBusinessId] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        Alert.alert("Error", "You must be logged in to save a receipt.");
        navigation.goBack();
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (tin && receiptData && amountSpent) { // Ensure amountSpent is also available
      const fetchDetailsAndCalculatePoints = async () => {
        setIsLoading(true);
        let businessNameDisplay = `Business (TIN: ${tin})`;
        let fetchedBusinessId = null;
        let calculatedPoints = 0;

        try {
          // 1. Fetch business details (ID and Name)
          const { data: business, error: businessError } = await supabase
            .from('businesses')
            .select('id, name') // Only need id and name for display and saving interaction
            .eq('tin', tin)
            .single();

          if (businessError && businessError.code !== 'PGRST116') {
            console.error('Error fetching business by TIN:', businessError);
            Alert.alert('Error', 'Could not verify business details.');
            // businessNameDisplay and fetchedBusinessId remain default/null
          } else if (business) {
            businessNameDisplay = business.name || `Business (TIN: ${tin})`;
            fetchedBusinessId = business.id;
          }
          setBusinessName(businessNameDisplay);
          setBusinessId(fetchedBusinessId);

          // 2. Fetch money_points_ratio from zawadii_settings
          // Assuming 'money_points_ratio' is the correct column name.
          // And assuming there's a single global setting row or the first one is applicable.
          const { data: settings, error: settingsError } = await supabase
            .from('zawadii_settings')
            .select('money_points_ratio') // Using money_points_ratio
            .limit(1) // Fetches the first row
            .single(); // Assumes one relevant settings row or that it's okay to use the first

          if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116 means no row found
            console.error('Error fetching Zawadii settings:', settingsError);
            Alert.alert('Configuration Error', 'Could not fetch points calculation settings. Points cannot be awarded.');
            // calculatedPoints remains 0
          } else if (settings && typeof settings.money_points_ratio === 'number' && settings.money_points_ratio > 0) {
            const globalConversionRate = settings.money_points_ratio;
            const parsedAmount = parseAmount(amountSpent); // amountSpent is total_incl_tax
            calculatedPoints = Math.floor(parsedAmount / globalConversionRate);
          } else {
            console.warn('money_points_ratio not found, invalid, or zero in Zawadii settings. Points will be 0.');
            Alert.alert('Configuration Error', 'Points calculation ratio is not set up correctly or is zero. Points cannot be awarded.');
            // calculatedPoints remains 0
          }
        } catch (error) {
          console.error('Error fetching details or calculating points:', error);
          Alert.alert('Error', 'An unexpected error occurred while fetching data.');
          // calculatedPoints remains 0
        } finally {
          setPointsToAward(calculatedPoints);
          setIsLoading(false);
        }
      };
      fetchDetailsAndCalculatePoints();
    }
  }, [tin, receiptData, amountSpent, supabase]); // Added supabase to dependencies

  if (!receiptData || !tin || !amountSpent) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invalid receipt data provided.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleConfirmAndSave = async () => {
    if (!userId) {
      Alert.alert("Error", "User not identified. Please log in again.");
      return;
    }
    if (!businessId) {
      Alert.alert("Business Not Registered", "This business doesn\'t work with us at the moment or is not fully registered for points.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Insert into customer_business_interactions
      const interactionDetails = {
        customer_id: userId,
        business_id: businessId,
        interaction_type: 'purchase_receipt_scan',
        amount_spent: parseAmount(receiptData.totals.total_incl_of_tax),
        points_awarded: pointsToAward,
        phone_number: receiptData.customer_info?.mobile !== 'n/a' ? receiptData.customer_info.mobile : null,
        name: receiptData.customer_info?.name !== 'n/a' ? receiptData.customer_info.name : null,
        optional_note: `Scanned TRA Receipt: ${receiptData.receipt_info.receipt_no}`,
      };
      const { data: interaction, error: interactionError } = await supabase
        .from('customer_business_interactions')
        .insert(interactionDetails)
        .select()
        .single();

      if (interactionError) throw interactionError;

      // 2. Insert into receipts
      const receiptDetails = {
        interaction_id: interaction.id,
        customer_id: userId,
        receipt_no: receiptData.receipt_info.receipt_no,
        z_number: receiptData.receipt_info.z_number,
        date: receiptData.receipt_info.date,
        time: receiptData.receipt_info.time,
        total_excl_tax: parseAmount(receiptData.totals.total_excl_of_tax),
        total_tax: parseAmount(receiptData.totals.total_tax),
        total_incl_tax: parseAmount(receiptData.totals.total_incl_of_tax),
        verification_code: receiptData.verification?.code,
        source_url: scannedUrl,
      };
      const { data: dbReceipt, error: receiptError } = await supabase
        .from('receipts')
        .insert(receiptDetails)
        .select()
        .single();

      if (receiptError) throw receiptError;

      // 3. Insert into receipt_items
      if (receiptData.items && receiptData.items.length > 0) {
        const itemsToInsert = receiptData.items.map(item => ({
          receipt_id: dbReceipt.id,
          description: item.description,
          quantity: parseAmount(item.quantity), // Assuming quantity can be decimal
          amount: parseAmount(item.amount),
        }));
        const { error: itemsError } = await supabase.from('receipt_items').insert(itemsToInsert);
        if (itemsError) throw itemsError;
      }

      // 4. Update customer_points
      if (pointsToAward > 0) {
        const { data: currentPoints, error: pointsFetchError } = await supabase
          .from('customer_points')
          .select('id, points')
          .eq('customer_id', userId)
          .eq('business_id', businessId)
          .single();

        if (pointsFetchError && pointsFetchError.code !== 'PGRST116') throw pointsFetchError;

        if (currentPoints) {
          const { error: updateError } = await supabase
            .from('customer_points')
            .update({ points: (currentPoints.points || 0) + pointsToAward, last_updated: new Date().toISOString() })
            .eq('id', currentPoints.id);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from('customer_points')
            .insert({
              customer_id: userId,
              business_id: businessId,
              points: pointsToAward,
              last_updated: new Date().toISOString(),
            });
          if (insertError) throw insertError;
        }
      }

      Alert.alert('Success!', `Receipt saved and ${pointsToAward} points awarded from ${businessName}.`);
      // navigation.popToTop(); // Or navigate to a specific success/home screen
      // navigation.navigate('HomeScreen', { refresh: true });

      // Navigate to HomeScreen within MainTabs navigator
      // Assumes 'MainTabs' is the route name for your tab navigator in the parent AppStack
      navigation.navigate('Main', {
        screen: 'HomeScreen',
        params: { refresh: true },
      });


    } catch (error) {
      console.error('Error saving receipt and awarding points:', error);
      Alert.alert('Save Error', `An error occurred: ${error.message || 'Could not save receipt.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <Text style={styles.itemTextLeft}>{item.description} (Qty: {item.quantity || 1})</Text>
      <Text style={styles.itemTextRight}>{item.amount}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Confirm Receipt Details</Text>

        {isLoading && <ActivityIndicator size="large" color="#FFA500" style={{marginVertical: 20}} />}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{businessName || `TIN: ${tin}`}</Text>
          <Text style={styles.detailText}>Receipt No: {receiptData.receipt_info?.receipt_no}</Text>
          <Text style={styles.detailText}>Date: {receiptData.receipt_info?.date} Time: {receiptData.receipt_info?.time}</Text>
          <Text style={styles.detailText}>Verification Code: {receiptData.verification?.code}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items</Text>
          {receiptData.items && receiptData.items.length > 0 ? (
            receiptData.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemTextLeft}>{item.description} (Qty: {item.quantity || 1})</Text>
                <Text style={styles.itemTextRight}>{item.amount}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.detailText}>No items listed.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Totals</Text>
          <Text style={styles.detailText}>Total Excl. Tax: {receiptData.totals?.total_excl_of_tax}</Text>
          <Text style={styles.detailText}>Total Tax: {receiptData.totals?.total_tax}</Text>
          <Text style={styles.totalAmountText}>Total Incl. Tax: {receiptData.totals?.total_incl_of_tax}</Text>
        </View>
        
        {pointsToAward > 0 && businessId && (
          <View style={styles.card}>
            <Text style={styles.pointsText}>You will earn: {pointsToAward} points</Text>
          </View>
        )}
         {!businessId && !isLoading && (
            <View style={styles.card}>
                <Text style={styles.errorText}>This business is not registered for points with Zawadii.</Text>
            </View>
        )}


        <TouchableOpacity 
          style={[styles.button, styles.confirmButton, (isLoading || !businessId) && styles.disabledButton]} 
          onPress={handleConfirmAndSave}
          disabled={isLoading || !businessId}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirm & Save</Text>}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={handleCancel}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    width: '100%',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFA500', // Orange color for titles
    marginBottom: 10,
  },
  detailText: {
    fontSize: 15,
    color: '#555',
    marginBottom: 5,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemTextLeft: {
    fontSize: 14,
    color: '#333',
    flex: 3,
  },
  itemTextRight: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  totalAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#008000', // Green for total amount
    marginTop: 8,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745', // Green color for points
    textAlign: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    marginTop: 10,
    flexDirection: 'row',
  },
  confirmButton: {
    backgroundColor: '#FFA500', // Orange
  },
  cancelButton: {
    backgroundColor: '#6c757d', // Grey
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  }
});

export default ValidTRAReceiptScreen;