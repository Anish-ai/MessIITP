// components/DayPickerModal.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../api';

interface DayPickerModalProps {
  visible: boolean;
  onClose: () => void;
  messId: string;
}

const DayPickerModal: React.FC<DayPickerModalProps> = ({ visible, onClose, messId }) => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [fullMenu, setFullMenu] = useState<{ [key: string]: { dish_name: string; type: string }[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Fetch full mess menu for the selected day
  const fetchFullMenu = async (day: string) => {
    setLoading(true);
    setError(null);
    try {
      const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner'];
      const fullMenuData: { [key: string]: { dish_name: string; type: string }[] } = {};

      for (const mealType of mealTypes) {
        const mealsResponse = await api.get('/meals', {
          params: { mess_id: messId, day: day, meal_type: mealType },
        });

        if (mealsResponse.data.length > 0) {
          const mealId = mealsResponse.data[0].meal_id;
          const dishesResponse = await api.get('/meal-dishes', {
            params: { meal_id: mealId },
          });
          fullMenuData[mealType] = dishesResponse.data;
        } else {
          fullMenuData[mealType] = [];
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

  // Fetch full menu when day changes
  useEffect(() => {
    if (visible) {
      fetchFullMenu(selectedDay);
    }
  }, [selectedDay, visible]);

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: '#FFF' }]}>
          <Text style={styles.modalTitle}>Select Day</Text>
          <Picker
            selectedValue={selectedDay}
            onValueChange={(itemValue) => setSelectedDay(itemValue)}
            style={styles.picker}
          >
            {days.map((day) => (
              <Picker.Item key={day} label={day} value={day} />
            ))}
          </Picker>

          {/* Full Mess Menu Table */}
          {loading ? (
            <ActivityIndicator size="large" color="#007BFF" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <ScrollView>
              {Object.entries(fullMenu).map(([mealType, dishes]) => (
                <View key={mealType} style={styles.mealSection}>
                  <Text style={styles.mealTypeHeader}>
                    {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                  </Text>
                  {dishes.map((dish, index) => (
                    <Text key={index} style={[styles.dishName, dish.type === 'nonveg' && styles.nonVegText]}>
                      {dish.dish_name}
                    </Text>
                  ))}
                </View>
              ))}
            </ScrollView>
          )}

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
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
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  picker: {
    marginBottom: 16,
  },
  mealSection: {
    marginBottom: 16,
  },
  mealTypeHeader: {
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
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DayPickerModal;