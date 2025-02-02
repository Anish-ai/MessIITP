import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
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

        if (mealsResponse.data && mealsResponse.data.length > 0) {
          const mealId = mealsResponse.data[0].meal_id;
          const dishesResponse = await api.get('/meal-dishes', {
            params: { meal_id: mealId },
          });

          const dishes = Array.isArray(dishesResponse.data) ? dishesResponse.data : [];

          let avgRating: number | null = null;
          try {
            const ratingResponse = await api.get('/ratings/getRatingsByMeal', {
              params: { meal_id: mealId },
            });

            if (typeof ratingResponse.data?.averageRating === 'number') {
              avgRating = ratingResponse.data.averageRating;
            }
          } catch (ratingError) {
            console.error('Failed to fetch average rating:', ratingError);
          }

          fullMenuData[mealType] = {
            meal_id: mealId,
            dishes: dishes,
            avgRating: avgRating,
          };
        } else {
          fullMenuData[mealType] = {
            meal_id: -1,
            dishes: [],
            avgRating: null,
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
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.9)']}
          style={styles.modalBackground}
        >
          <View style={[
            styles.modalContent,
            {
              backgroundColor: cardBackground,
              borderColor: borderColor,
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
              <ScrollView style={styles.menuScrollView} showsVerticalScrollIndicator={false}>
                {Object.entries(fullMenu).map(([mealType, mealData]) => (
                  <LinearGradient
                    key={mealType}
                    colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                    style={[
                      styles.mealSection,
                      {
                        borderColor: borderColor,
                      }
                    ]}
                  >
                    <View style={styles.mealHeader}>
                      <Text style={[styles.mealTypeHeader, { color: textColor }]}>
                        {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                      </Text>
                      <View style={styles.ratingContainer}>
                        <RatingDonut rating={mealData.avgRating ?? null} size={35} />
                      </View>
                    </View>
                    {mealData.dishes && mealData.dishes.map((dish, index) => (
                      <View key={index} style={styles.dishItem}>
                        <Text
                          style={[
                            styles.dishName,
                            { color: textColor },
                            dish.type === 'nonveg' && styles.nonVegText
                          ]}
                        >
                          {dish.dish_name}
                        </Text>
                      </View>
                    ))}
                  </LinearGradient>
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
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: Dimensions.get('window').width * 0.9,
    maxHeight: Dimensions.get('window').height * 0.8,
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerContainer: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  picker: {
    height: 60,
  },
  menuScrollView: {
    marginBottom: 16,
  },
  mealSection: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTypeHeader: {
    fontSize: 20,
    fontWeight: '600',
  },
  ratingContainer: {
    marginLeft: 8,
  },
  dishItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 8,
  },
  dishName: {
    fontSize: 16,
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
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DayPickerModal;