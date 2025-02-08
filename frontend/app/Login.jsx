import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from "expo-router";

const Login = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    // try {
    //   const response = await fetch('YOUR_API_URL/api/register', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(formData),
    //   });

    //   if (response.ok) {
    //     navigation.navigate('Login');
    //   } else {
    //     const data = await response.json();
    //     setError(data.message || 'Registration failed');
    //   }
    // } catch (err) {
    //   setError('Something went wrong. Please try again.');
    // }
    router.push("/home")
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="px-4 my-4 py-12 max-w-md w-full mx-auto">
        <Text className="text-center text-3xl font-bold text-gray-900">
          Login to your account
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
            placeholder="Password"
            placeholderTextColor="gray"
            secureTextEntry
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
          />

          <TouchableOpacity onPress={handleSubmit} className="w-full bg-emerald-700 py-4 rounded-full items-center shadow-md mt-6">
            <Text className="text-white text-center font-medium text-lg">Login</Text>
          </TouchableOpacity>

          <Text className="text-center text-gray-500 mt-4">Don't have an account? <Text onPress={() => navigation.navigate('Register')} className="text-emerald-700">Register</Text></Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default Login;
