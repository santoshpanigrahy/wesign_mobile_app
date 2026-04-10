import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';

const DATA = [
  { id: '1', label: 'Option 1' },
  { id: '2', label: 'Option 2' },
  { id: '3', label: 'Option 3' },
];

const AppDropdown = () => {
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const onSelect = (item) => {
    setSelected(item);
    setOpen(false);
  };

  return (
    <View style={styles.container}>
      
      {/* 🔽 Dropdown Header */}
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setOpen(!open)}
      >
        <Text>
          {selected ? selected.label : 'Select option'}
        </Text>
      </TouchableOpacity>

      {/* 🔥 Dropdown List */}
      {open && (
        <View style={styles.list}>
          <FlatList
            data={DATA}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => onSelect(item)}
              >
                <Text>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default AppDropdown;

const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
  dropdown: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  list: {
    borderWidth: 1,
    marginTop: 5,
    borderRadius: 8,
    maxHeight: 150,
    backgroundColor: '#fff',
  },
  item: {
    padding: 12,
    borderBottomWidth: 0.5,
  },
});