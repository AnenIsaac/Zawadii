import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  ScrollView,
  Linking
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';


const WelcomeModal = ({ visible, onClose, navigation }) => {
    
  const handleSocialMedia = (platform) => {
    // You would replace these URLs with actual social media links
    switch(platform) {
      case 'instagram':
        Linking.openURL('https://instagram.com/burger53');
        break;
      case 'tiktok':
        Linking.openURL('https://tiktok.com/@burger53');
        break;
      case 'whatsapp':
        Linking.openURL('https://wa.me/yourphonenumber');
        break;
    }
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle" size={28} color="#888" />
          </TouchableOpacity>
          
          <Image 
            source={require('../../assets/burger-friends.jpg')} 
            style={styles.headerImage} 
            resizeMode="cover"
          />
          
          <View style={styles.textContainer}>
            <Text style={styles.welcomeTitle}>Karibu! Welcome to the Burger 53 family!</Text>
            <Text style={styles.welcomeText}>
              We started in 2015 with a simple goal: to bring the best, freshest burgers to Dar es Salaam. Now with locations in Mlimani City and Mikocheni, our passion for quality remains unchanged. Our goal is to ensure you enjoy every delicious bite and get rewarded for your loyalty. Start earning points today and experience the taste of Burger 53!
            </Text>
          </View>
          
          <View style={styles.socialContainer}>
            <TouchableOpacity onPress={() => handleSocialMedia('instagram')}>
              <Ionicons name="logo-instagram" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSocialMedia('tiktok')}>
              <Ionicons name="logo-tiktok" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSocialMedia('whatsapp')}>
              <Ionicons name="logo-whatsapp" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const InfoScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(true);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Your main home screen content would go here */}
      <ScrollView style={styles.content}>
        <Text style={styles.pageTitle}>Burger 53</Text>
        <Text style={styles.subTitle}>Home of the best burgers in Dar es Salaam</Text>
        
        {/* Example content */}
        <View style={styles.menuPreview}>
          <Text style={styles.menuTitle}>Popular Items</Text>
          {/* Menu items would go here */}
        </View>
      </ScrollView>
      
      <WelcomeModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)}
        navigation={navigation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  menuPreview: {
    marginTop: 20,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 10,
    backgroundColor: 'white',
    borderRadius: 15,
  },
  headerImage: {
    width: '100%',
    height: 200,
  },
  textContainer: {
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
    textAlign: 'center',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 20,
    paddingTop: 10,
    gap: 30,
  }
});

export default InfoScreen;