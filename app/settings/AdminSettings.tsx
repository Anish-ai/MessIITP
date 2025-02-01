//app/settings/AdminSettings
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import LogoutButton from '../../components/LogoutButton';
import ChangeMess from '../../components/ChangeMess';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';

const AdminSettings = () => {
  const [isChangeMessModalVisible, setIsChangeMessModalVisible] = useState(false);
  const tintColor = useThemeColor({}, 'tint');
  const { student_id } = useLocalSearchParams<{ student_id: string }>();

  const openChangeMessModal = () => setIsChangeMessModalVisible(true);
  const closeChangeMessModal = () => setIsChangeMessModalVisible(false);

  const handleChangeMenuPress = () => {
    if (!student_id) {
      Alert.alert('Error', 'Student ID not found.');
      return;
    }
    router.push({ pathname: '/settings/ChangeMenuPage', params: { student_id } });
  };

  return (
    <View style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back() }>
        <Ionicons name="close" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>Admin Settings</Text>
      
      {/* Change Mess Button */}
      <TouchableOpacity style={[styles.button, { backgroundColor: tintColor }]} onPress={openChangeMessModal}>
        <Text style={styles.buttonText}>Change Mess</Text>
      </TouchableOpacity>
      
      {/* Change Mess Menu Button */}
      <TouchableOpacity style={styles.button} onPress={handleChangeMenuPress}>
        <Text style={styles.buttonText}>Change Mess Menu</Text>
      </TouchableOpacity>
      
      {/* Logout Button */}
      <LogoutButton />
      
      {/* Change Mess Modal */}
      <ChangeMess isVisible={isChangeMessModalVisible} onClose={closeChangeMessModal} />
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
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
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
    marginVertical: 8,
    width: '80%',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminSettings;
