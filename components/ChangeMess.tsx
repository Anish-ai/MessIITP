import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Alert, 
  Modal 
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';

interface Mess {
  mess_id: number;
  mess_name: string;
}

interface ChangeMessProps {
  onClose: () => void;
  isVisible: boolean;
}

export default function ChangeMess({ onClose, isVisible }: ChangeMessProps) {
  const [messes, setMesses] = useState<Mess[]>([]);
  const [selectedMess, setSelectedMess] = useState<number | null>(null);
  const [currentMessId, setCurrentMessId] = useState<number | null>(null);
  
  const { color: textColor } = useThemeColor({}, 'text');
  const { color: tintColor } = useThemeColor({}, 'tint');

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
      setMesses(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch mess options');
    }
  };

  const handleChangeMess = async () => {
    if (!selectedMess) {
      Alert.alert('Error', 'Please select a mess');
      return;
    }

    try {
      const studentId = await AsyncStorage.getItem('student_id');
      
      await api.put(`/students/${studentId}/mess`, { 
        mess_id: selectedMess 
      });
      console.log('Current mess:', selectedMess);

      Alert.alert('Success', 'Mess changed successfully', [
        { 
          text: 'OK', 
          onPress: () => {
            onClose();
            setSelectedMess(null);
          }
        }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to change mess');
    }
  };

  const renderMessItem = ({ item }: { item: Mess }) => (
    <TouchableOpacity
      style={[
        styles.messItem,
        (selectedMess === item.mess_id || currentMessId === item.mess_id) && { 
          backgroundColor: tintColor,
          borderColor: tintColor 
        }
      ]}
      onPress={() => setSelectedMess(item.mess_id)}
    >
      <Text 
        style={[
          styles.messItemText, 
          (selectedMess === item.mess_id || currentMessId === item.mess_id) && { color: '#fff' }
        ]}
      >
        {item.mess_name}
        {currentMessId === item.mess_id && ' (Current)'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: '#fff' }]}>
          <Text style={[styles.title, { color: textColor }]}>
            Select Your Mess
          </Text>
          
          <FlatList
            data={messes}
            renderItem={renderMessItem}
            keyExtractor={(item) => item.mess_id.toString()}
            extraData={[selectedMess, currentMessId]}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#999', marginRight: 8 }]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button, 
                { 
                  backgroundColor: selectedMess && selectedMess !== currentMessId ? tintColor : '#ccc',
                  opacity: selectedMess && selectedMess !== currentMessId ? 1 : 0.5 
                }
              ]}
              onPress={handleChangeMess}
              disabled={!selectedMess || selectedMess === currentMessId}
            >
              <Text style={styles.buttonText}>Change Mess</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '70%',
    borderRadius: 10,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  messItem: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    borderColor: '#ccc',
  },
  messItemText: {
    textAlign: 'center',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});