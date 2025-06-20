import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  SectionList,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabaseClient';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [activeLetterIndex, setActiveLetterIndex] = useState(0);
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [recentBusinesses, setRecentBusinesses] = useState([]);
  const sectionListRef = useRef(null);
  const windowHeight = Dimensions.get('window').height;

  // Fetch all businesses from Supabase
  useEffect(() => {
    const fetchBusinesses = async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, location_description, logo_url')
        .order('name', { ascending: true });
      if (!error && data) {
        setAllBusinesses(data);
        setFilteredRestaurants(groupBusinesses(data));
        // For demo, set recent to first 4
        setRecentBusinesses(data.slice(0, 4));
      }
    };
    fetchBusinesses();
  }, []);

  // Group businesses alphabetically
  const groupBusinesses = (businesses) => {
    const grouped = ALPHABET.map(letter => ({
      title: letter,
      data: businesses.filter(biz => biz.name.charAt(0).toUpperCase() === letter)
    })).filter(section => section.data.length > 0);
    return grouped;
  };

  // Filter businesses based on search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRestaurants(groupBusinesses(allBusinesses));
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allBusinesses.filter(biz =>
        biz.name.toLowerCase().includes(query) ||
        (biz.location_description && biz.location_description.toLowerCase().includes(query))
      );
      setFilteredRestaurants(groupBusinesses(filtered));
    }
  }, [searchQuery, allBusinesses]);

  // Initialize filtered restaurants on component mount
  useEffect(() => {
    setFilteredRestaurants(groupBusinesses(allBusinesses));
  }, [allBusinesses]);

  // Scroll to section when alphabet letter is pressed
  const scrollToSection = (index) => {
    if (filteredRestaurants.length > 0 && index < filteredRestaurants.length) {
      sectionListRef.current?.scrollToLocation({
        sectionIndex: index,
        itemIndex: 0,
        animated: true,
        viewOffset: 20
      });
      setActiveLetterIndex(index);
    }
  };

  // Find current section index based on scroll position
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0 && viewableItems[0].section) {
      const currentLetter = viewableItems[0].section.title;
      const index = filteredRestaurants.findIndex(section => section.title === currentLetter);
      if (index >= 0) {
        setActiveLetterIndex(index);
      }
    }
  }).current;

  // Category item for horizontal scroll
  const CategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryItem}
      onPress={() => navigation.navigate('SpecificRestaurantScreen', { businessId: item.id })}
    >
      <View style={styles.categoryImageContainer}>
        <Image 
          source={item.image}
          style={styles.categoryImage}
          // defaultSource={require('../assets/default.png')}
        />
      </View>
      <Text style={styles.categoryName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Restaurant item for vertical list
  const renderRestaurantItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.restaurantItem}
      onPress={() => navigation.navigate('SpecificRestaurantScreen', { businessId: item.id })}
    >
      <View style={styles.restaurantImageContainer}>
        <Image 
          source={item.logo_url ? { uri: item.logo_url } : require('../../assets/logo.png')}
          style={styles.restaurantImage}
        />
      </View>
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <Text style={styles.restaurantAddress}>{item.location_description}</Text>
      </View>
    </TouchableOpacity>
  );

  // Section header for alphabetical sections
  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  // Limit to 4 most recent
  const recentRestaurants = recentBusinesses.slice(0, 4);

  return (
    <SafeAreaView style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#A0A0A0" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#A0A0A0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Recent (Most Visited)
      <View style={styles.topSection}>
        <Text style={styles.sectionTitle}>Recently Visited</Text>
        <FlatList
          data={recentRestaurants}
          horizontal
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.recentCard}>
              <Image source={{ uri: item.logo }} style={styles.recentImage} />
              <Text style={styles.recentName}>{item.name}</Text>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
          style={styles.recentList}
        />
      </View> */}

      {/* All restaurants */}
      <View style={{ flex: 1 }}>
        <SectionList
          ref={sectionListRef}
          sections={filteredRestaurants}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          renderItem={renderRestaurantItem}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sectionListContent}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 50
          }}
        />

        {/* Alphabetical index */}
        <View style={styles.alphaIndexContainer}>
          {ALPHABET.map((letter, index) => (
            <TouchableOpacity
              key={letter}
              onPress={() => scrollToSection(index)}
              style={styles.letterContainer}
            >
              <Text 
                style={[
                  styles.indexLetter,
                  activeLetterIndex === index && styles.activeIndexLetter
                ]}
              >
                {letter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333333',
  },
  topSection: {
    paddingTop: 10,
    paddingBottom: 5,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 16,
    marginVertical: 8,
  },
  recentList: {
    paddingLeft: 10,
    minHeight: 110,
  },
  recentCard: {
    width: 80,
    alignItems: 'center',
    marginRight: 12,
  },
  recentImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eee',
  },
  recentName: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  allSection: {
    flex: 1,
    marginTop: 0,
  },
  sectionListContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F8F8F8',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  restaurantItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  restaurantImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#EEEEEE',
    overflow: 'hidden',
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  restaurantAddress: {
    fontSize: 12,
    color: '#777777',
    marginTop: 2,
  },
  alphaIndexContainer: {
    position: 'absolute',
    right: 0,
    top: 100, // adjust as needed
    bottom: 0,
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  letterContainer: {
    height: 18,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexLetter: {
    fontSize: 12,
    color: '#777777',
  },
  activeIndexLetter: {
    fontSize: 12,
    color: '#FF8C00',
    fontWeight: 'bold',
  },
  alphaIndexLetter: {
    fontSize: 12,
    color: '#FF8C00',
    paddingVertical: 2,
  },
});

export default SearchScreen;