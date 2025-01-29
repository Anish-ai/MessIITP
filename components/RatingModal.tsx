// components/RatingModal.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../api';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  mealId: number | null;
  studentId: number | null;
}

const RatingModal: React.FC<RatingModalProps> = ({ visible, onClose, mealId, studentId }) => {
  const [isModalVisible, setIsModalVisible] = useState(visible);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(3);
  const [feedbackText, setFeedbackText] = useState<string>('');

  const closeModal = () => {
    setIsModalVisible(false);
    onClose();
  };

  const handleRatePress = async () => {
    if (!mealId || !studentId) {
      setError('Meal ID or Student ID is missing');
      return;
    }
    console.log('mealId:', mealId);
    console.log('studentId:', studentId);

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/ratings/submit', {
        student_id: studentId,
        meal_id: mealId,
        rating_score: ratingScore,
        feedback_text: feedbackText,
        rating_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      });

      if (response.status === 201) {
        closeModal();
      } else {
        setError('Failed to submit rating');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Rate Today's Meal</Text>
          <View style={styles.rateInputBox}>
            <Text style={styles.label}>Rating:</Text>
            <Picker
              selectedValue={ratingScore}
              onValueChange={(itemValue) => setRatingScore(itemValue)}
              style={styles.picker}
            >
              {[1, 2, 3, 4, 5].map((score) => (
                <Picker.Item key={score} label={`${score} Star${score > 1 ? 's' : ''}`} value={score} />
              ))}
            </Picker>

            <Text style={styles.label}>Feedback:</Text>
            <TextInput
              style={styles.feedbackInput}
              multiline
              numberOfLines={4}
              value={feedbackText}
              onChangeText={setFeedbackText}
              placeholder="Enter your feedback..."
            />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity style={styles.submitButton} onPress={handleRatePress}>
            <Text style={styles.submitButtonText}>Submit Rating</Text>
          </TouchableOpacity>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
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
    backgroundColor: '#FFF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  rateInputBox: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  picker: {
    marginBottom: 16,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RatingModal;