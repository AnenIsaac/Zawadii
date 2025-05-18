import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

// Confetti piece component
const ConfettiPiece = ({ style }) => {
  return <View style={[styles.confettiPiece, style]} />;
};

const PointsEarnedScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(true);
  const [confetti, setConfetti] = useState([]);

  // Generate confetti pieces
  useEffect(() => {
    const pieces = [];
    const colors = ['#FF8C00', '#333333', '#FFFFFF']; // Orange, dark gray, white
    const shapes = ['circle', 'rectangle'];
    
    for (let i = 0; i < 50; i++) {
      const randomX = Math.random() * width;
      const randomY = Math.random() * height * 1.0; // Only in top 100% of screen
      const randomSize = Math.random() * 10 + 6;
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
      const randomRotation = `${Math.random() * 360}deg`;
      
      pieces.push({
        id: i,
        x: randomX,
        y: randomY,
        size: randomSize,
        color: randomColor,
        shape: randomShape,
        rotation: randomRotation,
      });
    }
    setConfetti(pieces);
  }, []);

  return (
    <View style={styles.container}>
      {/* Confetti background */}
   
{confetti.map((piece) => (
    <Animatable.View
      key={piece.id}
      animation="fadeIn"
      duration={500}
      delay={Math.random() * 500}
      style={[
        styles.confettiContainer,
        {
          left: piece.x,
          top: piece.y,
          transform: [{ rotate: piece.rotation }],
        },
      ]}
    >
      <ConfettiPiece
        style={{
          backgroundColor: piece.color,
          width: piece.shape === 'circle' ? piece.size : piece.size * 2,
          height: piece.shape === 'circle' ? piece.size : piece.size,
          borderRadius: piece.shape === 'circle' ? piece.size / 2 : 0,
        }}
      />
    </Animatable.View>
  ))}
      {/* Points Earned Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View 
            animation="zoomIn" 
            duration={500} 
            style={styles.modalContent}
          >
            {/* Points indicator */}
            <Animatable.View 
              animation="pulse" 
              iterationCount="infinite" 
              duration={2000}
              style={styles.pointsCircle}
            >
              <Text style={styles.pointsText}>+50</Text>
            </Animatable.View>

            {/* Congratulations text */}
            <Text style={styles.congratsText}>
              Congrats! 🎉 You've earned 50 points at Burger 53! Tap to see how you can redeem them for exciting rewards! 🍔
            </Text>

            {/* Claim button */}
            <TouchableOpacity 
              style={styles.claimButton}
              // onPress={() => setModalVisible(false)
                
              // }
              onPress={() => navigation.navigate('HomeScreen')}
            >
              <Text style={styles.claimButtonText}>Claim Points</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  confettiContainer: {
    position: 'absolute',
    zIndex: 1,
  },
  confettiPiece: {
    position: 'absolute',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    // Adding confetti-like decoration to the card
    overflow: 'visible',
  },
  pointsCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FF8C00',
    marginBottom: 20,
  },
  pointsText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  congratsText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  claimButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  claimButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PointsEarnedScreen;