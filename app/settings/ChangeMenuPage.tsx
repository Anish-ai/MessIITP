import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Keyboard } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
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

    const { color: backgroundColor } = useThemeColor({}, 'background');
    const { color: textColor } = useThemeColor({}, 'text');
    const { color: tintColor } = useThemeColor({}, 'tint');
    const { color: cardBackground } = useThemeColor({}, 'cardBackground');
    const { color: borderColor } = useThemeColor({}, 'border');
    const { color: veg } = useThemeColor({}, 'veg');
    const { color: nonVeg } = useThemeColor({}, 'nonVeg');

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner'];

    // Add ref to your TextInput
    const inputRef = useRef<TextInput>(null);

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
        <View style={[styles.container, { backgroundColor }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: cardBackground }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={tintColor} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: textColor }]}>Change Menu</Text>
            </View>

            {/* Selection Card */}
            <View style={[styles.selectionCard, { backgroundColor: cardBackground, borderColor }]}>
                <Picker
                    selectedValue={selectedDay}
                    onValueChange={setSelectedDay}
                    style={[styles.picker, { color: textColor }]}
                    dropdownIconColor={tintColor}
                    mode='dropdown'
                >
                    {days.map((day) => (
                        <Picker.Item key={day} label={day} value={day} color={textColor} style={{backgroundColor: cardBackground, borderColor}}/>
                    ))}
                </Picker>

                <Picker
                    selectedValue={selectedMealType}
                    onValueChange={setSelectedMealType}
                    style={[styles.picker, { color: textColor }]}
                    dropdownIconColor={tintColor}
                    mode='dropdown'
                >
                    {mealTypes.map((type) => (
                        <Picker.Item 
                            key={type} 
                            label={type.charAt(0).toUpperCase() + type.slice(1)} 
                            value={type}
                            color={textColor}
                            style={{ backgroundColor: cardBackground, borderColor }}
                        />
                    ))}
                </Picker>
            </View>

            {/* Dishes List */}
            <ScrollView style={styles.dishList}>
                {dishes.map((dish, index) => (
                    <View 
                        key={index} 
                        style={[
                            styles.dishItem, 
                            { 
                                backgroundColor: cardBackground,
                                borderColor,
                                borderLeftColor: dish.type === 'veg' ? veg : nonVeg
                            }
                        ]}
                    >
                        <Text style={[styles.dishName, { color: textColor }]}>{dish.dish_name}</Text>
                        <TouchableOpacity
                            style={[styles.toggleButton, { backgroundColor: dish.type === 'veg' ? veg : nonVeg }]}
                            onPress={() => handleToggleDishType(index)}
                        >
                            <Text style={[styles.toggleButtonText, {color: textColor}]}>{dish.type === 'veg' ? 'VEG' : 'NON-VEG'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => handleRemoveDish(index)}
                        >
                            <Ionicons name="close-circle" size={24} color='#DC3545' />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            {/* Add New Dish Section */}
            <View style={[styles.addDishSection, { backgroundColor: cardBackground, borderColor }]}>
                <View style={styles.addDishContainer}>
                    <TextInput
                        style={[styles.input, { backgroundColor, color: textColor, borderColor }]}
                        placeholder="Add a new dish"
                        placeholderTextColor={textColor + '80'}
                        value={newDish}
                        onChangeText={handleInputChange}
                        autoCapitalize="words"
                        autoCorrect={false}
                    />
                    <TouchableOpacity 
                        style={[styles.addButton, { backgroundColor: tintColor }]} 
                        onPress={handleAddDish}
                    >
                        <Ionicons name="add" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                    <ScrollView 
                        style={[styles.suggestionsContainer, { backgroundColor, borderColor }]}
                        keyboardShouldPersistTaps="always"
                    >
                        {suggestions.map((suggestion, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.suggestionItem, { borderBottomColor: borderColor }]}
                                onPress={() => {
                                    setNewDish(suggestion.dish_name);
                                    setSuggestions([]);
                                }}
                            >
                                <Text style={[styles.suggestionText, { color: textColor }]}>
                                    {suggestion.dish_name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* Save Button */}
            <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: tintColor }]} 
                onPress={handleSaveChanges}
                disabled={loading}
            >
                {loading ? (
                    <Text style={styles.saveButtonText}>Saving...</Text>
                ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
            </TouchableOpacity>

            {error && (
                <Text style={[styles.errorText, { color: nonVeg }]}>{error}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    backButton: {
        padding: 8,
        marginRight: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    selectionCard: {
        margin: 16,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
        elevation: 2,
    },
    picker: {
        height: 60,
        elevation: 5,
    },
    dishList: {
        flex: 1,
        paddingHorizontal: 16,
    },
    dishItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderLeftWidth: 4,
        elevation: 2,
    },
    dishName: {
        flex: 1,
        fontSize: 16,
        marginRight: 8,
    },
    toggleButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        marginRight: 8,
    },
    toggleButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    removeButton: {
        padding: 4,
    },
    addDishSection: {
        padding: 16,
        borderTopWidth: 1,
        elevation: 2,
    },
    addDishContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 44,
        borderWidth: 1,
        borderRadius: 50,
        paddingHorizontal: 12,
        marginRight: 8,
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    suggestionsContainer: {
        marginTop: 8,
        borderWidth: 1,
        borderRadius: 8,
        maxHeight: 150,
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
    },
    suggestionText: {
        fontSize: 16,
    },
    saveButton: {
        margin: 16,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        elevation: 3,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        textAlign: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
    },
});

export default ChangeMenuPage;