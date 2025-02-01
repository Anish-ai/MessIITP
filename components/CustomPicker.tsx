import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';

interface Option {
  value: string | number;
  label: string;
}

interface CustomPickerProps {
  options: Option[];
  selectedValue: string | number;
  onValueChange: (value: string | number) => void;
  placeholder: string;
}

const CustomPicker: React.FC<CustomPickerProps> = ({ options, selectedValue, onValueChange, placeholder }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedLabel = options.find((item) => item.value === selectedValue)?.label || placeholder;

  return (
    <View>
      {/* Picker Button */}
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.pickerButton}>
        <Text style={styles.pickerButtonText}>{selectedLabel}</Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      {/* Modal for Picker Options */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.optionsContainer}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    onValueChange(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 16,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  arrow: {
    fontSize: 12,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  optionsContainer: {
    width: '80%',
    backgroundColor: '#fff', // Background color of the options table
    borderRadius: 10,
    maxHeight: 300,
  },
  optionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    color: '#333', // Text color of the options
  },
});

export default CustomPicker;