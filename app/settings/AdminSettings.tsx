import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

const AdminSettings = () => {
  const { student_id } = useLocalSearchParams<{ student_id: string }>();

  const handleChangeMenuPress = () => {
    if (!student_id) {
      Alert.alert('Error', 'Student ID not found.');
      return;
    }

    // Navigate to the ChangeMenuPage with student_id
    router.push({
      pathname: '/settings/ChangeMenuPage',
      params: { student_id },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Settings</Text>

      {/* Change Menu Button */}
      <TouchableOpacity style={styles.button} onPress={handleChangeMenuPress}>
        <Text style={styles.buttonText}>Change Mess Menu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminSettings;