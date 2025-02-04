import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import LogoutButton from '../../components/LogoutButton';
import ChangeMess from '../../components/ChangeMess';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api';

interface StudentInfo {
  name: string;
  email: string;
  mess_id: number;
  registration_number: string;
  phone: string;
}

interface Mess {
  mess_id: number;
  mess_name: string;
}

const NormalUserSettings = () => {
  const [isChangeMessModalVisible, setIsChangeMessModalVisible] = useState(false);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [messes, setMesses] = useState<Mess[]>([]);
  const [messName, setMessName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state

  const { color: backgroundColor } = useThemeColor({}, 'background');
  const { color: textColor } = useThemeColor({}, 'text');
  const { color: tintColor } = useThemeColor({}, 'tint');
  const { color: cardBackground } = useThemeColor({}, 'cardBackground');
  const { color: borderColor } = useThemeColor({}, 'border');

  const { student_id } = useLocalSearchParams<{ student_id: string }>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch student info
        const studentResponse = await api.get(`/students/${student_id}`);
        setStudentInfo(studentResponse.data);
  
        // Fetch all messes
        const messesResponse = await api.get('/mess/all'); // Use the same endpoint as Admin Settings
        setMesses(messesResponse.data);
  
        // Find the mess name using mess_id
        if (studentResponse.data.mess_id) {
          const mess = messesResponse.data.find((m: Mess) => m.mess_id === studentResponse.data.mess_id);
          setMessName(mess ? mess.mess_name : 'Not assigned');
        } else {
          setMessName('Not assigned');
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        Alert.alert('Error', 'Failed to fetch data');
      } finally {
        setIsLoading(false); // Stop loading after fetching data
      }
    };
  
    fetchData();
  }, [student_id]);

  const openChangeMessModal = () => setIsChangeMessModalVisible(true);
  const closeChangeMessModal = () => setIsChangeMessModalVisible(false);

  const InfoItem = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoItem}>
      <Text style={[styles.infoLabel, { color: textColor }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: textColor }]}>{value}</Text>
    </View>
  );

  // Show loading indicator while fetching data
  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: cardBackground }]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={28} color={tintColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>User Settings</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Student Profile Card */}
        {studentInfo && (
          <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>Student Profile</Text>
            <InfoItem label="Name" value={studentInfo.name} />
            <InfoItem label="Email" value={studentInfo.email} />
            <InfoItem label="Mess" value={messName || 'Not assigned'} />
          </View>
        )}

        {/* User Actions Card */}
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>User Actions</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: tintColor }]}
            onPress={openChangeMessModal}
          >
            <Ionicons name="restaurant-outline" size={24} color="#FFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Change Mess</Text>
          </TouchableOpacity>

          <LogoutButton style={styles.logoutButton} />
        </View>
      </ScrollView>

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
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  closeButton: {
    position: 'absolute',
    left: 16,
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  logoutButton: {
    marginTop: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NormalUserSettings;