import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useThemeColor } from '@/hooks/useThemeColor';
import api from '../../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import Bgdarksign from '../../components/Bgdarksign';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [roll_no, setRollNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mess_id, setMessId] = useState(2);

  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isRollNoFocused, setIsRollNoFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isPickerFocused, setIsPickerFocused] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const unfocusedColor = useThemeColor({}, 'unfocused');

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
      <View style={styles.backgroundContainer}>
        <Bgdarksign width="100%" height="100%" style={styles.svg} />
      </View>

      <View style={styles.loginForm}>
        <Text style={[styles.title, { color: textColor }]}>Let's get started !</Text>
        <Text style={[styles.titleDes]}>Create an account</Text>

        <View style={styles.inputContainer}>
          <MaterialIcons
            name="person"
            size={24}
            color={isNameFocused ? tintColor : unfocusedColor}
            style={styles.icon}
          />
          <TextInput
            style={[
              styles.input,
              {
                color: textColor,
                borderBottomColor: isNameFocused ? tintColor : unfocusedColor,
              },
            ]}
            placeholder="Name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            onFocus={() => setIsNameFocused(true)}
            onBlur={() => setIsNameFocused(false)}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons
            name="badge"
            size={24}
            color={isRollNoFocused ? tintColor : unfocusedColor}
            style={styles.icon}
          />
          <TextInput
            style={[
              styles.input,
              {
                color: textColor,
                borderBottomColor: isRollNoFocused ? tintColor : unfocusedColor,
              },
            ]}
            placeholder="Roll No"
            placeholderTextColor="#999"
            value={roll_no}
            onChangeText={setRollNo}
            onFocus={() => setIsRollNoFocused(true)}
            onBlur={() => setIsRollNoFocused(false)}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons
            name="email"
            size={24}
            color={isEmailFocused ? tintColor : unfocusedColor}
            style={styles.icon}
          />
          <TextInput
            style={[
              styles.input,
              {
                color: textColor,
                borderBottomColor: isEmailFocused ? tintColor : unfocusedColor,
              },
            ]}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setIsEmailFocused(true)}
            onBlur={() => setIsEmailFocused(false)}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons
            name="lock"
            size={24}
            color={isPasswordFocused ? tintColor : unfocusedColor}
            style={styles.icon}
          />
          <TextInput
            style={[
              styles.input,
              {
                color: textColor,
                borderBottomColor: isPasswordFocused ? tintColor : unfocusedColor,
              },
            ]}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
          />
        </View>

        <View
          style={[
            styles.pickerContainer,
            {
              borderColor: isPickerFocused ? tintColor : unfocusedColor,
            },
          ]}
        >
          <Picker
            selectedValue={mess_id}
            onValueChange={(itemValue) => setMessId(itemValue)}
            style={{ color: textColor }}
            onFocus={() => setIsPickerFocused(true)}
            onBlur={() => setIsPickerFocused(false)}
            dropdownIconColor={tintColor}
            mode="dropdown"
          >
            <Picker.Item 
              label="CV Raman" 
              value={2} 
              style={{ 
                color: textColor,
                backgroundColor: backgroundColor, // Add background color here
              }} 
            />
            <Picker.Item 
              label="Asima" 
              value={3} 
              style={{ 
                color: textColor,
                backgroundColor: backgroundColor 
              }} 
            />
            <Picker.Item 
              label="Kalam Mess 3" 
              value={4} 
              style={{ 
                color: textColor,
                backgroundColor: backgroundColor 
              }} 
            />
            <Picker.Item 
              label="Kalam Mess 4" 
              value={5} 
              style={{ 
                color: textColor,
                backgroundColor: backgroundColor 
              }} 
            />
            <Picker.Item 
              label="Aryabhatta Mess 5" 
              value={6} 
              style={{ 
                color: textColor,
                backgroundColor: backgroundColor 
              }} 
            />
            <Picker.Item 
              label="Aryabhatta Mess 6" 
              value={7} 
              style={{ 
                color: textColor,
                backgroundColor: backgroundColor 
              }} 
            />
          </Picker>
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: tintColor }]} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={styles.linkContainer}>
            <Text style={[styles.linkText]}>Already have an account? Login</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    position: 'relative',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  svg: {
    opacity: 0.5,
  },
  loginForm: {
    zIndex: 1,
  },
  title: {
    marginTop: -30,
    fontSize: 35,
    fontWeight: 'bold',
    marginBottom: 16,
    width: '50%',
  },
  titleDes: {
    fontSize: 15,
    color: '#999',
    marginBottom: 35,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderBottomWidth: 1,
    paddingHorizontal: 0,
    marginVertical: 10,
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
  linkContainer: {
    width: '100%',
    alignItems: 'center',
  },
  linkText: {
    textAlign: 'center',
    marginTop: 16,
    color: 'grey',
  },
});