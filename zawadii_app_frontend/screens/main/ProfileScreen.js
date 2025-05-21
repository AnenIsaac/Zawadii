import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomNav from '../../components/BottomNav';

const ProfileScreen = ({ navigation }) => {
  // User profile data state
  const [userData, setUserData] = useState({
    name: 'Anen Isaac',
    phone: '07038860354',
    bio: '',
    gender: 'Male',
    email: 'anenisoaacvet@gmail.com',
    language: 'English',
  });

  // State to keep track of which field is being edited
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');

  // Function to start editing a field
  const startEditing = (field, value) => {
    setEditingField(field);
    setTempValue(value);
  };

  // Function to save changes
  const saveChanges = (field) => {
    setUserData({ ...userData, [field]: tempValue });
    setEditingField(null);
  };

  // Handle text input submission
  const handleSubmit = (field) => {
    saveChanges(field);
  };

  // Render each setting item
  const renderSettingItem = (icon, label, value, field) => {
    return (
      <View style={styles.settingItem}>
        <View style={styles.settingIconContainer}>
          {icon}
        </View>
        <View style={styles.settingContent}>
          {editingField === field ? (
            <TextInput
              style={styles.input}
              value={tempValue}
              onChangeText={setTempValue}
              autoFocus
              onSubmitEditing={() => handleSubmit(field)}
              onBlur={() => handleSubmit(field)}
            />
          ) : (
            <>
              <Text style={styles.settingLabel}>{label}</Text>
              <Text style={styles.settingValue}>{value}</Text>
            </>
          )}
        </View>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => startEditing(field, value)}
        >
          <MaterialIcons name="edit" size={20} color="#0047AB" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView>
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
                <Image 
                  source={require('../../assets/thelogo.png')} 
                  style={styles.logoImage} 
                  resizeMode="contain"
                />
            </View>
          </View>

          {/* Profile Photo Section */}
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>

           <Ionicons name="person-outline" size={40} color="#fff" />
              {/* <Image 
                source={require('../assets/default-profile.png')} 
                style={styles.profileImage}
                defaultSource={require('../assets/default-profile.png')}
              /> */}
            </View>
            {/* <Text style={styles.profileEmail}>{userData.name}</Text> */}
            <Text style={styles.profileEmail}>{userData.email}</Text>
          </View>

          {/* Settings Section */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Settings for Profile</Text>

            {renderSettingItem(
              <Ionicons name="person-outline" size={22} color="#555" />,
              'Anen Isaac',
              userData.name,
              'name'
            )}

            {renderSettingItem(
              <Ionicons name="call-outline" size={22} color="#555" />,
              'Phone',
              userData.phone,
              'phone'
            )}

            {renderSettingItem(
              <MaterialIcons name="description" size={22} color="#555" />,
              'Bio',
              userData.bio || 'Add a bio',
              'bio'
            )}

            {renderSettingItem(
              <Ionicons name="person-outline" size={22} color="#555" />,
              'Gender',
              userData.gender,
              'gender'
            )}

            {renderSettingItem(
              <MaterialCommunityIcons name="email-outline" size={22} color="#555" />,
              'Email',
              userData.email,
              'email'
            )}

            {renderSettingItem(
              <FontAwesome5 name="language" size={20} color="#555" />,
              'Language',
              userData.language,
              'language'
            )}
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <BottomNav/>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginRight: 30,
     paddingTop: 30,
  },
  logoImage: {
    width: 160,
    height: 60,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0047AB',
  },
  logoAccent: {
    width: 15,
    height: 8,
    backgroundColor: '#8B4513',
    borderRadius: 4,
    position: 'absolute',
    top: 0,
    right: 55,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  profileEmail: {
    fontSize: 14,
    color: '#777',
  },
  settingsSection: {
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#0047AB',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    paddingLeft: 10,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  editButton: {
    padding: 5,
  },
  input: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#0047AB',
    paddingVertical: 5,
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
    height: 60,
  },
  navButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerNavButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  squareButton: {
    width: 50,
    height: 50,
    backgroundColor: '#0047AB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen;