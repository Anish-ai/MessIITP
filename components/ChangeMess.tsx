import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import api from '../api';

interface Mess {
  mess_id: number;
  mess_name: string;
}

interface ChangeMessProps {
  onClose: () => void;
  isVisible: boolean;
}

const ChangeMess: React.FC<ChangeMessProps> = ({ onClose, isVisible }) => {
  const [messes, setMesses] = useState<Mess[]>([]);
  const [selectedMess, setSelectedMess] = useState<number | null>(null);
  const [currentMessId, setCurrentMessId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const { color: backgroundColor } = useThemeColor({}, 'background');
  const { color: textColor } = useThemeColor({}, 'text');
  const { color: tintColor } = useThemeColor({}, 'tint');
  const { color: cardBackground } = useThemeColor({}, 'cardBackground');
  const { color: borderColor } = useThemeColor({}, 'border');

  useEffect(() => {
    if (isVisible) {
      fetchCurrentMess();
      fetchMesses();
    }
  }, [isVisible]);

  const fetchCurrentMess = async () => {
    try {
      const studentId = await AsyncStorage.getItem('student_id');
      const response = await api.get(`/students/${studentId}`);
      setCurrentMessId(response.data.mess_id);
    } catch (error) {
      console.error('Failed to fetch current mess', error);
    }
  };

  const fetchMesses = async () => {
    try {
      const response = await api.get('/mess/all');
      const filteredMesses = response.data.filter((mess: Mess) => mess.mess_id !== 1);
      setMesses(filteredMesses);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch mess options');
    }
  };  

  const handleChangeMess = async () => {
    if (!selectedMess) {
      Alert.alert('Error', 'Please select a mess');
      return;
    }

    setLoading(true);
    try {
      const studentId = await AsyncStorage.getItem('student_id');

      await api.put(`/students/${studentId}/mess`, {
        mess_id: selectedMess
      });

      Alert.alert(
        'Success',
        'Mess changed successfully',
        [{
          text: 'OK',
          onPress: () => {
            onClose();
            setSelectedMess(null);
          }
        }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to change mess');
    } finally {
      setLoading(false);
    }
  };

  const renderMessItem = ({ item }: { item: Mess }) => {
    const isSelected = selectedMess === item.mess_id;
    const isCurrent = currentMessId === item.mess_id;

    return (
      <TouchableOpacity
        style={[
          styles.messItem,
          { borderColor },
          isSelected && [styles.selectedMessItem, { borderColor: tintColor }],
          isCurrent && styles.currentMessItem
        ]}
        onPress={() => setSelectedMess(item.mess_id)}
        disabled={loading}
      >
        <View style={styles.messItemContent}>
          <Text style={[
            styles.messItemText,
            { color: textColor },
            (isSelected || isCurrent) && { fontWeight: 'bold' }
          ]}>
            {item.mess_name}
          </Text>

          {isCurrent && (
            <View style={[styles.currentBadge, { backgroundColor: tintColor }]}>
              <Text style={styles.currentBadgeText}>Current</Text>
            </View>
          )}
        </View>

        {isSelected && (
          <View style={[styles.checkmark, { backgroundColor: tintColor }]}>
            <Ionicons name="checkmark" size={20} color="#FFF" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: cardBackground }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Change Your Mess
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={loading}
            >
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: textColor }]}>
            Select a new mess from the options below
          </Text>

          <FlatList
            data={messes}
            renderItem={renderMessItem}
            keyExtractor={(item) => item.mess_id.toString()}
            contentContainerStyle={styles.messList}
            showsVerticalScrollIndicator={false}
          />

          <TouchableOpacity
            style={[
              styles.confirmButton,
              { backgroundColor: tintColor },
              (!selectedMess || selectedMess === currentMessId || loading) &&
              styles.confirmButtonDisabled
            ]}
            onPress={handleChangeMess}
            disabled={!selectedMess || selectedMess === currentMessId || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.confirmButtonText}>
                Confirm Change
              </Text>
            )}
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
    maxHeight: '80%',
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
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  messList: {
    marginBottom: 24,
  },
  messItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  messItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messItemText: {
    fontSize: 16,
  },
  selectedMessItem: {
    borderWidth: 2,
  },
  currentMessItem: {
    borderWidth: 2,
  },
  currentBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  currentBadgeText: {
    color: '#FFF',
    fontSize: 12,
  },
  checkmark: {
    padding: 8,
    borderRadius: 12,
  },
  confirmButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangeMess;