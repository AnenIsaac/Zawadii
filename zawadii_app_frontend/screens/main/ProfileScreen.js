import React, { useState, useEffect } from 'react';
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons'; // Removed MaterialCommunityIcons as email icon can be from Ionicons
import { supabase } from '../../supabaseClient'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {
  // User profile data state
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    // bio: '', // Removed bio
    gender: '', // Default
    email: '',
    // language: 'English', // Removed language
  });
  const [loading, setLoading] = useState(true);

  // State to keep track of which field is being edited
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');

  // Fetching user profile from Supabase on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        // Get current user’s ID
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw userError || new Error('No user session found');
        }
        const userId = user.id;

        // Querying `customers` table for this user’s row
        const { data, error } = await supabase
          .from('customers')
          .select('full_name, email, phone_number, gender')
          .eq('id', userId)
          .single();

        if (error) {
          throw error;
        }

        // Populating local state
        setUserData({
          name: data.full_name || '',
          phone: data.phone_number || '',
          email: data.email || '',
          gender: data.gender || '',
        });
      } catch (err) {
        console.error('Error loading user profile:', err.message);
        Alert.alert('Error', 'Could not load your profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Function to start editing a field
  const startEditing = (field, value) => {
    setEditingField(field);
    setTempValue(value.trim());
  };

  // Function to save changes to database (for name or phone)
  const saveChanges = async (field) => {
    // If nothing changed, just exit edit mode
    if (tempValue === userData[field]) {
      setEditingField(null);
      return;
    }

    try {
      // Get user ID again
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw userError || new Error('No user session');
      }
      const userId = user.id;

      // Build update payload, trimming whitespace
      const cleanValue = tempValue.trim();
      const updates = {};
      if (field === 'name') updates.full_name = cleanValue;
      else if (field === 'phone') updates.phone_number = cleanValue;
      else if (field === 'gender') updates.gender = cleanValue;
      else return; // Only allow name & phone updates

      const { error: updateError } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', userId);

      if (updateError) throw updateError;

      // Reflect in local state
      setUserData((prev) => ({
        ...prev,
        [field]: cleanValue,
      }));
    } catch (err) {
      console.error('Error saving profile change:', err.message);
      Alert.alert('Error', 'Could not save changes. Please try again.');
    } finally {
      setEditingField(null);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('Logout Error', error.message);
        return;
      }
      await AsyncStorage.removeItem('userToken');
      // Navigate to Auth stack after logout
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }], 
      });
    } catch (e) {
      console.error("Failed to clear user token or sign out", e);
      Alert.alert('Logout Error', 'An error occurred during logout. Please try again.');
    }
  };

  // Handle text input submission
  const handleSubmit = (field) => {
    saveChanges(field);
  };

  // Render each setting item
  // `editable` controls whether the pencil icon appears
  const renderSettingItem = (icon, label, value, field, editable) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIconContainer}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{label}</Text>
        {editingField === field && editable ? (
          field === 'gender' ? (
            <View style={styles.genderOptionsInline}>
              {['Male','Female'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.genderButton,
                    tempValue === option && styles.genderButtonActive
                  ]}
                  onPress={() => setTempValue(option)}
                >
                  <Text style={[styles.genderButtonText, tempValue === option && styles.genderButtonTextActive]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ):(
            <TextInput
              style={styles.input}
              value={tempValue}
              onChangeText={setTempValue}
              autoFocus
              onSubmitEditing={() => handleSubmit(field)}
              onBlur={() => saveChanges(field)} // Save changes on blur as well
            />
          )
        ) : (
          <Text style={styles.settingValue}>{value}</Text>
        )}
      </View>
      {editable && (
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => editingField === field ? saveChanges(field) : startEditing(field, value)}
        >
          <MaterialIcons name={editingField === field ? "done" : "edit"} size={24} color="#FF8C00" />
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8924" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }} // Ensure KeyboardAvoidingView takes full height
      >
        <ScrollView contentContainerStyle={styles.scrollContentContainer}>
          {/* Header */}
          {/* <View style={styles.header}>
            <Text style={styles.headerTitle}>My Profile</Text>
          </View> */}

          {/* Profile Photo Section */}
          <View style={styles.profileSection}>
            {/* <View style={styles.profileImageContainer}>
              <Image 
                source={require('../../assets/happy-man.jpeg')} // Replace with actual profile image if available
                style={styles.profileImage}
              />
              <TouchableOpacity style={styles.cameraIconContainer}>
                <Ionicons name="camera" size={20} color="#fff" />
              </TouchableOpacity>
            </View> */}
            <View style={styles.profileImageContainer}>
              {userData.gender === 'Female' ? (
                <Ionicons name="woman" size={60} color="#FF8C00" />
              ) : userData.gender === 'Male' ? (
                <Ionicons name="man"   size={60} color="#FF8C00" />
              ) : (
                // fallback if no gender set
                <Image 
                  source={require('../../assets/happy-man.jpeg')}
                  style={styles.profileImage}
                />
              )}
            </View>
            <Text style={styles.profileName}>{userData.name}</Text>
            <Text style={styles.profileEmail}>{userData.email}</Text>
          </View>

          {/* Settings Sections */}
          <View style={styles.sectionContainer}>
            {/* Account Settings */}
            <Text style={styles.sectionTitle}>Account Settings</Text>
            {renderSettingItem(<Ionicons name="person-outline" size={24} color="#555" />, 'Name', userData.name, 'name', true)}
            {renderSettingItem(<Ionicons name="call-outline" size={24} color="#555" />, 'Phone', userData.phone, 'phone', true)}
            {renderSettingItem(<Ionicons name="mail-outline" size={24} color="#555" />, 'Email', userData.email, 'email', false)} 
            {renderSettingItem(<Ionicons name="transgender-outline" size={24} color="#555" />, 'Gender', userData.gender, 'gender', true)}

            {/* Security Settings */}
            {/* <Text style={styles.sectionTitle}>Security</Text>
            {renderSettingItem(<Ionicons name="lock-closed-outline" size={24} color="#555" />, 'Change Password', '', 'changePassword', false, () => navigation.navigate('ResetPassword'))} */}

            {/* App Settings - Example */}
            {/* <Text style={styles.sectionTitle}>App Settings</Text> */}
            {/* {renderSettingItem(<Ionicons name="language-outline" size={24} color="#555" />, 'Language', userData.language, 'language', true)} */}
            {/* {renderSettingItem(<Ionicons name="notifications-outline" size={24} color="#555" />, 'Notifications', 'On', 'notifications', true)} */}
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    flex: 1,
    backgroundColor: '#F7F7F7', // Light gray background for a modern feel
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#555',
  },
  scrollContentContainer: {
    paddingBottom: 20, // Add some padding at the bottom
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 12,
    alignItems: 'center',
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
    // backgroundColor: '#E0E0E0',
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
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 10,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingTop: 10,
    marginBottom: 10, // Space between sections
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
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
  genderOptionsInline: {
  flexDirection: 'row',
  marginVertical: 8,
  gap: 10
},
genderButton: {
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderWidth: 1,
  borderColor: '#E0E0E0',
  borderRadius: 8,
},
genderButtonActive: {
  backgroundColor: '#FF8C00',
  borderColor: '#FF8C00',
},
genderButtonText: {
  fontSize: 14,
  color: '#333',
},
genderButtonTextActive: {
  color: '#FFF',
  fontWeight: '600',
},
logoutButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#FF3B30',
  paddingVertical: 12,
  borderRadius: 8,
  marginTop: 20,
  marginHorizontal: 20, // Added horizontal margin
  borderWidth: 1,
  borderColor: '#FF3B30',
},
logoutButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '500',
  marginLeft: 8,
},

  // Removed bottomNav styles as it's handled by MainTabs
});

export default ProfileScreen;