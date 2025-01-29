// components/MealCard.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import RatingModal from './RatingModal';

interface Dish {
  dish_name: string;
  type: 'veg' | 'nonveg';
}

interface MealCardProps {
  mealType: string;
  dishes: Dish[];
}

const MealCard: React.FC<MealCardProps> = ({ mealType, dishes }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const handleRatePress = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.mealType}>{`Today's ${mealType}`}</Text>
      {dishes.map((dish, index) => (
        <Text key={index} style={[styles.dishName, dish.type === 'nonveg' && styles.nonVegText]}>
          {dish.dish_name}
        </Text>
      ))}
      <View style={styles.rateButton}>
        <TouchableOpacity onPress={handleRatePress}>
          <Text style={styles.rateText} >Rate</Text>
        </TouchableOpacity>
      </View>

      <RatingModal
        visible={isModalVisible}
        onClose={closeModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 16,
  },
  mealType: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dishName: {
    fontSize: 16,
    marginBottom: 4,
  },
  nonVegText: {
    color: 'red',
  },
  rateButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#007BFF',
    alignItems: 'center',
    marginTop: 16,
  },
  rateText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MealCard;