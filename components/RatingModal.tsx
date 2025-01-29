// components/RatingModal.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../api';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ visible, onClose}) => {
  const [isModalVisible, setIsModalVisible] = useState(visible);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const closeModal = () => {
    setIsModalVisible(false);
    }
    const handleRatePress = () => {
        setIsModalVisible(true);
      };

  // Fetch full mess menu for the selected day
  

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
      <TouchableOpacity style={styles.closeButton} onPress={handleRatePress}>
            <Text style={styles.closeButtonText}>Open</Text>
          </TouchableOpacity>
            <RatingModal
                    visible={isModalVisible}
                    onClose={closeModal}
                  />
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
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

export default RatingModal;