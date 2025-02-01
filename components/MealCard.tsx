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
  onMealChange?: () => void;
}

const getRatingColor = (rating: number | null) => {
  if (rating === null) return 'rgb(255, 200, 200)'; // Light red for no rating
  
  const red = Math.min(255, Math.max(150, 255 - rating * 25));
  const green = Math.min(255, Math.max(150, rating * 55));
  return `rgb(${red}, ${green}, 150)`;
};

const MealCard: React.FC<MealCardProps> = ({ mealType, dishes, mealId, studentId, onMealChange }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [todayAvgRating, setTodayAvgRating] = useState<number | null>(null);

  // Reset ratings when mealId becomes null or changes
  console.log('mealId:', mealId);
  useEffect(() => {
    if (!mealId) {
      setAvgRating(null);
      setTodayAvgRating(null);
    } else {
      getAvgRating();
      getTodayAvgRating();
    }
    onMealChange && onMealChange();
  }, [mealId, dishes]);

  const handleRatePress = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const onRatingSubmit = () => {
    if (mealId) {
      getAvgRating();
      getTodayAvgRating();
    }
  };

  const getAvgRating = async () => {
    if (!mealId) {
      setAvgRating(null);
      return;
    }

    try {
      const response = await api.get('/ratings/getRatingsByMeal', {
        params: { meal_id: mealId },
      });

      if (typeof response.data?.averageRating === 'number') {
        setAvgRating(response.data.averageRating);
      } else {
        setAvgRating(null);
      }
    } catch (error) {
      console.error('Failed to fetch average rating:', error);
      setAvgRating(null);
    }
  };

  const getTodayAvgRating = async () => {
    if (!mealId) {
      setTodayAvgRating(null);
      return;
    }

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
          <View style={[styles.ratingBox, { backgroundColor: getRatingColor(avgRating) }]}> 
            <Text style={styles.ratingText}>
              Average rating: {avgRating !== null ? avgRating.toFixed(1) : 'N/A'}
            </Text>
          </View>
          <View style={[styles.ratingBox, { backgroundColor: getRatingColor(todayAvgRating) }]}> 
            <Text style={styles.ratingText}>
              Today's average rating: {todayAvgRating !== null ? todayAvgRating.toFixed(1) : 'N/A'}
            </Text>
          </View>
        </>
      ) : (
        <Text>No meal available</Text>
      )}
      <View style={styles.dishContainer}>
        <View style={styles.vegSection}>
          <Text style={styles.sectionTitle}>Vegetarian</Text>
          {dishes.filter(dish => dish.type === 'veg').map((dish, index) => (
            <Text key={index} style={styles.dishName}>{`${index + 1}. ${dish.dish_name}`}</Text>
          ))}
        </View>
        <View style={styles.nonVegSection}>
          <Text style={styles.sectionTitle}>Non-Vegetarian</Text>
          {dishes.filter(dish => dish.type === 'nonveg').map((dish, index) => (
            <Text key={index} style={[styles.dishName, styles.nonVegText]}>{`${index + 1}. ${dish.dish_name}`}</Text>
          ))}
        </View>
      </View>
      {mealId && (
        <TouchableOpacity onPress={handleRatePress}>
          <View style={styles.rateButton}>
            <Text style={styles.rateText}>Rate Current Meal 😁</Text>
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
    borderWidth: 1,
    borderColor: '#ccc',
  },
  mealType: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dishContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  vegSection: {
    flex: 1,
    padding: 10,
    backgroundColor: '#DFF2BF',
    borderRadius: 10,
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#86B87D',
  },
  nonVegSection: {
    flex: 1,
    padding: 10,
    backgroundColor: '#FFBABA',
    borderRadius: 10,
    marginLeft: 5,
    borderWidth: 1,
    borderColor: '#D46A6A',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
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
  ratingBox: {
    padding: 8,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MealCard;
