import React from 'react';
import { View, Text, SafeAreaView, StyleSheet, Image, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';

const PointsHistoryScreen = ({ navigation }) => {
  const transactions = [
    {
      id: '1',
      merchantName: 'Chicken Pizza',
      source: 'From Luigi\'s Pizzeria',
      points: 50,
      status: 'earned',
      date: '17 Sep 2023',
      time: '10:34 AM',
      transactionId: '9549253174520',
      logo: require('../assets/luigis-pizza.jpg'),
    },
    {
      id: '2',
      merchantName: 'From PastaBar',
      source: '',
      points: 40,
      status: 'earned',
      date: '16 Sep 2023',
      time: '18:08 PM',
      transactionId: '6857463421',
      logo: require('../assets/pastabar.jpg'),
    },
    {
      id: '3',
      merchantName: 'From Shawarma 27',
      source: '',
      points: 100,
      status: 'earned',
      date: '16 Sep 2023',
      time: '11:24 AM',
      transactionId: '2839045841',
      logo: require('../assets/shawarma27.jpg'),
    },
    {
      id: '4',
      merchantName: 'Burger 53',
      source: '',
      points: 0,
      status: 'rejected',
      date: '15 Sep 2023',
      time: '10:11 AM',
      transactionId: '0978754216',
      logo: require('../assets/burger53.jpg'),
    },
    {
      id: '5',
      merchantName: 'Iced Latte',
      source: 'From Starbucks Coffee',
      points: 20,
      status: 'earned',
      date: '14 Sep 2023',
      time: '18:59 PM',
      transactionId: '7652309784',
      logo: require('../assets/starbucks.jpg'),
    },
    {
      id: '6',
      merchantName: 'Burger King',
      source: 'From Starbucks Coffee',
      points: 30,
      status: 'redeemed',
      date: '13 Sep 2023',
      time: '10:24 AM',
      transactionId: '9854782911',
      logo: require('../assets/burgerking.jpg'),
    },
    {
      id: '7',
      merchantName: 'Big Boss',
      source: '',
      points: 0,
      status: '',
      date: '12 Sep 2023',
      time: '',
      transactionId: '',
      logo: require('../assets/bigboss.jpg'),
    },
  ];

  // Function to get status color and label
  const getStatusStyle = (status) => {
    switch (status) {
      case 'earned':
        return { color: '#4CAF50', label: 'earned', backgroundColor: '#E8F5E9' };
      case 'redeemed':
        return { color: '#9E9E9E', label: 'redeemed', backgroundColor: '#F5F5F5' };
      case 'rejected':
        return { color: '#F44336', label: 'rejected', backgroundColor: '#FFEBEE' };
      default:
        return { color: '#9E9E9E', label: '', backgroundColor: 'transparent' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}
        onPress={() => navigation.navigate('RewardsScreen')}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>POINTS HISTORY</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {/* Transaction List */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {transactions.map((transaction) => {
          const statusStyle = getStatusStyle(transaction.status);
          
          return (
            <View key={transaction.id} style={styles.transactionCard}>
              {/* Logo */}
              <Image 
                source={transaction.logo}
                style={styles.logo}
               
              />
              
              {/* Transaction Details */}
              <View style={styles.detailsContainer}>
                <Text style={styles.merchantName}>{transaction.merchantName}</Text>
                {transaction.source ? (
                  <Text style={styles.sourceText}>{transaction.source}</Text>
                ) : null}
                <Text style={styles.transactionIdText}>Transaction ID: {transaction.transactionId}</Text>
              </View>
              
              {/* Points and Date */}
              <View style={styles.rightContainer}>
                <Text style={styles.pointsText}>
                  {transaction.points} {transaction.points === 1 ? 'point' : 'points'}
                </Text>
                
                {transaction.status && (
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                    <Text style={[styles.statusText, { color: statusStyle.color }]}>
                      {statusStyle.label}
                    </Text>
                  </View>
                )}
                
                <Text style={styles.dateText}>{transaction.date}</Text>
                {transaction.time && <Text style={styles.timeText}>{transaction.time}</Text>}
              </View>
            </View>
          );
        })}
      </ScrollView>
      
      {/* Tab Bar */}
      <BottomNav />
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3ef',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f3ef',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    marginTop: 20,
    // marginBottom: 17,

  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  merchantName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  sourceText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  transactionIdText: {
    fontSize: 11,
    color: '#999',
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  pointsText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 10,
    color: '#666',
  },
  timeText: {
    fontSize: 10,
    color: '#666',
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
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    flex: 1,
  },
  centerTabItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default PointsHistoryScreen;