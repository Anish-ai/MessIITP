import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import api from '../../api';
import debounce from 'lodash.debounce';

const ChangeMenuPage = () => {
    const { student_id } = useLocalSearchParams<{ student_id: string }>();
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [selectedMealType, setSelectedMealType] = useState('breakfast');
    const [dishes, setDishes] = useState<{ dish_name: string; type: string }[]>([]);
    const [newDish, setNewDish] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [messId, setMessId] = useState<number | null>(null);
    const [suggestions, setSuggestions] = useState<{ dish_name: string }[]>([]);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner'];

    // Fetch mess_id from student_id
    useEffect(() => {
        const fetchMessId = async () => {
            if (!student_id) return;

            try {
                const response = await api.get(`/students/${student_id}`);
                const student = response.data;
                setMessId(student.mess_id);
            } catch (error) {
                console.error('Failed to fetch mess_id:', error);
                setError('Failed to fetch mess_id. Please try again.');
            }
        };

        fetchMessId();
    }, [student_id]);

    // Fetch current menu for the selected day and meal type
    const fetchMenu = async () => {
        if (!messId) return;

        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/meals', {
                params: { mess_id: messId, day: selectedDay, meal_type: selectedMealType },
            });

            if (response.data.length > 0) {
                const mealId = response.data[0].meal_id;
                const dishesResponse = await api.get('/meal-dishes', {
                    params: { meal_id: mealId },
                });
                setDishes(dishesResponse.data);
            } else {
                setDishes([]);
            }
        } catch (error) {
            console.error('Failed to fetch menu:', error);
            setError('Failed to fetch menu. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch menu when day, meal type, or messId changes
    useEffect(() => {
        fetchMenu();
    }, [selectedDay, selectedMealType, messId]);

    // Add a new dish to the list
    const handleAddDish = () => {
        if (newDish.trim()) {
            setDishes([...dishes, { dish_name: newDish, type: 'veg' }]);
            setNewDish('');
            setSuggestions([]);
        }
    };

    // Remove a dish from the list
    const handleRemoveDish = (index: number) => {
        const updatedDishes = dishes.filter((_, i) => i !== index);
        setDishes(updatedDishes);
    };

    // Toggle dish type (veg/non-veg)
    const handleToggleDishType = (index: number) => {
        const updatedDishes = dishes.map((dish, i) =>
            i === index ? { ...dish, type: dish.type === 'veg' ? 'nonveg' : 'veg' } : dish
        );
        setDishes(updatedDishes);
    };

    // Save changes to the database
    const handleSaveChanges = async () => {
        setLoading(true);
        setError(null);
        console.log('Saving changes...');

        try {
            console.log('Checking and inserting dishes...');
            // Check if all dishes exist in the dishes table, insert if not
            for (const dish of dishes) {
                console.log(`Checking dish: ${dish.dish_name}`);
                const existingDishResponse = await api.get('/dishes/search', {
                    params: { dish_name: dish.dish_name },
                });

                console.log('Existing dish response:', existingDishResponse.data);

                // Check if the dish exists
                if (!existingDishResponse.data || existingDishResponse.data.length === 0) {
                    console.log(`Dish "${dish.dish_name}" not found. Inserting new dish...`);
                    // Insert the new dish into the dishes table
                    await api.post('/dishes', {
                        dish_name: dish.dish_name,
                        type: dish.type,
                    });
                    console.log(`Dish "${dish.dish_name}" inserted successfully.`);
                } else {
                    console.log(`Dish "${dish.dish_name}" already exists.`);
                }
            }

            console.log('Fetching meal_id...');
            // Fetch the meal_id for the selected day and meal type
            const mealResponse = await api.get('/meals', {
                params: { mess_id: messId, day: selectedDay, meal_type: selectedMealType },
            });

            console.log('Meal response:', mealResponse.data);

            // Ensure the meal exists
            if (!mealResponse.data || mealResponse.data.length === 0) {
                throw new Error('Meal not found for the selected day and meal type.');
            }

            const mealId = mealResponse.data[0].meal_id;
            console.log(`Meal ID: ${mealId}`);

            console.log('Deleting existing meal_dishes entries...');
            // Delete existing meal_dishes entries for this meal
            await api.delete(`/meal-dishes/${mealId}`);
            console.log('Existing meal_dishes entries deleted.');

            console.log('Inserting new meal_dishes entries...');
            // Insert new meal_dishes entries
            for (const dish of dishes) {
                console.log(`Fetching dish ID for: ${dish.dish_name}`);
                const dishResponse = await api.get('/dishes/search', {
                    params: { dish_name: dish.dish_name },
                });

                console.log('Dish response:', dishResponse.data);

                // Ensure the dish exists
                if (!dishResponse.data || dishResponse.data.length === 0) {
                    throw new Error(`Dish "${dish.dish_name}" not found.`);
                }

                const dishId = dishResponse.data[0].dish_id;
                console.log(`Dish ID for "${dish.dish_name}": ${dishId}`);

                await api.post('/meal-dishes', {
                    meal_id: mealId,
                    dish_id: dishId,
                });
                console.log(`Meal-dish entry created for dish ID: ${dishId}`);
            }

            console.log('Menu updated successfully!');
            // Show success message
            Alert.alert('Success', 'Menu updated successfully!');
        } catch (error) {
            console.error('Failed to save changes:', error);
            setError('Failed to save changes. Please try again.');
        } finally {
            console.log('Saving process completed.');
            setLoading(false);
        }
    };

    // Debounced input change handler
    const debouncedHandleInputChange = debounce(async (text: string) => {
        if (text.trim()) {
            try {
                const response = await api.get('/dishes/partialSearch', {
                    params: { dish_name: text },
                });
                setSuggestions(response.data);
            } catch (error) {
                console.error('Failed to fetch suggestions:', error);
            }
        } else {
            setSuggestions([]);
        }
    }, 10); // 300ms delay

    const handleInputChange = (text: string) => {
        setNewDish(text);
        debouncedHandleInputChange(text);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Change Mess Menu</Text>

            {/* Day Picker */}
            <Picker
                selectedValue={selectedDay}
                onValueChange={(itemValue) => setSelectedDay(itemValue)}
                style={styles.picker}
            >
                {days.map((day) => (
                    <Picker.Item key={day} label={day} value={day} />
                ))}
            </Picker>

            {/* Meal Type Picker */}
            <Picker
                selectedValue={selectedMealType}
                onValueChange={(itemValue) => setSelectedMealType(itemValue)}
                style={styles.picker}
            >
                {mealTypes.map((mealType) => (
                    <Picker.Item key={mealType} label={mealType} value={mealType} />
                ))}
            </Picker>

            {/* Dish List */}
            <ScrollView style={styles.dishList}>
                {dishes.map((dish, index) => (
                    <View key={index} style={styles.dishItem}>
                        <Text style={styles.dishName}>{dish.dish_name}</Text>
                        <TouchableOpacity
                            style={styles.toggleButton}
                            onPress={() => handleToggleDishType(index)}
                        >
                            <Text style={styles.toggleButtonText}>{dish.type.toUpperCase()}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => handleRemoveDish(index)}
                        >
                            <Ionicons name="remove-circle" size={24} color="red" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    {suggestions.map((suggestion, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.suggestionItem}
                            onPress={() => {
                                setNewDish(suggestion.dish_name);
                                setSuggestions([]);
                            }}
                        >
                            <Text style={styles.suggestionText}>{suggestion.dish_name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Add New Dish */}
            <View style={styles.addDishContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Add a new dish"
                    value={newDish}
                    onChangeText={handleInputChange}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddDish}>
                    <Ionicons name="add-circle" size={24} color="green" />
                </TouchableOpacity>
            </View>

            {/* Save Changes Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>

            {/* Loading and Error Messages */}
            {loading && <Text style={styles.loadingText}>Saving changes...</Text>}
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    picker: {
        marginBottom: 16,
    },
    dishList: {
        marginBottom: 16,
    },
    dishItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    dishName: {
        flex: 1,
        fontSize: 16,
    },
    toggleButton: {
        padding: 8,
        backgroundColor: '#DDD',
        borderRadius: 4,
        marginRight: 8,
    },
    toggleButtonText: {
        fontSize: 14,
    },
    removeButton: {
        padding: 8,
    },
    addDishContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 4,
        padding: 8,
        marginRight: 8,
    },
    addButton: {
        padding: 8,
    },
    saveButton: {
        backgroundColor: '#007BFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 16,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 16,
    },
    suggestionsContainer: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 4,
        maxHeight: 150,
        overflow: 'hidden',
    },
    suggestionItem: {
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#DDD',
    },
    suggestionText: {
        fontSize: 16,
    },
});

export default ChangeMenuPage;