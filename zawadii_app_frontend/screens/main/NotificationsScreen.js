import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NotificationsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      
      {/* Notification Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="notifications-outline" size={50} color="#999" style={styles.bellIcon} />
        </View>
        
        <Text style={styles.title}>Woo!</Text>
        <Text style={styles.subtitle}>No Notifications</Text>
      </View>
      
      {/* Bottom Navigation */}
      {/* <BottomNav/> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
  },
  backButton: {
    paddingRight: 15,
    paddingTop: 25,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    paddingLeft: 75,
    paddingTop: 25,

  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  bellIcon: {
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#777',
  },
});

export default NotificationsScreen;