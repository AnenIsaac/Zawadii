import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Image, Platform } from 'react-native'; // Added Image, Platform
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
  const [globalMoneyPointsRatio, setGlobalMoneyPointsRatio] = useState(null); // Added

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

  // Added useEffect to fetch global money_points_ratio
  useEffect(() => {
    const fetchGlobalSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('zawadii_settings')
          .select('money_points_ratio')
          .limit(1) // Assuming there's one row or we take the first
          .single(); // Assuming it's a single row of settings

        if (error) {
          console.error('Error fetching Zawadii settings:', error.message);
          Alert.alert('Error', 'Could not load app settings for points calculation. ' + error.message);
          setGlobalMoneyPointsRatio(0); // Default or error state
        } else if (data) {
          setGlobalMoneyPointsRatio(data.money_points_ratio);
        } else {
          console.log('No Zawadii settings found.');
          Alert.alert('Info', 'App settings for points not found. Points calculation may not work.');
          setGlobalMoneyPointsRatio(0); // Default or error state
        }
      } catch (e) {
        console.error('Exception fetching Zawadii settings:', e);
        Alert.alert('Error', 'An unexpected error occurred while fetching app settings.');
        setGlobalMoneyPointsRatio(0); // Default or error state
      }
    };
    fetchGlobalSettings();
  }, []);

  useEffect(() => {
    // Ensure globalMoneyPointsRatio is loaded before proceeding
    if (tin && receiptData && receiptData.totals && globalMoneyPointsRatio !== null) { // Ensure receiptData.totals exists
      const fetchDetailsAndCalculatePoints = async () => {
        setIsLoading(true);
        try {
          const { data: business, error: businessError } = await supabase
            .from('businesses')
            .select('id, name, points_conversion') // MODIFIED: Added points_conversion
            .eq('tin', tin)
            .single();

          if (businessError) {
            console.error('Error fetching business details:', businessError.message);
            Alert.alert('Error', 'Could not fetch business details. ' + businessError.message);
            setPointsToAward(0);
            setBusinessName('N/A');
            setBusinessId(null);
            return;
          }

          if (!business) {
            console.log('Business not found for TIN:', tin);
            setBusinessName('Business Not Registered');
            setBusinessId(null);
            setPointsToAward(0);
            return;
          }

          setBusinessName(business.name);
          setBusinessId(business.id);

          // MODIFIED: Use total_incl_tax from receiptData for amount spent
          const numericAmountSpent = parseAmount(receiptData.totals.total_incl_of_tax);
          const businessPointsConversion = parseFloat(business.points_conversion);
          const globalConversionRate = parseFloat(globalMoneyPointsRatio);

          if (business.points_conversion !== null && !isNaN(businessPointsConversion) && businessPointsConversion > 0 &&
              globalMoneyPointsRatio !== null && !isNaN(globalConversionRate) && globalConversionRate > 0 &&
              numericAmountSpent > 0) {
            
            // MODIFIED: globalConversionRate is now used directly as a ratio
            const calculatedPoints = numericAmountSpent * (businessPointsConversion / 100) * globalConversionRate;
            setPointsToAward(Math.floor(calculatedPoints));
            console.log(`Points calculation: ${numericAmountSpent} * (${businessPointsConversion}/100) * ${globalConversionRate} = ${calculatedPoints}`);
          } else {
            setPointsToAward(0);
            console.log('No points awarded. Business points conversion, global ratio, or amount spent might be zero or invalid.', 
              { numericAmountSpent, businessPointsConversion, globalConversionRate, businessRaw: business.points_conversion, globalRaw: globalMoneyPointsRatio });
          }

        } catch (error) {
          console.error('Failed to fetch business details or calculate points:', error);
          Alert.alert('Error', 'An unexpected error occurred while fetching details.');
          setPointsToAward(0);
          setBusinessName('Error');
          setBusinessId(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetailsAndCalculatePoints();
    } else if (globalMoneyPointsRatio === null && tin && receiptData && receiptData.totals && amountSpent) { // Ensure receiptData.totals exists
      // Optional: Indicate that settings are still loading if other data is present
      console.log("Waiting for global settings to calculate points...");
      // Consider setting isLoading to true or showing a message to the user
    }
  }, [tin, receiptData, globalMoneyPointsRatio, supabase]); // MODIFIED: amountSpent removed from deps if not directly used, receiptData is the source of truth for amount

  if (!receiptData || !tin || !receiptData.totals) { // MODIFIED: check receiptData.totals
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
        tin_num: tin, 
        z_number: receiptData.receipt_info.z_number,
        date: receiptData.receipt_info.date,
        time: receiptData.receipt_info.time,
        total_excl_tax: parseAmount(receiptData.totals.total_excl_of_tax),
        total_tax: parseAmount(receiptData.totals.total_tax),
        total_incl_tax: parseAmount(receiptData.totals.total_incl_of_tax),
        points: pointsToAward,
        verification_code: receiptData.verification?.code,
        source_url: scannedUrl,
      };
      const { data: dbReceipt, error: receiptError } = await supabase
        .from('receipts')
        .insert(receiptDetails)
        .select()
        .single();

      if (receiptError) throw receiptError;

      // 3. Update or insert into customer_points
      try {
        // Check if customer_points entry exists
        const { data: existingPoints, error: pointsFetchError } = await supabase
          .from('customer_points')
          .select('id, points')
          .eq('customer_id', userId)
          .eq('business_id', businessId)
          .single();

        if (pointsFetchError && pointsFetchError.code !== 'PGRST116') { // PGRST116: No rows found
          throw pointsFetchError;
        }

        if (existingPoints) {
          // Update existing points
          const newTotal = (existingPoints.points || 0) + pointsToAward;
          const { error: updateError } = await supabase
            .from('customer_points')
            .update({ points: newTotal, last_updated: new Date().toISOString() })
            .eq('id', existingPoints.id);
          if (updateError) throw updateError;
        } else {
          // Insert new points row
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
      } catch (err) {
        console.error('Error updating customer points:', err);
        Alert.alert('Points Error', 'There was a problem updating your points. Please try again.');
      }

      Alert.alert('Success!', `Receipt saved and ${pointsToAward} points awarded from ${businessName}.`);
      // navigation.popToTop(); // Or navigate to a specific success/home screen

      // Navigate to HomeScreen within MainTabs navigator
      // navigation.navigate('Main', {
      //   screen: 'HomeScreen',
      //   params: { refresh: true },
      // });

    // Navigate to SpecificRestaurantScreen and pass the businessId
    navigation.navigate('SpecificRestaurantScreen', { businessId });

    } catch (error) {
      console.error('Error saving receipt and awarding points:', error);
      // Check for Supabase unique constraint violation (code 23505)
      // and if the message indicates it's related to the receipt number.
      if (error && error.code === '23505' && error.message && error.message.toLowerCase().includes('receipt_no')) {
        Alert.alert('Receipt Already Scanned', 'It looks like you have already scanned this receipt. It cannot be submitted again.');
      } else {
        Alert.alert('Save Error', `An error occurred: ${error.message || 'Could not save receipt.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  // Helper to display N/A for undefined or 'n/a' values from receipt
  const displayValue = (value, prefix = '', suffix = '') => {
    if (value && value.toLowerCase() !== 'n/a') {
      return `${prefix}${value}${suffix}`;
    }
    return 'N/A';
  };

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.receiptContainer}>
        {/* Logo */}
        <Image source={require('../assets/thelogo.png')} style={styles.logo} resizeMode="contain" />

        <Text style={styles.sectionTitle}>*** DUMMY RECEIPT ***</Text>

        {/* Business Information */}
        <View style={styles.section}>
          {/* MODIFIED: Prioritize businessName from state (fetched via TIN) */}
          <Text style={styles.businessName}>{businessName || receiptData.company_info?.name || 'Business Name N/A'}</Text>
          {receiptData.company_info?.address && <Text style={styles.detailTextLeft}>{receiptData.company_info.address}</Text>}
          <Text style={styles.detailTextLeft}>MOBILE: {displayValue(receiptData.company_info?.mobile)}</Text>
          <Text style={styles.detailTextLeft}>TIN: {displayValue(receiptData.company_info?.tin)}</Text>
          <Text style={styles.detailTextLeft}>VRN: {displayValue(receiptData.company_info?.vrn)}</Text>
          <Text style={styles.detailTextLeft}>SERIAL NO: {displayValue(receiptData.receipt_info?.serial_no)}</Text>
          <Text style={styles.detailTextLeft}>UIN: {displayValue(receiptData.receipt_info?.uin)}</Text>
          {receiptData.company_info?.tax_office && <Text style={styles.detailTextLeft}>TAX OFFICE: {receiptData.company_info.tax_office}</Text>}
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.detailTextLeft}>CUSTOMER NAME: {displayValue(receiptData.customer_info?.name)}</Text>
          <Text style={styles.detailTextLeft}>CUSTOMER ID TYPE: {displayValue(receiptData.customer_info?.id_type)}</Text>
          <Text style={styles.detailTextLeft}>CUSTOMER ID: {displayValue(receiptData.customer_info?.id_number)}</Text>
          <Text style={styles.detailTextLeft}>CUSTOMER MOBILE: {displayValue(receiptData.customer_info?.mobile)}</Text>
        </View>

        {/* Receipt Core Details */}
        <View style={styles.section}>
          <Text style={styles.detailTextLeft}>RECEIPT NO: {displayValue(receiptData.receipt_info?.receipt_no)}</Text>
          <Text style={styles.detailTextLeft}>Z NUMBER: {displayValue(receiptData.receipt_info?.z_number)}</Text>
          <Text style={styles.detailTextLeft}>RECEIPT DATE: {displayValue(receiptData.receipt_info?.date)}</Text>
          <Text style={styles.detailTextLeft}>RECEIPT TIME: {displayValue(receiptData.receipt_info?.time)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Purchased Items</Text>
        
        {/* Items Table */}
        <View style={styles.itemsTable}>
          <View style={styles.itemsHeaderRow}>
            <Text style={[styles.itemsHeaderText, styles.itemsDescriptionCol]}>Description</Text>
            <Text style={[styles.itemsHeaderText, styles.itemsQtyCol]}>Qty</Text>
            <Text style={[styles.itemsHeaderText, styles.itemsAmountCol]}>Amount</Text>
          </View>
          {receiptData.items && receiptData.items.length > 0 ? (
            receiptData.items.map((item, index) => (
              <View key={index} style={styles.itemsDataRow}>
                <Text style={[styles.itemsCellText, styles.itemsDescriptionCol]}>{item.description || 'N/A'}</Text>
                <Text style={[styles.itemsCellText, styles.itemsQtyCol, styles.textCenter]}>{item.quantity || 1}</Text>
                <Text style={[styles.itemsCellText, styles.itemsAmountCol, styles.textRight]}>{item.amount || '0.00'}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.detailTextCenter}>No items listed.</Text>
          )}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL EXCL OF TAX:</Text>
            <Text style={styles.totalValue}>{receiptData.totals?.total_excl_of_tax || '0.00'}</Text>
          </View>
          {/* Assuming tax_rate_a is available or can be inferred. Otherwise, stick to total_tax */}
          {receiptData.totals?.tax_rate_a && (
             <View style={styles.totalRow}>
               <Text style={styles.totalLabel}>TAX RATE A ({receiptData.totals.tax_rate_a}%):</Text>
               <Text style={styles.totalValue}>{/* Calculate if needed or display if available */}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL TAX:</Text>
            <Text style={styles.totalValue}>{receiptData.totals?.total_tax || '0.00'}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={[styles.totalLabel, styles.grandTotalLabel]}>TOTAL INCL OF TAX:</Text>
            <Text style={[styles.totalValue, styles.grandTotalValue]}>{receiptData.totals?.total_incl_tax || '0.00'}</Text>
          </View>
        </View>

        {/* Verification Code */}
        <View style={styles.section}>
          <Text style={styles.verificationCodeHeader}>RECEIPT VERIFICATION CODE</Text>
          <Text style={styles.verificationCode}>{receiptData.verification?.code || 'N/A'}</Text>
        </View>

        <Text style={styles.sectionTitle}>*** END OF LEGAL RECEIPT ***</Text>

        {/* Points and Business Registration Info */}
        {isLoading && <ActivityIndicator size="large" color="#FFA500" style={{marginVertical: 20}} />}
        
        {!isLoading && businessId && pointsToAward > 0 && (
          <View style={styles.pointsCard}>
            <Text style={styles.pointsText}>You will earn: {pointsToAward} points</Text>
          </View>
        )}
        {!isLoading && !businessId && (
            <View style={styles.pointsCard}>
                <Text style={styles.errorText}>This business is not registered for points with Zawadii.</Text>
            </View>
        )}
         {!isLoading && businessId && pointsToAward === 0 && (
            <View style={styles.pointsCard}>
                <Text style={styles.infoText}>No points will be awarded for this receipt based on current settings.</Text>
            </View>
        )}


        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff', // White background for the whole screen
  },
  receiptContainer: {
    marginHorizontal: 10,
    marginVertical: 15,
    padding: 15,
    backgroundColor: '#fff', // Receipt paper color
    borderWidth: 1,
    borderColor: '#ccc', // Light border for the receipt
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', // Monospaced font
  },
  logo: {
    width: '70%',
    height: 60, // Adjust as needed
    alignSelf: 'center',
    marginBottom: 20,

  },
  sectionTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: 15,
    fontSize: 14,
    color: '#000',
  },
  section: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#000',
  },
  detailTextLeft: {
    fontSize: 12,
    color: '#333',
    marginBottom: 2,
    textAlign: 'left',
  },
  detailTextCenter: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginVertical: 10,
  },
  itemsTable: {
    marginVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#000',
  },
  itemsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  itemsHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  itemsDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemsCellText: {
    fontSize: 12,
    color: '#333',
  },
  itemsDescriptionCol: {
    flex: 3, // Takes more space
    textAlign: 'left',
  },
  itemsQtyCol: {
    flex: 1,
    textAlign: 'center',
  },
  itemsAmountCol: {
    flex: 1.5,
    textAlign: 'right',
  },
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
  totalsSection: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#000',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  totalLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'left',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'right',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 5,
    marginTop: 5,
  },
  grandTotalLabel: {
    fontWeight: 'bold',
  },
  grandTotalValue: {
    fontWeight: 'bold',
  },
  verificationCodeHeader: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#000',
  },
  verificationCode: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '#000',
  },
  pointsCard: { // Replaces the old card style for points
    padding: 10,
    marginVertical: 15,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  errorText: { // For business not registered
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
  },
  infoText: { // For no points awarded
    color: '#555',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
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
    backgroundColor: '#FFA500',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  }
});

export default ValidTRAReceiptScreen;