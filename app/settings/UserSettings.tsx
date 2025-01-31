import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LogoutButton from '../../components/LogoutButton';
import ChangeMess from '../../components/ChangeMess';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function NormalUserSettings() {
  const [isChangeMessModalVisible, setIsChangeMessModalVisible] = useState(false);
  
  const tintColor = useThemeColor({}, 'tint');

  const openChangeMessModal = () => {
    setIsChangeMessModalVisible(true);
  };

  const closeChangeMessModal = () => {
    setIsChangeMessModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Settings</Text>
      
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});