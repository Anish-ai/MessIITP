import React, { useState, useEffect } from 'react';
import api from '../api'; // Adjust the path as necessary
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import RatingModal from './RatingModal';

interface Dish {
  dish_name: string;
  type: 'veg' | 'nonveg';
}

interface MealCardProps {
  mealType: string;
  dishes: Dish[];
  mealId: number | null;
  studentId: number | null;
}

const MealCard: React.FC<MealCardProps> = ({ mealType, dishes, mealId, studentId }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [avgRating, setAvgRating] = useState<number | null>(null);

  useEffect(() => {
    if (mealId) {
      getAvgRating();
    }
  }, [mealId]);

  const handleRatePress = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const getAvgRating = async () => {
    try {
      const response = await api.get('/ratings/getRatingsByMeal', {
        params: { meal_id: mealId },
      });
      setAvgRating(response.data.averageRating);
      console.log('Average rating:', response.data.averageRating);
    } catch (error) {
      console.error('Failed to fetch average rating:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.mealType}>{`Today's ${mealType}`}</Text>
      <Text>
        Average rating: {avgRating !== null ? avgRating : 'Loading...'}
      </Text>
      {dishes.map((dish, index) => (
        <Text key={index} style={[styles.dishName, dish.type === 'nonveg' && styles.nonVegText]}>
          {dish.dish_name}
        </Text>
      ))}
      <TouchableOpacity onPress={handleRatePress}>
        <View style={styles.rateButton}>
          <Text style={styles.rateText}>Rate</Text>
        </View>
      </TouchableOpacity>

      <RatingModal
        visible={isModalVisible}
        onClose={closeModal}
        mealId={mealId}
        studentId={studentId}
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