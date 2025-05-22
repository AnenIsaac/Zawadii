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
import { Ionicons, MaterialIcons } from '@expo/vector-icons'; // Removed MaterialCommunityIcons as email icon can be from Ionicons

const ProfileScreen = ({ navigation }) => {
  // User profile data state
  const [userData, setUserData] = useState({
    name: 'Anen Isaac',
    phone: '07038860354',
    // bio: '', // Removed bio
    gender: 'Male',
    email: 'anenisoaacvet@gmail.com',
    // language: 'English', // Removed language
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
          <Text style={styles.settingLabel}>{label}</Text>
          {editingField === field ? (
            <TextInput
              style={styles.input}
              value={tempValue}
              onChangeText={setTempValue}
              autoFocus
              onSubmitEditing={() => handleSubmit(field)}
              onBlur={() => saveChanges(field)} // Save changes on blur as well
            />
          ) : (
            <Text style={styles.settingValue}>{value}</Text>
          )}
        </View>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => editingField === field ? saveChanges(field) : startEditing(field, value)}
        >
          <MaterialIcons name={editingField === field ? "done" : "edit"} size={24} color="#FF8C00" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }} // Ensure KeyboardAvoidingView takes full height
      >
        <ScrollView contentContainerStyle={styles.scrollContentContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Profile</Text>
          </View>

          {/* Profile Photo Section */}
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <Image 
                source={require('../../assets/happy-man.jpeg')} // Replace with actual profile image if available
                style={styles.profileImage}
              />
              <TouchableOpacity style={styles.cameraIconContainer}>
                <Ionicons name="camera" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.profileName}>{userData.name}</Text>
            <Text style={styles.profileEmail}>{userData.email}</Text>
          </View>

          {/* Settings Section */}
          <View style={styles.settingsSection}>
            {renderSettingItem(
              <Ionicons name="person-outline" size={22} color="#555" />,
              'Full Name',
              userData.name,
              'name'
            )}

            {renderSettingItem(
              <Ionicons name="call-outline" size={22} color="#555" />,
              'Phone Number',
              userData.phone,
              'phone'
            )}

            {renderSettingItem(
              <Ionicons name="male-female-outline" size={22} color="#555" />, // Changed icon for gender
              'Gender',
              userData.gender,
              'gender'
            )}

            {renderSettingItem(
              <Ionicons name="mail-outline" size={22} color="#555" />, // Changed icon for email
              'Email Address',
              userData.email,
              'email'
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7', // Light gray background for a modern feel
  },
  scrollContentContainer: {
    paddingBottom: 20, // Add some padding at the bottom
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center', // Center title
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
    marginBottom: 10, // Space before settings section
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50, // Circular image
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative', // For camera icon positioning
    borderWidth: 3,
    borderColor: '#FF8C00',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF8C00',
    padding: 8,
    borderRadius: 20, // Circular background for camera icon
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: '#777',
  },
  settingsSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 10,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingTop: 10, // Add padding at the top of the section
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18, // Increased padding for better spacing
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingItemLast: { // Style for the last item to remove bottom border
    borderBottomWidth: 0,
  },
  settingIconContainer: {
    width: 30, // Slightly reduced width
    alignItems: 'center',
    marginRight: 15, // Space between icon and text
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16, // Slightly larger label
    fontWeight: '500',
    color: '#333',
    marginBottom: 3, // Space between label and value if stacked
  },
  settingValue: {
    fontSize: 15, // Slightly larger value
    color: '#555',
  },
  editButton: {
    padding: 8, // Increased touchable area
  },
  input: {
    fontSize: 15,
    color: '#333',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#FF8C00', // Accent color for input underline
  },
  // Removed bottomNav styles as it's handled by MainTabs
});

export default ProfileScreen;