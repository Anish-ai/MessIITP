// app/(auth)/signup.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useThemeColor } from '@/hooks/useThemeColor';
import api from '../../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [roll_no, setRollNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mess_id, setMessId] = useState(2);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const handleSignup = async () => {
    try {
      const response = await api.post('/auth/register', { name, roll_no, email, password, mess_id });
      if (response.data.message) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('student_id', response.data.student_id.toString());
        router.replace('/menu');
      }
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: tintColor }]}>Sign Up</Text>
      <TextInput
        style={[styles.input, { color: textColor, borderColor: tintColor }]}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input, { color: textColor, borderColor: tintColor }]}
        placeholder="Roll No"
        value={roll_no}
        onChangeText={setRollNo}
      />
      <TextInput
        style={[styles.input, { color: textColor, borderColor: tintColor }]}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={[styles.input, { color: textColor, borderColor: tintColor }]}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <View style={[styles.pickerContainer, { borderColor: tintColor }]}>
        <Picker
          selectedValue={mess_id}
          onValueChange={(itemValue) => setMessId(itemValue)}
          style={{ color: textColor }}
        >
          <Picker.Item label="CV Raman" value={2} />
          <Picker.Item label="Asima" value={3} />
          <Picker.Item label="Kalam Mess 3" value={4} />
          <Picker.Item label="Kalam Mess 4" value={5} />
          <Picker.Item label="Aryabhatta Mess 5" value={6} />
          <Picker.Item label="Aryabhatta Mess 6" value={7} />
        </Picker>
      </View>
      <TouchableOpacity style={[styles.button, { backgroundColor: tintColor }]} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <Link href="/(auth)/login" asChild>
        <Text style={[styles.linkText, { color: tintColor }]}>Already have an account? Login</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    textAlign: 'center',
    marginTop: 16,
  },
});