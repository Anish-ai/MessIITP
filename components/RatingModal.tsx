import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import Slider from '@react-native-community/slider'; // Import the Slider
import api from '../api';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  mealId: number | null;
  studentId: number | null;
  onRatingSubmit: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ visible, onClose, mealId, studentId, onRatingSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(3);
  const [feedbackText, setFeedbackText] = useState<string>('');

  const closeModal = () => {
    onClose();
  };

  const handleRatePress = async () => {
    if (!mealId || !studentId) {
      setError('Meal ID or Student ID is missing');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/ratings/submit', {
        student_id: studentId,
        meal_id: mealId,
        rating_score: ratingScore,
        feedback_text: feedbackText,
        rating_date: new Date().toISOString().split('T')[0],
      });

      if (response.status === 201) {
        onRatingSubmit();
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
            <Text style={styles.label}>Rating: {ratingScore.toFixed(1)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={5}
              step={0.1} // Allows decimal values like 1.1, 1.2, etc.
              value={ratingScore}
              onValueChange={(value) => setRatingScore(value)}
              minimumTrackTintColor="#007BFF"
              maximumTrackTintColor="#CCC"
              thumbTintColor="#007BFF"
            />

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
  slider: {
    width: '100%',
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