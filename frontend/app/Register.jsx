import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';

const Register = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await fetch('YOUR_API_URL/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        navigation.navigate('Login');
      } else {
        const data = await response.json();
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="px-4 my-4 py-12 max-w-md w-full mx-auto">
        <Text className="text-center text-3xl font-bold text-gray-900">
          Create your account
        </Text>

        {error ? <Text className="text-red-500 text-center text-sm mt-2">{error}</Text> : null}

        <View className="space-y-4 mt-6">
          <TextInput
            className="w-full h-16 my-4 px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900"
            placeholder="Username"
            placeholderTextColor="gray"
            value={formData.username}
            onChangeText={(text) => setFormData({ ...formData, username: text })}
          />

          <TextInput
            className="w-full h-16 my-4 px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900"
            placeholder="Email address"
            placeholderTextColor="gray"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
          />

          <TextInput
            className="w-full h-16 my-4 px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900"
            placeholder="Password"
            placeholderTextColor="gray"
            secureTextEntry
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
          />

          <View className="w-full my-4 h-16 border border-gray-300 rounded-md bg-white justify-center px-3">
            <Picker
              selectedValue={formData.role}
              onValueChange={(itemValue) => setFormData({ ...formData, role: itemValue })}
            >
              <Picker.Item label="Select your role" value="" />
              <Picker.Item label="Engineer" value="engineer" />
              <Picker.Item label="City Planner" value="cityPlanner" />
              <Picker.Item label="Doctor" value="doctor" />
              <Picker.Item label="Architect" value="architect" />
              <Picker.Item label="Environmentalist" value="environmentalist" />
              <Picker.Item label="Citizen" value="citizen" />
            </Picker>
          </View>

          <TouchableOpacity onPress={handleSubmit} className="w-full bg-emerald-700 py-4 rounded-full items-center shadow-md mt-6">
              <Text className="text-white text-center font-medium text-lg">Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default Register;
