// app/menu/index.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import MealCard from '@/components/MealCard';
import DayPickerModal from '@/components/DayPickerModal';
import api from '../../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import RatingTrendGraph from '@/components/RatingTrendGraph';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Add this helper function to get day string from date
const getDayString = (date: Date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

const MenuScreen = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentDay, setCurrentDay] = useState('Monday');
  const [currentMeal, setCurrentMeal] = useState('breakfast');
  const [fullMenu, setFullMenu] = useState<{ [key: string]: { dish_name: string; type: string }[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [messId, setMessId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [studentId, setStudentId] = useState<number | null>(null);
  const [mealId, setMealId] = useState<number | null>(null);
  const [refreshGraph, setRefreshGraph] = useState(false);
  const [messIds, setMessIds] = useState<number[]>([]);
  const [messNames, setMessNames] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'cr' | 'user'>('user'); // Add userRole state
  // Add new state for notification permissions
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const adminEmails = ['anish_2301mc40@iitp.ac.in', 'Jatin_2301ec12@iitp.ac.in'];
  const crEmails = ['cr1@example.com', 'cr2@example.com'];

  // New function to store menu in AsyncStorage
  const storeMenuInStorage = async (menu: any) => {
    try {
      const today = new Date().toLocaleDateString('en-CA'); // 'en-CA' format is YYYY-MM-DD
      console.log('Storing menu for', today);
      console.log('Menu:', menu);
      await AsyncStorage.setItem(`@menu-${today}`, JSON.stringify(menu));
    } catch (e) {
      console.error('Failed to save menu to storage:', e);
    }
  };

  useEffect(() => {
    const fetchMessData = async () => {
      try {
        const response = await api.get('/mess/all');
        // Filter out mess ID 1
        const filteredMesses = response.data.filter((mess: { mess_id: number }) => mess.mess_id !== 1);
        const messIds = filteredMesses.map((mess: { mess_id: number }) => mess.mess_id);
        const messNames = filteredMesses.map((mess: { mess_name: string }) => mess.mess_name);
        setMessIds(messIds);
        setMessNames(messNames);
      } catch (error) {
        console.error('Failed to fetch mess data:', error);
        // Optionally set a fallback or show an error
      }
    };

    fetchMessData();
  }, []);
  // Theme colors
  const { color: backgroundColor, theme, toggleTheme } = useThemeColor({}, 'background');
  const { color: textColor } = useThemeColor({}, 'text');
  const { color: tintColor } = useThemeColor({}, 'tint');
  const { color: cardBackground } = useThemeColor({}, 'cardBackground');
  const { color: borderColor } = useThemeColor({}, 'border');

  // Fetch user role from the database
  const fetchUserRole = async (email: string) => {
    try {
      const response = await api.get(`/roles?email=${email}`);
      console.log('User role:', response.data); // Log the full response

      if (response.data && response.data.length > 0) {
        const userRole = response.data[0].role; // Access the first element
        setUserRole(userRole);
      } else {
        console.log('No role found for the user');
        setUserRole('user'); // Default to 'user' if no role is found
      }
    } catch (error) {
      console.error('Failed to fetch user role:', error);
      setUserRole('user'); // Default to 'user' in case of error
    }
  };

  // Fetch student details
  useEffect(() => {
    const fetchStudentDetails = async () => {
      const studentId = await AsyncStorage.getItem('student_id');
      if (studentId) {
        try {
          const response = await api.get(`/students/${studentId}`);
          const student = response.data;
          setUserName(student.name);
          setMessId(student.mess_id);
          setUserEmail(student.email);
          setStudentId(student.student_id);
          await fetchUserRole(student.email);
          const { meal, day } = getCurrentMeal();
          setCurrentDay(day);
          setCurrentMeal(meal);
          console.log('meal:', meal);
          console.log('day:', day);
          // set meal id here
          const mealsResponse = await api.get('/meals', {
            params: { mess_id: student.mess_id, day: day, meal_type: meal },
          });
          if (mealsResponse.data.length > 0) {
            const mealId = mealsResponse.data[0].meal_id;
            setMealId(mealId);
          } else {
            console.log('No meals found for', meal);
            setMealId(null);
          }
        } catch (error) {
          console.error('Failed to fetch student details:', error);
        }
      }
    };

    fetchStudentDetails();
  }, []);

  const fetchFullMenuForAllDays = async (messId: number) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner'];
  
    try {
      for (const day of days) {
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
  
        // Store the menu for the day in AsyncStorage
        await storeMenuInStorageForDay(day, fullMenuData);
      }
  
      console.log('Full menu for all days fetched and stored successfully.');
    } catch (error) {
      console.error('Failed to fetch full menu for all days:', error);
    }
  };
  
  const storeMenuInStorageForDay = async (day: string, menu: any) => {
    try {
      await AsyncStorage.setItem(`@menu-${day}`, JSON.stringify(menu));
      console.log(`Menu for ${day}: ${JSON.stringify(menu)}`);
      console.log(`Menu for ${day} stored successfully.`);
    } catch (e) {
      console.error(`Failed to save menu for ${day} to storage:`, e);
    }
  };

  const handleMealChange = async () => {
    const studentId = await AsyncStorage.getItem('student_id');
    if (studentId) {
      try {
        const response = await api.get(`/students/${studentId}`);
        const student = response.data;

        // Check if mess_id has changed
        if (student.mess_id !== messId) {
          setMessId(student.mess_id);
          // Fetch menu for the new mess
          fetchMenu();
        }
      } catch (error) {
        console.error('Failed to fetch student details:', error);
      }
    }
  };

  const fetchStudentDetails = async () => {
    const studentId = await AsyncStorage.getItem('student_id');
    if (studentId) {
      try {
        const response = await api.get(`/students/${studentId}`);
        const student = response.data;
        setUserName(student.name);

        // Check if mess_id has changed
        if (student.mess_id !== messId) {
          setMessId(student.mess_id);
          // Fetch menu for the new mess
          fetchMenu();
        }

        setUserEmail(student.email);
        setStudentId(student.student_id);
        await fetchUserRole(student.email);

        const { meal, day } = getCurrentMeal();
        console.log('meal:', meal);
        console.log('day:', day);
        setCurrentDay(day);
        setCurrentMeal(meal);
        // set meal id here
        const mealsResponse = await api.get('/meals', {
          params: { mess_id: student.mess_id, day: day, meal_type: meal },
        });
        if (mealsResponse.data.length > 0) {
          const mealId = mealsResponse.data[0].meal_id;
          console.log('mealId:', mealId);
          setMealId(mealId);
        } else {
          console.log('No meals found for', meal);
          setMealId(null);
        }
        //set full menu here
        const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner'];
        const fullMenuData: { [key: string]: { dish_name: string; type: string }[] } = {};

        for (const mealType of mealTypes) {
          const mealsResponse = await api.get('/meals', {
            params: { mess_id: student.mess_id, day: day, meal_type: mealType },
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

        scheduleMealNotifications();
      } catch (error) {
        console.error('Failed to fetch student details:', error);
      }
    }
  };

  // Use useFocusEffect to refresh student details when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        await fetchStudentDetails();
        await fetchMenu();
        await scheduleMealNotifications();
      };
      refreshData();
    }, [messId])
  );

  useEffect(() => {
    const fetchData = async () => {
      await fetchStudentDetails();
      if (messId) {
        await fetchFullMenuForAllDays(messId); // Fetch and store full menu for all days
        await scheduleMealNotifications();
      }
    };
    fetchData();
  }, [messId]);
  // Modify the existing useEffect to remove the initial fetch
  useEffect(() => {
    // If you want to keep any initial setup, add it here
  }, []);

  // Request notification permissions
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Notifications are disabled. Please enable them in settings. This will allow us to remind you about meal times and menu.');
      }
    };

    requestPermissions();
  }, []);

  // Modified notification scheduling function
  const scheduleMealNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  
    const mealTimes = [
      { meal: 'breakfast', hour: 7, minute: 25 },
      { meal: 'lunch', hour: 12, minute: 25 },
      { meal: 'snacks', hour: 16, minute: 40 },
      { meal: 'dinner', hour: 19, minute: 55 },
    ];
  
    const now = new Date();
  
    for (const { meal, hour, minute } of mealTimes) {
      try {
        const triggerDate = new Date(now);
        triggerDate.setHours(hour, minute, 0, 0);
  
        // Determine notification day (today or tomorrow)
        const isTomorrow = triggerDate <= now;
        const notificationDate = new Date(triggerDate);
        if (isTomorrow) notificationDate.setDate(notificationDate.getDate() + 1);
  
        // Get the day string for the notification day
        const notificationDay = getDayString(isTomorrow ? notificationDate : triggerDate);
  
        // Retrieve the menu for the notification day from AsyncStorage
        const storedMenu = await AsyncStorage.getItem(`@menu-${notificationDay}`);
        console.log('Stored menu:', storedMenu);
  
        let menuText = "Menu not available";
        if (storedMenu) {
          const menuData = JSON.parse(storedMenu);
          menuText = menuData[meal]?.map((dish: any) => dish.dish_name).join(', ') || "No dishes listed";
        }
  
        // Schedule notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `It's ${meal} time in 5 minutes!`,
            body: `Today's menu: ${menuText}`,
            sound: true,
          },
          trigger: {
            date: isTomorrow ? notificationDate : triggerDate,
            type: Notifications.SchedulableTriggerInputTypes.DATE
          },
        });
      } catch (error) {
        console.error(`Failed to schedule ${meal} notification:`, error);
      }
    }
  };

  // Redirect to the appropriate settings page based on user role
  const handleSettingsPress = () => {
    if (!studentId) {
      Alert.alert('Error', 'Student ID not found.');
      return;
    }

    if (userRole === 'owner') {
      router.push({
        pathname: '/settings/OwnerSettings',
        params: { student_id: studentId },
      });
    } else if (userRole === 'admin') {
      router.push({
        pathname: '/settings/AdminSettings',
        params: { student_id: studentId },
      });
    } else if (userRole === 'cr') {
      router.push({
        pathname: '/settings/CRSettings',
        params: { student_id: studentId },
      });
    } else {
      router.push({
        pathname: '/settings/UserSettings',
        params: { student_id: studentId },
      });
    }
  };

  // Fetch menu when currentDay or messId changes
  useEffect(() => {
    if (currentDay && messId) {
      fetchMenu();
    }
  }, [currentDay, messId]);

  const fetchMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner'];
      const fullMenuData: { [key: string]: { dish_name: string; type: string }[] } = {};

      for (const mealType of mealTypes) {
        const mealsResponse = await api.get('/meals', {
          params: { mess_id: messId, day: currentDay, meal_type: currentMeal },
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
      await storeMenuInStorage(fullMenuData); // Store in AsyncStorage
      setRefreshGraph(prev => !prev); // Toggle the refresh state
    } catch (error) {
      console.error('Failed to fetch menu:', error);
      setError('Failed to fetch menu. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get current day
  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndex = new Date().getDay();
    return days[dayIndex];
  };

  // Get current meal based on time
  const getCurrentMeal = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentDay = getCurrentDay();

    // Function to get the next day
    const getNextDay = () => {
      const nextDay = new Date(now);
      nextDay.setDate(now.getDate() + 1);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[nextDay.getDay()];
    };

    // Check for current meal
    if (hours >= 7 && hours < 10 && (hours !== 7 || minutes >= 30)) {
      return { meal: 'breakfast', day: currentDay };
    } else if (hours >= 12 && hours < 14 && (hours !== 12 || minutes >= 30)) {
      return { meal: 'lunch', day: currentDay };
    } else if (hours >= 16 && hours < 18 && (hours !== 16 || minutes >= 45)) {
      return { meal: 'snacks', day: currentDay };
    } else if (hours >= 20 && hours < 22) {
      return { meal: 'dinner', day: currentDay };
    } else {
      // Outside meal hours, determine the next meal
      if (hours < 7 || (hours === 22 && minutes >= 0) || hours >= 23) {
        // Before 7:00 AM or after 10:00 PM, next meal is breakfast
        return { meal: 'breakfast', day: hours >= 22 ? getNextDay() : currentDay };
      } else if ((hours >= 10 && hours < 12) || (hours === 12 && minutes < 30)) {
        // Between 10:00 AM and 12:30 PM, next meal is lunch
        return { meal: 'lunch', day: currentDay };
      } else if ((hours >= 14 && hours < 16) || (hours === 16 && minutes < 45)) {
        // Between 2:00 PM and 4:45 PM, next meal is snacks
        return { meal: 'snacks', day: currentDay };
      } else if ((hours >= 18 && hours < 20) || (hours === 20 && minutes < 0)) {
        // Between 6:00 PM and 8:00 PM, next meal is dinner
        return { meal: 'dinner', day: currentDay };
      }
    }

    // Default return (should not be reached)
    return { meal: 'breakfast', day: currentDay };
  };

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Fixed Header with Greeting and Buttons */}
      <View style={[styles.header, { backgroundColor }]}>
        <Text style={[styles.greeting, { color: textColor }]}>Hi, {userName}</Text>
        {/* Group buttons in a separate View */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchMenu}>
            <Ionicons name="refresh" size={28} color={tintColor} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
            <Ionicons name="settings" size={28} color={tintColor} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.themeToggleButton} onPress={toggleTheme}>
            <Ionicons name={theme === 'light' ? 'moon' : 'sunny'} size={28} color={tintColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>

          {/* Loading State */}
          {loading && <ActivityIndicator size="large" color={tintColor} />}

          {/* Error Message */}
          {error && <Text style={[styles.errorText, { color: 'red' }]}>{error}</Text>}

          {/* Current Meal Card */}
          {!loading && !error && (
            <MealCard
              mealType={currentMeal}
              dishes={fullMenu[currentMeal] || []}
              mealId={mealId}
              studentId={studentId}
            />
          )}

          {/* Rating Trend Graph */}
          <RatingTrendGraph
            mealType={currentMeal}
            messIds={messIds}
            messNames={messNames}
            key={refreshGraph ? 'refresh' : 'no-refresh'} // Add a key to force re-render
          />

          {/* See Full Mess Menu Button */}
          <TouchableOpacity style={[styles.fullMenuButton, { backgroundColor: tintColor }]} onPress={openModal}>
            <Text style={styles.fullMenuButtonText}>See Full Mess Menu</Text>
          </TouchableOpacity>

          {/* Day Picker Modal */}
          <DayPickerModal
            visible={isModalVisible}
            onClose={closeModal}
            messId={messId ? messId.toString() : ''}
          />
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    padding: 16,
    elevation: 5,
  },
  content: {
    paddingBottom: 50, // Adjust the padding to make space for the DayPickerModal
    paddingHorizontal: -26,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Adjust the gap between buttons
  },
  refreshButton: {
    padding: 4, // Reduced padding
    borderRadius: 20,
  },
  settingsButton: {
    padding: 4, // Reduced padding
    borderRadius: 20,
  },
  themeToggleButton: {
    padding: 4, // Reduced padding
    borderRadius: 20,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  fullMenuButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  fullMenuButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MenuScreen;