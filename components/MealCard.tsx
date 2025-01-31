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
  const [todayAvgRating, setTodayAvgRating] = useState<number | null>(null);

  console.log('Meal ID:', mealId);

  // Add a dependency on dishes to trigger rating fetch when menu changes
  useEffect(() => {
    if (mealId) {
      getAvgRating();
      getTodayAvgRating();
    } else {
      // Reset ratings if no meal ID
      setAvgRating(null);
      setTodayAvgRating(null);
    }
  }, [mealId, dishes]); // Add dishes to dependency array

  const handleRatePress = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const onRatingSubmit = () => {
    getAvgRating();
    getTodayAvgRating();
  };

  const getAvgRating = async () => {
    try {
      const response = await api.get('/ratings/getRatingsByMeal', {
        params: { meal_id: mealId },
      });

      if (typeof response.data?.averageRating === 'number') {
        setAvgRating(response.data.averageRating);
      } else {
        setAvgRating(null);
      }

      console.log('Average rating:', response.data.averageRating);
    } catch (error) {
      console.error('Failed to fetch average rating:', error);
      setAvgRating(null);
    }
  };

  const getTodayAvgRating = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get('/ratings/getRatingByMealAndDate', {
        params: { meal_id: mealId, rating_date: today },
      });

      if (typeof response.data?.averageRating === 'number') {
        setTodayAvgRating(response.data.averageRating);
      } else {
        setTodayAvgRating(null);
      }

      console.log("Today's average rating:", response.data.averageRating);
    } catch (error) {
      console.error("Failed to fetch today's average rating:", error);
      setTodayAvgRating(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.mealType}>{`Today's ${mealType}`}</Text>
      {mealId ? (
        <>
          <Text>
            Average rating: {avgRating !== null ? avgRating.toFixed(1) : 'N/A'}
          </Text>
          <Text>
            Today's average rating: {todayAvgRating !== null ? todayAvgRating.toFixed(1) : 'N/A'}
          </Text>
        </>
      ) : (
        <Text>No meal available</Text>
      )}
      {dishes.map((dish, index) => (
        <Text key={index} style={[styles.dishName, dish.type === 'nonveg' && styles.nonVegText]}>
          {dish.dish_name}
        </Text>
      ))}
      {mealId && (
        <TouchableOpacity onPress={handleRatePress}>
          <View style={styles.rateButton}>
            <Text style={styles.rateText}>Rate</Text>
          </View>
        </TouchableOpacity>
      )}

      <RatingModal
        visible={isModalVisible}
        onClose={closeModal}
        mealId={mealId}
        studentId={studentId}
        onRatingSubmit={onRatingSubmit}
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