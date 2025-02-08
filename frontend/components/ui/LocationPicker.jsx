import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';  // For location icon

const LocationPicker = ({ setLocation }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationText, setLocationText] = useState('');

  const handleGetLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access location was denied');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setCurrentLocation(location.coords);
    setLocation(location.coords);

    // Update the input field with "Current Location"
    setLocationText('Current Location');
  };

  return (
    <View className="my-4">
      {/* Input Field for Location */}
      <View className="flex-row items-center border border-gray-300 p-3 rounded-xl bg-white shadow-sm w-full">
        <TextInput
          placeholder="Enter your location"
          value={locationText}
          onChangeText={setLocationText}
          editable={false}  // Make the input non-editable
          className="flex-1"
        />
        
        {/* Location Icon */}
        <TouchableOpacity onPress={handleGetLocation} className="ml-2">
          <Ionicons name="location-sharp" size={24} color="green" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LocationPicker;
