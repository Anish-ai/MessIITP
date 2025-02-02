import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useThemeColor } from '../hooks/useThemeColor';
import RatingDonut from './RatingDonut';
import api from '../api';

interface DayPickerModalProps {
  visible: boolean;
  onClose: () => void;
  messId: string;
}

interface Dish {
  dish_name: string;
  type: string;
}

interface MealData {
  meal_id: number;
  dishes: Dish[];
  avgRating?: number | null;
}

const DayPickerModal: React.FC<DayPickerModalProps> = ({ visible, onClose, messId }) => {
  const { color: backgroundColor, theme, toggleTheme } = useThemeColor({}, 'background');
  const { color: textColor } = useThemeColor({}, 'text');
  const { color: tintColor } = useThemeColor({}, 'tint');
  const { color: cardBackground } = useThemeColor({}, 'cardBackground');
  const { color: borderColor } = useThemeColor({}, 'border');
  const { color: lessDarkBackground } = useThemeColor({}, 'lessDarkBackground');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [fullMenu, setFullMenu] = useState<{ [key: string]: MealData }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const fetchFullMenu = async (day: string) => {
    setLoading(true);
    setError(null);
    try {
      const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner'];
      const fullMenuData: { [key: string]: MealData } = {};

      for (const mealType of mealTypes) {
        const mealsResponse = await api.get('/meals', {
          params: { mess_id: messId, day: day, meal_type: mealType },
        });

        console.log('Meals Response:', mealsResponse.data); // Log meals response

        if (mealsResponse.data && mealsResponse.data.length > 0) {
          const mealId = mealsResponse.data[0].meal_id;
          const dishesResponse = await api.get('/meal-dishes', {
            params: { meal_id: mealId },
          });

          console.log('Dishes Response:', dishesResponse.data); // Log dishes response

          // Ensure dishesResponse.data is an array
          const dishes = Array.isArray(dishesResponse.data) ? dishesResponse.data : [];

          let avgRating: number | null = null; // Default to null if no rating data
          try {
            // Fetch average rating for the meal
            const ratingResponse = await api.get('/ratings/getRatingsByMeal', {
              params: { meal_id: mealId },
            });

            console.log('Rating Response:', ratingResponse.data); // Log rating response

            // Ensure ratingResponse.data.averageRating is a number
            if (typeof ratingResponse.data?.averageRating === 'number') {
              avgRating = ratingResponse.data.averageRating;
            }
          } catch (ratingError) {
            console.error('Failed to fetch average rating:', ratingError);
            // If the rating endpoint fails, keep avgRating as null
          }

          fullMenuData[mealType] = {
            meal_id: mealId,
            dishes: dishes,
            avgRating: avgRating, // Can be null if no rating data
          };
        } else {
          fullMenuData[mealType] = {
            meal_id: -1,
            dishes: [],
            avgRating: null, // No rating data
          };
        }
      }

      setFullMenu(fullMenuData);
    } catch (error) {
      console.error('Failed to fetch full menu:', error);
      setError('Failed to fetch full menu. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchFullMenu(selectedDay);
    }
  }, [selectedDay, visible]);

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={[
          styles.modalContent,
          {
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            borderWidth: 1,
          }
        ]}>
          <Text style={[styles.modalTitle, { color: textColor }]}>Select Day</Text>

          <View style={[styles.pickerContainer, { backgroundColor: lessDarkBackground, borderColor }]}>
            <Picker
              selectedValue={selectedDay}
              onValueChange={(itemValue) => setSelectedDay(itemValue)}
              style={[styles.picker, { color: textColor }]}
              dropdownIconColor={textColor}
              mode='dropdown'
            >
              {days.map((day) => (
                <Picker.Item
                  key={day}
                  label={day}
                  value={day}
                  color={textColor}
                  style={{ backgroundColor: lessDarkBackground }}
                />
              ))}
            </Picker>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={tintColor} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <ScrollView style={styles.menuScrollView}>
              {Object.entries(fullMenu).map(([mealType, mealData]) => (
                <View key={mealType} style={[
                  styles.mealSection,
                  {
                    backgroundColor: lessDarkBackground,
                    borderColor: borderColor
                  }
                ]}>
                  <View style={styles.mealHeader}>
                    <Text style={[styles.mealTypeHeader, { color: textColor }]}>
                      {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                    </Text>
                    <View style={styles.ratingContainer}>
                      <RatingDonut rating={mealData.avgRating ?? null} size={35} />
                    </View>
                  </View>
                  {mealData.dishes && mealData.dishes.map((dish, index) => (
                    <Text
                      key={index}
                      style={[
                        styles.dishName,
                        { color: textColor },
                        dish.type === 'nonveg' && styles.nonVegText
                      ]}
                    >
                      {dish.dish_name}
                    </Text>
                  ))}
                </View>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: tintColor }]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 16,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  menuScrollView: {
    marginBottom: 8,
  },
  mealSection: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTypeHeader: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ratingContainer: {
    marginLeft: 8,
  },
  dishName: {
    fontSize: 16,
    marginBottom: 4,
    paddingLeft: 8,
  },
  nonVegText: {
    color: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  closeButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DayPickerModal;