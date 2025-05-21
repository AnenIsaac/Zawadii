
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PageIndicator from "../../components/PageIndicator";

const { width } = Dimensions.get('window');

const OnboardingStep3 = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo Header */}
      <View style={styles.header}>
        <Image 
          source={require('../../assets/thelogo.png')} 
          style={styles.logoImage} 
          resizeMode="contain"
        />
      </View>
      
      {/* Main Content */}
      <View style={styles.contentContainer}>
        <Image 
          source={require('../../assets/screen4.png')} 
          style={styles.illustrationImage} 
          resizeMode="contain"
        />
        
        {/* Text Content */}
        <View style={styles.textContent}>
          <Text style={styles.title}>
          Unlock Discounts & Freebies You’d Never Expect
          </Text>
          <Text style={styles.subtitle}>
          Use your points for real rewards exclusive to Zawadii users.
Let’s Get Started!
          </Text>
        </View>
      </View>
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.skipContainer}
          onPress={() => navigation.navigate("OnboardingStep1")}
        >
          <Text style={styles.skipText}>Back</Text>
        </TouchableOpacity>
        
        <PageIndicator current={3} total={3} />
        
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => navigation.navigate("Authentication")}
        >
          <Text style={styles.nextText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60, // Increased from 40 to move logo lower
    alignItems: 'center',
  },
  logoImage: {
    width: 160,
    height: 60,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationImage: {
    width: width * 0.8,
    height: width * 0.6,
    marginBottom: 40,
  },
  textContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 45, // Increased from 30 to move buttons inward from edges
    paddingVertical: 30, // Increased from 20 to create more space
    marginBottom: 20, // Added to bring the bottom nav higher up from the bottom
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  skipContainer: {
    // Added a full container to ensure the touchable area is large enough
    paddingVertical: 10,
    paddingHorizontal: 20,
    // This ensures the text is fully visible and has enough touch area
    minWidth: 80,
  },
  skipText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'left', // Ensure the text is aligned to the left
  },
  nextButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    minWidth: 80,
  },
  nextText: {
    fontSize: 16,
    color: '#FF8C00',
    fontWeight: '500',
    textAlign: 'right', // Ensure the text is aligned to the right
  },
});

export default OnboardingStep3;
