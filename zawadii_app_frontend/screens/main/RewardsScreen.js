// import React, { useState } from 'react';
// import { 
//   View, 
//   Text, 
//   ScrollView, 
//   TouchableOpacity, 
//   Image,
//   SafeAreaView,
//   Pressable,
//   ImageBackground,
//   StatusBar,
//   StyleSheet, 
//   Modal,
//   Linking
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from "@react-navigation/native";

// export default function RewardsScreen() {
//   const [activeTab, setActiveTab] = useState('rewards'); // 'rewards' or 'deals'
//   const navigation = useNavigation();
  
//   // Dummy data for the restaurant
//   const restaurant = { 
//     name: 'Burger 53',
//     memberSince: '4.2023',
//     points: 1240,
//     pointsTillReward: 760,
//     rewards: 5,
//     deals: 3,
//     socialLinks: ['instagram', 'tiktok', 'whatsapp']
//   };
  
//   // Rewards data
//   const rewardsData = [
//     { id: '1', name: 'Free Chips', points: 20, image: require('../assets/chips2.jpg'), available: true },
//     { id: '2', name: 'Free Soda', points: 10, image: require('../assets/soda2.jpg'), available: true },
//     { id: '3', name: 'Free Burger', points: 50, image: require('../assets/burger2.jpg'), available: false },
//     { id: '4', name: '20% Discount', points: 100, image: require('../assets/discount.jpg'), available: false },
//   ];

//   // Deals data
//   const dealsList = [
//     require('../assets/happy-man.jpeg'),
//     require('../assets/fish-wednesday.jpg'),
//     require('../assets/breakfast-bundle.jpg'),
//   ];
  
//   // Modal states - ALL modal visibility states are defined here
//   const [infoModalVisible, setInfoModalVisible] = useState(false);
//   const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
//   const [redeemConfirmModalVisible, setRedeemConfirmModalVisible] = useState(false);
//   const [redemptionCodeModalVisible, setRedemptionCodeModalVisible] = useState(false);
//   const [dealsModalVisible, setDealsModalVisible] = useState(false);
  
//   // Data states for modals
//   const [selectedReward, setSelectedReward] = useState(null);
//   const [modalType, setModalType] = useState(null); // 'buy' or 'claim'
//   const [selectedDeal, setSelectedDeal] = useState(null);
//   const [redemptionCode, setRedemptionCode] = useState('CQ23SDF232');
  
//   // Handler for when a reward item is pressed
//   const handleRewardPress = (reward) => {
//     setSelectedReward(reward);
//     setModalType(reward.available ? 'claim' : 'buy');
//     setPurchaseModalVisible(true);
//   };

//   // Handler for claim confirmation
//   const handleClaimConfirm = () => {
//     setPurchaseModalVisible(false);
//     setRedeemConfirmModalVisible(true);
//   };

//   // Handler for showing redemption code
//   const handleShowRedemptionCode = () => {
//     setRedeemConfirmModalVisible(false);
//     setRedemptionCodeModalVisible(true);
//   };

//   // Handler for social media links
//   const handleSocialMedia = (platform) => {
//     switch(platform) {
//       case 'instagram':
//         Linking.openURL('https://instagram.com/burger53');
//         break;
//       case 'tiktok':
//         Linking.openURL('https://tiktok.com/@burger53');
//         break;
//       case 'whatsapp':
//         Linking.openURL('https://wa.me/yourphonenumber');
//         break;
//     }
//   };

//   // Welcome/Info Modal Component - Fixed the modalVisible prop issue
//   const WelcomeModal = ({ visible, onClose }) => {
//     return (
//       <Modal
//         animationType="none"
//         transparent={true}
//         visible={visible} // This now correctly receives infoModalVisible value
//         onRequestClose={onClose}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//               <Ionicons name="close-circle" size={28} color="#888" />
//             </TouchableOpacity>
            
//             <Image 
//               source={require('../assets/burger-friends.jpg')} 
//               style={styles.headerImage} 
//               resizeMode="cover"
//             />
            
//             <View style={styles.textContainer}>
//               <Text style={styles.welcomeTitle}>Karibu! Welcome to the Burger 53 family!</Text>
//               <Text style={styles.welcomeText}>
//                 We started in 2015 with a simple goal: to bring the best, freshest burgers to Dar es Salaam. Now with locations in Mlimani City and Mikocheni, our passion for quality remains unchanged. Our goal is to ensure you enjoy every delicious bite and get rewarded for your loyalty. Start earning points today and experience the taste of Burger 53!
//               </Text>
//             </View>
            
//             <View style={styles.socialContainer}>
//               <TouchableOpacity onPress={() => handleSocialMedia('instagram')}>
//                 <Ionicons name="logo-instagram" size={24} color="#000" />
//               </TouchableOpacity>
//               <TouchableOpacity onPress={() => handleSocialMedia('tiktok')}>
//                 <Ionicons name="logo-tiktok" size={24} color="#000" />
//               </TouchableOpacity>
//               <TouchableOpacity onPress={() => handleSocialMedia('whatsapp')}>
//                 <Ionicons name="logo-whatsapp" size={24} color="#000" />
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     );
//   };
  
//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" />
      
//       {/* Background header image */}
//       <ImageBackground 
//         source={require('../assets/background.jpg')}
//         style={styles.headerBackground}
//       >
//         <View style={styles.headerOverlay}>
//           {/* Back button and info button */}
//           <View style={styles.topNavigation}>
//             <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('HomeScreen')}>
//               <Ionicons name="chevron-back" size={24} color="white" />
//             </TouchableOpacity>
//             {/* Info Button */}
//             <TouchableOpacity 
//               style={styles.infoButton} 
//               onPress={() => setInfoModalVisible(true)}
//             >
//               <Ionicons name="information-circle-outline" size={24} color="white" />
//             </TouchableOpacity>
//           </View>
          
//           {/* Gift icon and greeting */}
//           <View style={styles.greetingContainer}>
//             <View style={styles.giftIconContainer}>
//               <Ionicons name="gift-outline" size={24} color="white" />
//             </View>
//             <Text style={styles.greetingText}>Hi, Judy!</Text>
//           </View>
          
//           {/* Restaurant name and member since */}
//           <Text style={styles.restaurantName}>{restaurant.name}</Text>
//           <Text style={styles.memberSinceText}>Member since {restaurant.memberSince}</Text>
          
//           {/* Social media links */}
//           <View style={styles.socialLinksContainer}>
//             {restaurant.socialLinks.map((platform, index) => (
//               <TouchableOpacity 
//                 key={index} 
//                 style={styles.socialButton}
//                 onPress={() => handleSocialMedia(platform)}
//               >
//                 <Ionicons 
//                   name={
//                     platform === 'instagram' ? 'logo-instagram' : 
//                     platform === 'tiktok' ? 'logo-tiktok' : 'logo-whatsapp'
//                   } 
//                   size={18} 
//                   color="white" 
//                 />
//               </TouchableOpacity>
//             ))}
//           </View>
          
//           {/* Rewards and deals count */}
//           <View style={styles.statsContainer}>
//             <View style={styles.statItem}>
//               <Ionicons name="gift-outline" size={20} color="white" />
//               <Text style={styles.statText}>{restaurant.rewards} rewards</Text>
//             </View>
//             <View style={styles.statItem}>
//               <Ionicons name="pricetag-outline" size={20} color="white" />
//               <Text style={styles.statText}>{restaurant.deals} deals</Text>
//             </View>
//           </View>
//         </View>
//       </ImageBackground>
      
//       {/* Points card */}
//       <View style={styles.pointsCardContainer}>
//         <View style={styles.pointsCard}>
//           <View style={styles.pointsRow}>
//             <Text style={styles.pointsValue}>{restaurant.points}pts</Text>
//             <TouchableOpacity style={styles.addPointsButton}>
//               <Ionicons name="add" size={16} color="#FF8C00" />
//               <Text style={styles.addPointsText}>Add points</Text>
//             </TouchableOpacity>
//           </View>
          
//           <Text style={styles.pointsTillRewardText}>
//             {restaurant.pointsTillReward} points till your next rewards
//           </Text>
          
//           {/* Progress Bar */}
//           <View style={styles.progressBarBackground}>
//             <View 
//               style={[
//                 styles.progressBar, 
//                 {width: `${(restaurant.points / (restaurant.points + restaurant.pointsTillReward)) * 100}%`}
//               ]} 
//             />
//           </View>
//         </View>
//       </View>
      
//       {/* Tabs */}
//       <View style={styles.tabsContainer}>
//         <TouchableOpacity 
//           style={[styles.tab, activeTab === 'rewards' && styles.activeTab]}
//           onPress={() => setActiveTab('rewards')}
//         >
//           <Text style={[styles.tabText, activeTab === 'rewards' && styles.activeTabText]}>Rewards</Text>
//         </TouchableOpacity>
//         <TouchableOpacity 
//           style={[styles.tab, activeTab === 'deals' && styles.activeTab]}
//           onPress={() => setActiveTab('deals')}
//         >
//           <Text style={[styles.tabText, activeTab === 'deals' && styles.activeTabText]}>Deals</Text>
//         </TouchableOpacity>
//       </View>
      
//       {/* Scrollable content */}
//       <ScrollView style={styles.scrollContent}>
//         {activeTab === 'rewards' ? (
//           // Rewards list
//           rewardsData.map((reward) => (
//             <View key={reward.id} style={styles.rewardItem}>
//               <Image source={reward.image} style={styles.rewardImage} />
//               <View style={styles.rewardInfo}>
//                 <Text style={styles.rewardName}>{reward.name}</Text>
//                 <Text style={styles.rewardPoints}>{reward.points} pts</Text>
//               </View>
//               <TouchableOpacity 
//                 style={[
//                   styles.actionButton, 
//                   reward.available ? styles.claimButton : styles.buyButton
//                 ]}
//                 onPress={() => handleRewardPress(reward)}
//               >
//                 <Text style={styles.actionButtonText}>
//                   {reward.available ? 'Claim' : 'Buy'}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           ))
//         ) : (
//           // Deals list
//           <ScrollView 
//             style={styles.dealsContainer}
//             showsVerticalScrollIndicator={false}
//           >
//             {dealsList.map((imageSource, index) => (
//               <TouchableOpacity
//                 key={index}
//                 onPress={() => {
//                   setSelectedDeal({
//                     image: imageSource,
//                     title: 'KUKU TUESDAY',
//                     description: 'We bet you love a good deal on a Tuesday\nFor 12,000... Get an extra piece of Kuku... 5 pieces in total!'
//                   });
//                   setDealsModalVisible(true);
//                 }}
//               >
//                 <Image 
//                   source={imageSource}
//                   style={styles.dealImage}
//                   resizeMode="cover"
//                 />
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         )}
        
//         {/* Add some bottom padding for scrolling */}
//         <View style={styles.bottomPadding} />
//       </ScrollView>
      
//       {/* Info Modal */}
//       <WelcomeModal visible={infoModalVisible} onClose={() => setInfoModalVisible(false)} />

//       {/* Purchase/Buy Modal */}
//       <Modal
//         animationType="none"
//         transparent={true}
//         visible={purchaseModalVisible}
//         onRequestClose={() => setPurchaseModalVisible(false)}
//       >
//         <View style={styles.centeredView}>
//           <View style={styles.modalView}>
//             <View style={styles.orangeLine} />
//             <Pressable
//               style={styles.closeButton}
//               onPress={() => setPurchaseModalVisible(false)}
//             >
//               <Text style={styles.closeButtonText}>✕</Text>
//             </Pressable>

//             <Text style={styles.modalTitle}>
//               {modalType === 'buy' ? 'Burger 53 Deals' : 'Burger 53 Rewards'}
//             </Text>

//             <View style={styles.imageContainer}>
//               {selectedReward?.image && (
//                 <Image
//                   source={selectedReward.image}
//                   style={styles.rewardImage}
//                 />
//               )}
//             </View>

//             <Text style={styles.rewardTitle}>{selectedReward?.name}</Text>
//             <Text style={styles.pointsText}>{selectedReward?.points} Points</Text>
//             <Text style={styles.rewardDescription}>
//               {modalType === 'buy'
//                 ? `Unlock this deal on your next visit to\nBurger 53.`
//                 : `Claim your free ${selectedReward?.name?.toLowerCase()} at\nBurger 53.`}
//             </Text>

//             <TouchableOpacity
//               style={styles.actionConfirmButton}
//               onPress={() => {
//                 if (modalType === 'buy') {
//                   // Handle buy action
//                   setPurchaseModalVisible(false);
//                 } else {
//                   // Handle claim action - show redemption confirmation
//                   handleClaimConfirm();
//                 }
//               }}
//             >
//               <Text style={styles.actionConfirmButtonText}>
//                 {modalType === 'buy' ? 'Buy Deal' : 'Claim Reward'}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Redemption Confirmation Modal */}
//       <Modal
//         animationType="none"
//         transparent={true}
//         visible={redeemConfirmModalVisible}
//         onRequestClose={() => setRedeemConfirmModalVisible(false)}
//       >
//         <View style={styles.centeredView}>
//           <View style={styles.modalView}>
//             <View style={styles.orangeLine} />
//             <Pressable
//               style={styles.closeButton}
//               onPress={() => setRedeemConfirmModalVisible(false)}
//             >
//               <Text style={styles.closeButtonText}>✕</Text>
//             </Pressable>

//             <Text style={styles.modalTitle}>Burger 53 Rewards</Text>

//             <View style={styles.imageContainer}>
//               {selectedReward?.image && (
//                 <Image
//                   source={selectedReward.image}
//                   style={styles.rewardImage}
//                 />
//               )}
//             </View>

//             <Text style={styles.rewardTitle}>{selectedReward?.name}</Text>
//             <Text style={styles.claimSuccessText}>Successfully claimed!</Text>
//             <Text style={styles.rewardDescription}>
//               Show this code to the cashier to redeem your reward.
//             </Text>

//             <TouchableOpacity
//               style={styles.actionConfirmButton}
//               onPress={handleShowRedemptionCode}
//             >
//               <Text style={styles.actionConfirmButtonText}>
//                 Show Redemption Code
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Redemption Code Modal */}
//       <Modal
//         animationType="none"
//         transparent={true}
//         visible={redemptionCodeModalVisible}
//         onRequestClose={() => setRedemptionCodeModalVisible(false)}
//       >
//         <View style={styles.centeredView}>
//           <View style={styles.codeModalView}>
//             <Pressable
//               style={styles.closeButton}
//               onPress={() => setRedemptionCodeModalVisible(false)}
//             >
//               <Text style={styles.closeButtonText}>✕</Text>
//             </Pressable>

//             <Text style={styles.codeTitle}>Your Redemption Code</Text>
//             <Text style={styles.redemptionCode}>{redemptionCode}</Text>
            
//             <Text style={styles.codeInstructions}>
//               Present this code to the cashier when placing your order
//             </Text>

//             <TouchableOpacity
//               style={styles.doneButton}
//               onPress={() => setRedemptionCodeModalVisible(false)}
//             >
//               <Text style={styles.doneButtonText}>Done</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Deals Detail Modal */}
//       <Modal
//         animationType="fade"
//         transparent={true}
//         visible={dealsModalVisible}
//         onRequestClose={() => setDealsModalVisible(false)}
//       >
//         <View style={styles.centeredView}>
//           <View style={styles.dealModalView}>
//             <Pressable
//               style={styles.closeButton}
//               onPress={() => setDealsModalVisible(false)}
//             >
//               <Text style={styles.closeButtonText}>✕</Text>
//             </Pressable>

//             {selectedDeal?.image && (
//               <Image
//                 source={selectedDeal.image}
//                 style={styles.dealImageModal}
//                 resizeMode="cover"
//               />
//             )}

//             <Text style={styles.dealTitle}>{selectedDeal?.title}</Text>
//             <Text style={styles.dealDescription}>{selectedDeal?.description}</Text>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }





import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  SafeAreaView,
  Pressable,
  ImageBackground,
  StatusBar,
  Modal,
  Linking,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";

export default function RewardsScreen() {
  const [activeTab, setActiveTab] = useState('rewards'); // 'rewards' or 'deals'
  const navigation = useNavigation();
  
  // Dummy data for the restaurant
  const restaurant = { 
    name: 'Burger 53',
    memberSince: '4.2023',
    points: 1240,
    pointsTillReward: 760,
    rewards: 5,
    deals: 3,
    socialLinks: ['instagram', 'tiktok', 'whatsapp']
  };
  
  // Rewards data
  const rewardsData = [
    { id: '1', name: 'Free Chips', points: 20, image: require('../../assets/chips2.png'), available: true },
    { id: '2', name: 'Free Soda', points: 10, image: require('../../assets/soda2.png'), available: true },
    { id: '3', name: 'Free Burger', points: 50, image: require('../../assets/burger2.jpg'), available: false },
    { id: '4', name: '20% Discount', points: 100, image: require('../../assets/discount.jpg'), available: false },
  ];

  // Deals data
  const dealsList = [
    require('../../assets/happy-man.jpeg'),
    require('../../assets/fish-wednesday.jpg'),
    require('../../assets/breakfast-bundle.jpg'),
  ];
  
  // Modal states - ALL modal visibility states are defined here
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [redeemConfirmModalVisible, setRedeemConfirmModalVisible] = useState(false);
  const [redemptionCodeModalVisible, setRedemptionCodeModalVisible] = useState(false);
  const [dealsModalVisible, setDealsModalVisible] = useState(false);
  
  // Data states for modals
  const [selectedReward, setSelectedReward] = useState(null);
  const [modalType, setModalType] = useState(null); // 'buy' or 'claim'
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [redemptionCode, setRedemptionCode] = useState('CQ23SDF232');
  
  // Handler for when a reward item is pressed
  const handleRewardPress = (reward) => {
    setSelectedReward(reward);
    setModalType(reward.available ? 'claim' : 'buy');
    setPurchaseModalVisible(true);
  };

  // Handler for claim confirmation
  const handleClaimConfirm = () => {
    setPurchaseModalVisible(false);
    setRedeemConfirmModalVisible(true);
  };

  // Handler for showing redemption code
  const handleShowRedemptionCode = () => {
    setRedeemConfirmModalVisible(false);
    setRedemptionCodeModalVisible(true);
  };

  // Handler for social media links
  const handleSocialMedia = (platform) => {
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

  // Welcome/Info Modal Component - Fixed the modalVisible prop issue
  const WelcomeModal = ({ visible, onClose }) => {
    return (
      <Modal
        animationType="none"
        transparent={true}
        visible={visible} // This now correctly receives infoModalVisible value
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
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background header image */}
      <ImageBackground 
        source={require('../../assets/background.jpg')}
        style={styles.headerBackground}
      >
        <View style={styles.headerOverlay}>
          {/* Back button and info button */}
          <View style={styles.topNavigation}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('HomeScreen')}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            {/* Info Button */}
            <TouchableOpacity 
              style={styles.infoButton} 
              onPress={() => setInfoModalVisible(true)}
            >
              <Ionicons name="information-circle-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          {/* Gift icon and greeting */}
          <View style={styles.greetingContainer}>
            <View style={styles.giftIconContainer}>
              <Ionicons name="gift-outline" size={24} color="white" />
            </View>
            <Text style={styles.greetingText}>Hi, Judy!</Text>
          </View>
          
          {/* Restaurant name and member since */}
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.memberSinceText}>Member since {restaurant.memberSince}</Text>
          
          {/* Social media links */}
          <View style={styles.socialLinksContainer}>
            {restaurant.socialLinks.map((platform, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.socialButton}
                onPress={() => handleSocialMedia(platform)}
              >
                <Ionicons 
                  name={
                    platform === 'instagram' ? 'logo-instagram' : 
                    platform === 'tiktok' ? 'logo-tiktok' : 'logo-whatsapp'
                  } 
                  size={18} 
                  color="white" 
                />
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Rewards and deals count */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="gift-outline" size={20} color="white" />
              <Text style={styles.statText}>{restaurant.rewards} rewards</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="pricetag-outline" size={20} color="white" />
              <Text style={styles.statText}>{restaurant.deals} deals</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
      
      {/* Points card */}
      <View style={styles.pointsCardContainer}>
        <View style={styles.pointsCard}>
          <View style={styles.pointsRow}>
            <Text style={styles.pointsValue}>{restaurant.points}pts</Text>
            <TouchableOpacity style={styles.addPointsButton}>
              <Ionicons name="add" size={16} color="#FF8C00" />
              <Text style={styles.addPointsText}>Add points</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.pointsTillRewardText}>
            {restaurant.pointsTillReward} points till your next rewards
          </Text>
          
          {/* Progress Bar */}
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBar, 
                {width: `${(restaurant.points / (restaurant.points + restaurant.pointsTillReward)) * 100}%`}
              ]} 
            />
          </View>
        </View>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'rewards' && styles.activeTab]}
          onPress={() => setActiveTab('rewards')}
        >
          <Text style={[styles.tabText, activeTab === 'rewards' && styles.activeTabText]}>Rewards</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'deals' && styles.activeTab]}
          onPress={() => setActiveTab('deals')}
        >
          <Text style={[styles.tabText, activeTab === 'deals' && styles.activeTabText]}>Deals</Text>
        </TouchableOpacity>
      </View>
      
      {/* Scrollable content */}
      <ScrollView style={styles.scrollContent}>
        {activeTab === 'rewards' ? (
          // Rewards list
          rewardsData.map((reward) => (
            <View key={reward.id} style={styles.rewardItem}>
              <Image source={reward.image} style={styles.rewardImage} />
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardName}>{reward.name}</Text>
                <Text style={styles.rewardPoints}>{reward.points} pts</Text>
              </View>
              <TouchableOpacity 
                style={[
                  styles.actionButton, 
                  reward.available ? styles.claimButton : styles.buyButton
                ]}
                onPress={() => handleRewardPress(reward)}
              >
                <Text style={styles.actionButtonText}>
                  {reward.available ? 'Claim' : 'Buy'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          // Deals list
          <ScrollView 
            style={styles.dealsContainer}
            showsVerticalScrollIndicator={false}
          >
            {dealsList.map((imageSource, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedDeal({
                    image: imageSource,
                    title: 'KUKU TUESDAY',
                    description: 'We bet you love a good deal on a Tuesday\nFor 12,000... Get an extra piece of Kuku... 5 pieces in total!'
                  });
                  setDealsModalVisible(true);
                }}
              >
                <Image 
                  source={imageSource}
                  style={styles.dealImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        
        {/* Add some bottom padding for scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Info Modal */}
      <WelcomeModal visible={infoModalVisible} onClose={() => setInfoModalVisible(false)} />

      {/* Purchase/Buy Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={purchaseModalVisible}
        onRequestClose={() => setPurchaseModalVisible(false)}
      >
        <View style={styles.centeredView1}>
          <View style={styles.modalView1}>
            <View style={styles.orangeLine1} />
            <Pressable
              style={styles.closeButton1}
              onPress={() => setPurchaseModalVisible(false)}
            >
              <Text style={styles.closeButtonText1}>✕</Text>
            </Pressable>

            <Text style={styles.modalTitle1}>
              {modalType === 'buy' ? 'Burger 53 Deals' : 'Burger 53 Rewards'}
            </Text>

            <View style={styles.imageContainer1}>
              {selectedReward?.image && (
                <Image
                  source={selectedReward.image}
                  style={styles.rewardImage1}
                />
              )}
            </View>

            <Text style={styles.rewardTitle1}>{selectedReward?.name}</Text>
            <Text style={styles.pointsText1}>{selectedReward?.points} Points</Text>
            <Text style={styles.rewardDescription1}>
              {modalType === 'buy'
                ? `Unlock this deal on your next visit to\nBurger 53.`
                : `Claim your free ${selectedReward?.name?.toLowerCase()} at\nBurger 53.`}
            </Text>

            <TouchableOpacity
              style={styles.buyButton1}
              onPress={() => {
                if (modalType === 'buy') {
                  // Handle buy action
                  setPurchaseModalVisible(false);
                } else {
                  // Handle claim action - show redemption confirmation
                  handleClaimConfirm();
                }
              }}
            >
              <Text style={styles.buyButtonText1}>
                {modalType === 'buy' ? 'Buy Deal' : 'Claim Reward'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Redemption Confirmation Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={redeemConfirmModalVisible}
        onRequestClose={() => setRedeemConfirmModalVisible(false)}
      >
        <View style={styles.centeredView1}>
          <View style={styles.modalView1}>
            <View style={styles.orangeLine1} />
            <Pressable
              style={styles.closeButton1}
              onPress={() => setRedeemConfirmModalVisible(false)}
            >
              <Text style={styles.closeButtonText1}>✕</Text>
            </Pressable>

            <Text style={styles.modalTitle1}>Burger 53 Rewards</Text>

            <View style={styles.imageContainer1}>
              {selectedReward?.image && (
                <Image
                  source={selectedReward.image}
                  style={styles.rewardImage1}
                />
              )}
            </View>

            <Text style={styles.rewardTitle1}>{selectedReward?.name}</Text>
            <Text style={styles.pointsText1}>Successfully claimed!</Text>
            <Text style={styles.rewardDescription1}>
              Show this code to the cashier to redeem your reward.
            </Text>

            <TouchableOpacity
              style={styles.buyButton1}
              onPress={handleShowRedemptionCode}
            >
              <Text style={styles.buyButtonText1}>
                Show Redemption Code
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Redemption Code Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={redemptionCodeModalVisible}
        onRequestClose={() => setRedemptionCodeModalVisible(false)}
      >
        <View style={styles.centeredView1}>
          <View style={styles.modalView1}>
            <Pressable
              style={styles.closeButton1}
              onPress={() => setRedemptionCodeModalVisible(false)}
            >
              <Text style={styles.closeButtonText1}>✕</Text>
            </Pressable>

            
             <View style={styles.imageContainer1}>
              {selectedReward?.image && (
                <Image
                  source={selectedReward.image}
                  style={styles.rewardImage1}
                />
              )}
            </View>
            
            <Text style={styles.rewardTitle1}>{selectedReward?.name}</Text>
            <Text style={styles.modalTitle1}>Your Redemption Code</Text>
            <Text style={styles.rewardTitle1}>{redemptionCode}</Text>
            
            <Text style={styles.rewardDescription1}>
              Present this code to the cashier when placing your order
            </Text>

            <TouchableOpacity
              style={styles.buyButton1}
              onPress={() => setRedemptionCodeModalVisible(false)}
            >
              <Text style={styles.buyButtonText1}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Deals Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={dealsModalVisible}
        onRequestClose={() => setDealsModalVisible(false)}
      >
        <View style={styles.centeredViewDeal}>
          <View style={styles.modalViewDeal}>
            <Pressable
              style={styles.closeButtonDeal}
              onPress={() => setDealsModalVisible(false)}
            >
              <Text style={styles.closeButtonTextDeal}>✕</Text>
            </Pressable>

            {selectedDeal?.image && (
              <Image
                source={selectedDeal.image}
                style={styles.dealImageModal}
                resizeMode="cover"
              />
            )}

            <Text style={styles.dealTitle}>{selectedDeal?.title}</Text>
            <Text style={styles.dealDescription}>{selectedDeal?.description}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Styles are omitted as requested
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
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
  },
  headerBackground: {
    height: 200,
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  topNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
  },
  infoButton: {
    padding: 4,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  giftIconContainer: {
    marginRight: 8,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
  },
  memberSinceText: {
    fontSize: 12,
    color: 'white',
    marginTop: 2,
  },
  socialLinksContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  socialButton: {
    marginRight: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 14,
  },
  pointsCardContainer: {
    paddingHorizontal: 16,
    marginTop: -30,
  },
  pointsCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addPointsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF8C00',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  addPointsText: {
    color: '#FF8C00',
    fontSize: 12,
    marginLeft: 2,
  },
  pointsTillRewardText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#EDEDED',
    borderRadius: 4,
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#FF8C00',
    borderRadius: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF8C00',
  },
  tabText: {
    fontSize: 16,
    color: '#999',
  },
  activeTabText: {
    color: '#FF8C00',
    fontWeight: '500',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  rewardImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  rewardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: '500',
  },
  rewardPoints: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  claimButton: {
    backgroundColor: '#FF8C00',
  },
  buyButton: {
    backgroundColor: '#999',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  bottomPadding: {
    height: 20,
  },
  dealsContainer: {
    flex: 1,
    padding: 15,
  },
  dealImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 15,
  },

  centeredView1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    
  },
  modalView1: {
    width: '75%',
    height: '55%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    paddingTop: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: 'relative',
  },
  orangeLine1: {
    position: 'absolute',
    top: 0,
    width: 30,
    height: 3,
    backgroundColor: '#FF9800',
    borderRadius: 2,
    marginTop: 12,
  },
  closeButton1: {
    position: 'absolute',
    right: 15,
    top: 15,
    width: 16,
    height: 16,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText1: {
    fontSize: 14,
    color: '#555',
  },
  modalTitle1: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 1,
    color: '#333',
  },
  imageContainer1: {
    width: 100,
    height: 100,
    borderRadius: 75,
    overflow: 'hidden',
    marginVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    borderWidth: 1,
    marginBottom: 1,
    borderColor: '#f0f0f0',
  },
  rewardImage1: {
    width: 130,
    height: 130,
    resizeMode: 'cover',
  },
  rewardTitle1: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  pointsText1: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#555',
  },
  rewardDescription1: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 25,
    color: '#555',
    lineHeight: 22,
  },
  buyButton1: {
    backgroundColor: '#FF9800',
    borderRadius: 25,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 5,
  },
  buyButtonText1: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  

  centeredViewDeal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  
  modalViewDeal: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    paddingBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  
  closeButtonDeal: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  
  closeButtonTextDeal: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  dealImageModal: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  
  dealTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15,
  },
  
  dealDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
    color: '#555',
  }
});