// SimpleSidebar.js
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SimpleSidebar = ({ visible, onClose, navigation }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sidebar}>
          <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#FFffff" />

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="menu" size={28} color="#333" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>ZAWADII</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <View style={styles.menuContainer}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  navigation.navigate('Settings');
                }}
              >
                <Ionicons name="settings-outline" size={24} color="#333" />
                <Text style={styles.menuItemText}>Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  navigation.navigate('PointsHistoryScreen');
                }}
              >
                <MaterialIcons name="list" size={24} color="#333" />
                <Text style={styles.menuItemText}>Points History</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.logItem}
                onPress={() => {
                  onClose();
                  navigation.navigate('Auth', {screen: 'Authentication'}); // handle sign out logic
                }}
              >
                <Feather name="log-out" size={24} color="#FF3B30"  style={{ transform: [{ rotateY: '180deg' }] }}/>
                <Text style={[styles.menuItemText, styles.signOutText]}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  sidebar: {
    width: width * 0.75,
    height: height,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFffff',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  menuContainer: {
    paddingVertical: 20,
    width: '100%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
    flex: 1,
  },
  signOutText: {
    color: '#FF3B30',
  },
});

export default SimpleSidebar;
