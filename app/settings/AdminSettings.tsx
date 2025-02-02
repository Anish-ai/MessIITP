import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import LogoutButton from '../../components/LogoutButton';
import ChangeMess from '../../components/ChangeMess';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api';

interface StudentInfo {
  name: string;
  email: string;
  mess_id: number;
  registration_number: string;
  phone: string;
}

const AdminSettings = () => {
  const [isChangeMessModalVisible, setIsChangeMessModalVisible] = useState(false);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);

  const { color: backgroundColor } = useThemeColor({}, 'background');
  const { color: textColor } = useThemeColor({}, 'text');
  const { color: tintColor } = useThemeColor({}, 'tint');
  const { color: cardBackground } = useThemeColor({}, 'cardBackground');
  const { color: borderColor } = useThemeColor({}, 'border');

  const { student_id } = useLocalSearchParams<{ student_id: string }>();

  useEffect(() => {
    fetchStudentInfo();
  }, [student_id]);

  const fetchStudentInfo = async () => {
    try {
      const response = await api.get(`/students/${student_id}`);
      setStudentInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch student info:', error);
      Alert.alert('Error', 'Failed to fetch student information');
    }
  };

  const openChangeMessModal = () => setIsChangeMessModalVisible(true);
  const closeChangeMessModal = () => setIsChangeMessModalVisible(false);

  const handleChangeMenuPress = () => {
    if (!student_id) {
      Alert.alert('Error', 'Student ID not found.');
      return;
    }
    router.push({ pathname: '/settings/ChangeMenuPage', params: { student_id } });
  };

  const InfoItem = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoItem}>
      <Text style={[styles.infoLabel, { color: textColor }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: textColor }]}>{value}</Text>
    </View>
  );

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
        <Text style={[styles.title, { color: textColor }]}>Admin Settings</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Student Info Card */}
        {studentInfo && (
          <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>Student Information</Text>
            <InfoItem label="Name" value={studentInfo.name} />
            <InfoItem label="Email" value={studentInfo.email} />
            <InfoItem label="Registration" value={studentInfo.registration_number} />
            <InfoItem label="Phone" value={studentInfo.phone || 'Not provided'} />
            <InfoItem label="Mess ID" value={studentInfo.mess_id.toString()} />
          </View>
        )}

        {/* Admin Actions Card */}
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>Admin Actions</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: tintColor }]}
            onPress={openChangeMessModal}
          >
            <Ionicons name="restaurant-outline" size={24} color="#FFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Change Mess</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: tintColor }]}
            onPress={handleChangeMenuPress}
          >
            <Ionicons name="menu-outline" size={24} color="#FFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Modify Menu</Text>
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

export default AdminSettings;