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
import BottomNav from '../../components/BottomNav';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [activeLetterIndex, setActiveLetterIndex] = useState(0);
  const sectionListRef = useRef(null);
  const windowHeight = Dimensions.get('window').height;

  // Popular categories for horizontal scrolling
  const popularCategories = [
    { id: '1', name: 'Burger 53' },
    { id: '2', name: 'Shawarma 27' },
    { id: '3', name: 'Shishi Food' },
    { id: '4', name: 'Savvy Plates'},
    { id: '5', name: 'Pizzeria' },
    { id: '6', name: 'Healthy Bowl' },
  ];

  // Restaurant data organized alphabetically
  const generateAlphabeticalRestaurants = () => {
    // Sample restaurant data
    const allRestaurants = [
      { name: 'Akemi Revolving Restaurant', address: '21st Floor, Golden Jubilee Tower, Oha Street' },
      { name: 'Afternoon Delight', address: '45 Main Street, Downtown' },
      { name: 'Azzurro Italian', address: '27 Marina Avenue' },
      { name: 'Bangkok Kitchen', address: '12 Eastwood Mall' },
      { name: 'Blue Lagoon', address: '100 Beach Road' },
      { name: 'Bistro Gardens', address: '78 Park Lane' },
      { name: 'Cafe Milano', address: '56 Coffee Street' },
      { name: 'Curry House', address: '34 Spice Road' },
      { name: 'Canton Palace', address: '88 China Town' },
      { name: 'Deli Express', address: '23 Fast Lane' },
      { name: 'Dolce Vita', address: '90 Sweet Street' },
      { name: 'Dragon Wok', address: '45 Eastern Avenue' },
      { name: 'Eat Fresh', address: '67 Veggies Road' },
      { name: 'El Mariachi', address: '123 Mexico Street' },
      { name: 'Fisherman\'s Wharf', address: '32 Harbor Road' },
      { name: 'French Connection', address: '76 Paris Avenue' },
      { name: 'Ginger & Spice', address: '89 Flavor Street' },
      { name: 'Golden Dragon', address: '56 Lucky Road' },
      { name: 'Hungry Bear', address: '21 Forest Avenue' },
      { name: 'Hibachi Grill', address: '44 Flame Street' },
      { name: 'Ice Cream Palace', address: '33 Frozen Lane' },
      { name: 'Island Treats', address: '22 Paradise Road' },
      { name: 'Jade Garden', address: '11 Green Street' },
      { name: 'Java Joe\'s', address: '55 Coffee Bean Road' },
      { name: 'King\'s Table', address: '99 Royal Avenue' },
      { name: 'Kebab House', address: '77 Grill Street' },
      { name: 'Lemon Tree', address: '66 Citrus Lane' },
      { name: 'La Trattoria', address: '44 Pasta Road' },
      { name: 'Mango Grove', address: '33 Tropical Avenue' },
      { name: 'Midnight Diner', address: '24/7 Night Street' },
      { name: 'Noodle Bar', address: '43 Asian Alley' },
      { name: 'New York Deli', address: '87 Manhattan Road' },
      { name: 'Ocean Fresh', address: '22 Sea View' },
      { name: 'Olive Garden', address: '55 Mediterranean Avenue' },
      { name: 'Pepper House', address: '66 Spicy Lane' },
      { name: 'Pasta Paradise', address: '77 Italian Street' },
      { name: 'Quickbite', address: '33 Fast Food Lane' },
      { name: 'Quaint Cafe', address: '22 Quiet Corner' },
      { name: 'Rustic Table', address: '44 Country Road' },
      { name: 'Riverside Grill', address: '55 Water Street' },
      { name: 'Sushi Express', address: '66 Japan Avenue' },
      { name: 'Spice Garden', address: '77 India Street' },
      { name: 'Taco Town', address: '88 Mexico Road' },
      { name: 'Thai Spice', address: '99 Bangkok Lane' },
      { name: 'Urban Bistro', address: '11 Downtown Avenue' },
      { name: 'Umami House', address: '22 Flavor Street' },
      { name: 'Vineyard Restaurant', address: '33 Wine Road' },
      { name: 'Village Kitchen', address: '44 Rural Lane' },
      { name: 'Wasabi Sushi', address: '55 Japan Street' },
      { name: 'Wok & Roll', address: '66 China Road' },
      { name: 'Xpress Diner', address: '77 Quick Lane' },
      { name: 'Xotic Flavors', address: '88 Unique Street' },
      { name: 'Yummy Corner', address: '99 Tasty Avenue' },
      { name: 'Yogurt Stop', address: '11 Dessert Road' },
      { name: 'Zen Garden', address: '22 Peace Street' },
      { name: 'Zesty Bites', address: '33 Lemon Lane' },
    ];

    // Group restaurants alphabetically
    const groupedRestaurants = ALPHABET.map(letter => {
      return {
        title: letter,
        data: allRestaurants.filter(restaurant => 
          restaurant.name.charAt(0).toUpperCase() === letter
        )
      };
    }).filter(section => section.data.length > 0);

    return groupedRestaurants;
  };

  const restaurantSections = generateAlphabeticalRestaurants();

  // Filter restaurants based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRestaurants(restaurantSections);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = restaurantSections
        .map(section => {
          return {
            title: section.title,
            data: section.data.filter(restaurant => 
              restaurant.name.toLowerCase().includes(query) || 
              restaurant.address.toLowerCase().includes(query)
            )
          };
        })
        .filter(section => section.data.length > 0);
      
      setFilteredRestaurants(filtered);
    }
  }, [searchQuery]);

  // Initialize filtered restaurants on component mount
  useEffect(() => {
    setFilteredRestaurants(restaurantSections);
  }, []);

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
      onPress={() => navigation.navigate('RestaurantDetails', { restaurantId: item.id })}
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
      onPress={() => navigation.navigate('RestaurantDetails', { restaurantName: item.name })}
    >
      <View style={styles.restaurantImageContainer}>
        <Image 
          // source={require('../assets/default-restaurant.png')}
          style={styles.restaurantImage}
          // defaultSource={require('../assets/default-restaurant.png')}
        />
      </View>
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <Text style={styles.restaurantAddress}>{item.address}</Text>
      </View>
    </TouchableOpacity>
  );

  // Section header for alphabetical sections
  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

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

      {/* Categories horizontal scroll */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={popularCategories}
          renderItem={({ item }) => <CategoryItem item={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Main content with alphabetical sections */}
      <View style={styles.mainContent}>
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
        <View style={styles.alphabetIndex}>
          {filteredRestaurants.map((section, index) => (
            <TouchableOpacity
              key={section.title}
              onPress={() => scrollToSection(index)}
              style={styles.letterContainer}
            >
              <Text 
                style={[
                  styles.indexLetter,
                  activeLetterIndex === index && styles.activeIndexLetter
                ]}
              >
                {section.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom Navigation */}
      <BottomNav/>
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
  categoriesContainer: {
    height: 110,
    paddingVertical: 8,
    backgroundColor: '#F8F8F8',
  },
  categoriesList: {
    paddingHorizontal: 12,
  },
  categoryItem: {
    width: 80,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  categoryImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryName: {
    fontSize: 12,
    color: '#333333',
    textAlign: 'center',
    marginTop: 4,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
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
  alphabetIndex: {
    width: 24,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
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
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
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

export default SearchScreen;