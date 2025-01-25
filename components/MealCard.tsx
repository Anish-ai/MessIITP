// components/MealCard.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Dish {
  dish_name: string;
  type: 'veg' | 'nonveg';
}

interface MealCardProps {
  mealType: string;
  dishes: Dish[];
}

const MealCard: React.FC<MealCardProps> = ({ mealType, dishes }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.mealType}>{`Today's ${mealType}`}</Text>
      {dishes.map((dish, index) => (
        <Text key={index} style={[styles.dishName, dish.type === 'nonveg' && styles.nonVegText]}>
          {dish.dish_name}
        </Text>
      ))}
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
});

export default MealCard;