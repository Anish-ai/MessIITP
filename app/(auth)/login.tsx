import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import api from '../../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Bgdarksvg from '../../components/Bgdarksvg'; // Ensure this is imported correctly
import { MaterialIcons } from '@expo/vector-icons'; // Import icons

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const { color: backgroundColor, theme, toggleTheme } = useThemeColor({}, 'background');
  const { color: textColor } = useThemeColor({}, 'text');
  const { color: tintColor } = useThemeColor({}, 'tint');
  const { color: cardBackground } = useThemeColor({}, 'cardBackground');
  const { color: borderColor } = useThemeColor({}, 'border');
  const { color: unfocusedColor } = useThemeColor({}, 'unfocused');

  const handleLogin = async () => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('student_id', response.data.student_id.toString());
        router.replace('/menu');
      } else {
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Background SVG */}
      <View style={styles.backgroundContainer}>
        <Bgdarksvg width="100%" height="100%" style={styles.svg} />
      </View>

      {/* Login Form */}
      <View style={styles.loginForm}>
        <Text style={[styles.title, { color: textColor }]}>Welcome Back !</Text>
        <Text style={[styles.titleDes]}>Login to continue</Text>

        {/* Email Input with Icon */}
        <View style={styles.inputContainer}>
          <MaterialIcons
            name="email"
            size={24}
            color={isEmailFocused ? tintColor : unfocusedColor} // Change icon color on focus
            style={styles.icon}
          />
          <TextInput
            style={[
              styles.input,
              {
                color: textColor,
                borderBottomColor: isEmailFocused ? tintColor : unfocusedColor, // Change border color on focus
              },
            ]}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setIsEmailFocused(true)} // Set focus state to true
            onBlur={() => setIsEmailFocused(false)} // Set focus state to false
          />
        </View>

        {/* Password Input with Icon */}
        <View style={styles.inputContainer}>
          <MaterialIcons
            name="lock"
            size={24}
            color={isPasswordFocused ? tintColor : unfocusedColor} // Change icon color on focus
            style={styles.icon}
          />
          <TextInput
            style={[
              styles.input,
              {
                color: textColor,
                borderBottomColor: isPasswordFocused ? tintColor : unfocusedColor, // Change border color on focus
              },
            ]}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onFocus={() => setIsPasswordFocused(true)} // Set focus state to true
            onBlur={() => setIsPasswordFocused(false)} // Set focus state to false
          />
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: tintColor }]} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <Link href="/(auth)/signup" asChild>
          <TouchableOpacity style={styles.linkContainer}>
            <Text style={[styles.linkText]}>Don't have an account? Sign Up</Text>
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
    top: 0,
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    marginTop: 40,
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
    width: '100%', // Ensure the container takes full width
    alignItems: 'center', // Center the Text horizontally
  },
  linkText: {
    textAlign: 'center', // Center the text within its container
    marginTop: 16,
    color: 'grey', // Use the primary color for the link
  },
});