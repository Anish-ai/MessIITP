import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import LogoutButton from '../../components/LogoutButton';
import ChangeMess from '../../components/ChangeMess';
import { useThemeColor } from '@/hooks/useThemeColor';

const AdminSettings = () => {
  const [isChangeMessModalVisible, setIsChangeMessModalVisible] = useState(false);
    
    const tintColor = useThemeColor({}, 'tint');
  
    const openChangeMessModal = () => {
      setIsChangeMessModalVisible(true);
    };
  
    const closeChangeMessModal = () => {
      setIsChangeMessModalVisible(false);
    };
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
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: tintColor }]} 
        onPress={openChangeMessModal}
      >
        <Text style={[styles.buttonText, { color: '#fff' }]}>Change Mess</Text>
      </TouchableOpacity>
      
      <LogoutButton />

      <ChangeMess 
        isVisible={isChangeMessModalVisible} 
        onClose={closeChangeMessModal} 
      />
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