import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Animated } from 'react-native';
import Slider from '@react-native-community/slider';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
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

  const { color: backgroundColor } = useThemeColor({}, 'background');
  const { color: textColor } = useThemeColor({}, 'text');
  const { color: tintColor } = useThemeColor({}, 'tint');
  const { color: cardBackground } = useThemeColor({}, 'cardBackground');
  const { color: borderColor } = useThemeColor({}, 'border');

  const getRatingEmoji = (score: number) => {
    if (score <= 1.5) return '😢';
    if (score <= 2.5) return '😕';
    if (score <= 3.5) return '😊';
    if (score <= 4.5) return '😄';
    return '🤩';
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
        onClose();
        setFeedbackText('');
        setRatingScore(3);
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
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: cardBackground }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Rate Today's Meal</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          <View style={styles.ratingDisplay}>
            <Text style={styles.emojiRating}>{getRatingEmoji(ratingScore)}</Text>
            <Text style={[styles.ratingScore, { color: textColor }]}>
              {ratingScore.toFixed(1)}
            </Text>
          </View>

          <View style={styles.sliderContainer}>
            <View style={styles.sliderLabels}>
              <Text style={[styles.sliderLabel, { color: textColor }]}>Poor</Text>
              <Text style={[styles.sliderLabel, { color: textColor }]}>Excellent</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={5}
              step={0.1}
              value={ratingScore}
              onValueChange={setRatingScore}
              minimumTrackTintColor={tintColor}
              maximumTrackTintColor={borderColor}
              thumbTintColor={tintColor}
            />
          </View>

          <View style={styles.feedbackSection}>
            <Text style={[styles.feedbackLabel, { color: textColor }]}>
              Share your thoughts (optional):
            </Text>
            <TextInput
              style={[styles.feedbackInput, { 
                color: textColor, 
                borderColor, 
                backgroundColor: backgroundColor 
              }]}
              multiline
              numberOfLines={4}
              value={feedbackText}
              onChangeText={setFeedbackText}
              placeholder="How was your meal? What could be improved?"
              placeholderTextColor={borderColor}
            />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: tintColor },
              loading && styles.submitButtonDisabled
            ]}
            onPress={handleRatePress}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Submitting...' : 'Submit Rating'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 24,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  ratingDisplay: {
    alignItems: 'center',
    marginVertical: 16,
  },
  emojiRating: {
    fontSize: 64,
    marginBottom: 8,
  },
  ratingScore: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  sliderContainer: {
    marginVertical: 16,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 14,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  feedbackSection: {
    marginVertical: 16,
  },
  feedbackLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  feedbackInput: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC3545',
    fontSize: 14,
    textAlign: 'center',
  },
  submitButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RatingModal;