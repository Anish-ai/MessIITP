import React, { useState, useEffect } from 'react';
import api from '../api';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import RatingModal from './RatingModal';
import { useThemeColor } from '../hooks/useThemeColor';
import RatingDonut from './RatingDonut';

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
  if (rating === null) return 'rgb(255, 200, 200)';
  const normalizedRating = (rating - 1) / 4;
  let red, green;

  if (normalizedRating <= 0.5) {
    red = 255;
    green = 127 + Math.floor(128 * (normalizedRating * 2));
  } else {
    red = 255 - Math.floor(128 * ((normalizedRating - 0.5) * 2));
    green = 255;
  }

  return `rgba(${red}, ${green}, 127, 0.5)`;
};

const MealCard: React.FC<MealCardProps> = ({ mealType, dishes, mealId, studentId, onMealChange }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [todayAvgRating, setTodayAvgRating] = useState<number | null>(null);

  const { color: backgroundColor, theme, toggleTheme } = useThemeColor({}, 'background');
    const { color: textColor } = useThemeColor({}, 'text');
    const { color: tintColor } = useThemeColor({}, 'tint');
    const { color: cardBackground } = useThemeColor({}, 'cardBackground');
    const { color: borderColor } = useThemeColor({}, 'border');
    const { color: lessDarkBackground } = useThemeColor({}, 'lessDarkBackground');
    const { color: veg} = useThemeColor({}, 'veg');
    const { color: nonVeg} = useThemeColor({}, 'nonVeg');

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
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.mealType, { color: textColor }]}>{`Today's ${mealType}`}</Text>
      </View>

      {mealId ? (
        <>
          <View style={styles.ratingsContainer}>
            <View style={styles.ratingItem}>
              <Text style={[styles.ratingLabel, { color: textColor }]}>Average</Text>
              <RatingDonut rating={avgRating} />
            </View>
            <View style={styles.ratingItem}>
              <Text style={[styles.ratingLabel, { color: textColor }]}>Today</Text>
              <RatingDonut rating={todayAvgRating} />
            </View>
          </View>
        </>
      ) : (
        <Text style={[styles.noMealText, { color: textColor }]}>No meal available</Text>
      )}

      <View style={styles.dishContainer}>
        <View style={[styles.vegSection, { backgroundColor: veg, borderColor: borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Vegetarian</Text>
          {dishes.filter(dish => dish.type === 'veg').map((dish, index) => (
            <Text key={index} style={[styles.dishName, { color: textColor }]}>{`${index + 1}. ${dish.dish_name}`}</Text>
          ))}
        </View>
        <View style={[styles.nonVegSection, { backgroundColor: nonVeg, borderColor: borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Non-Vegetarian</Text>
          {dishes.filter(dish => dish.type === 'nonveg').map((dish, index) => (
            <Text key={index} style={[styles.dishName, styles.nonVegText, { color: textColor }]}>{`${index + 1}. ${dish.dish_name}`}</Text>
          ))}
        </View>
      </View>

      {mealId && (
        <TouchableOpacity onPress={handleRatePress} style={styles.buttonContainer}>
          <View style={[styles.rateButton, { backgroundColor: tintColor }]}>
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
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 5,
  },
  headerContainer: {
    marginBottom: 12,
    elevation: 8,
  },
  mealType: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  dishContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  vegSection: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    elevation: 3,
  },
  nonVegSection: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    marginLeft: 6,
    borderWidth: 1,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
    elevation: 2,
  },
  dishName: {
    fontSize: 13,
    marginBottom: 4,
    paddingLeft: 4,
  },
  nonVegText: {
    color: 'red',
  },
  buttonContainer: {
    marginTop: 16,
    elevation: 5,
  },
  rateButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  rateText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  ratingBox: {
    padding: 8,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  noMealText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 12,
  },
  ratingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  ratingItem: {
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
});

export default MealCard;