import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, Platform } from 'react-native';

// Helper to display N/A for undefined or 'n/a' values from receipt
const displayValue = (value, prefix = '', suffix = '') => {
  if (value && typeof value === 'string' && value.toLowerCase() !== 'n/a') {
    return `${prefix}${value}${suffix}`;
  }
  if (typeof value === 'number' && !isNaN(value)) {
    return `${prefix}${value}${suffix}`;
  }
  return 'N/A';
};

const ReceiptDetailScreen = ({ route }) => {
  // The receipt JSON is passed as route.params.json
  const { json: receiptData, points, business_name, created_at } = route.params || {};

  if (!receiptData || !receiptData.totals) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invalid receipt data provided.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.receiptContainer}>
        {/* Logo */}
        <Image source={require('../../assets/thelogo.png')} style={styles.logo} resizeMode="contain" />

        <Text style={styles.sectionTitle}>*** DUMMY RECEIPT ***</Text>

        {/* Business Information */}
        <View style={styles.section}>
          <Text style={styles.businessName}>{business_name || receiptData.company_info?.name || 'Business Name N/A'}</Text>
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
          {receiptData.totals?.tax_rate_a && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TAX RATE A ({receiptData.totals.tax_rate_a}%):</Text>
              <Text style={styles.totalValue}></Text>
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
        <View style={styles.pointsCard}>
          <Text style={styles.pointsText}>Points: {points ?? 'N/A'}</Text>
        </View>
        <View style={styles.pointsCard}>
          <Text style={styles.infoText}>Date: {created_at ? new Date(created_at).toLocaleString() : 'N/A'}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  receiptContainer: {
    marginHorizontal: 10,
    marginVertical: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  logo: {
    width: '70%',
    height: 60,
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
    flex: 3,
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
  pointsCard: {
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
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
  },
  infoText: {
    color: '#555',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ReceiptDetailScreen;
