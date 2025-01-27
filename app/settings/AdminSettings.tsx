import { View, Text, StyleSheet } from 'react-native';
import LogoutButton from '../../components/LogoutButton';

export default function AdminSettings() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Settings</Text>
      <LogoutButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});