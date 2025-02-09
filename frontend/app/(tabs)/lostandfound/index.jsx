import React, {useState} from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, Alert, Image, SafeAreaView, ScrollView } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import LottieView from 'lottie-react-native';
import { router } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import LocationPicker from '../../../components/ui/LocationPicker';
import CaptureImage from '../../../components/ui/CaptureImage';
import axios from 'axios';

export default function LostAndFound() {
  const [imageUri, setImageUri] = useState(null);
  const [location, setLocation] = useState(null);
  const [description, setDescription] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const handleSubmit = async () => {
    if (!location || !description) {
      Alert.alert('Error', 'Please provide all the details');
      return;
    }
  
    try {
      console.log('Sending data:', { description, location }); // Debug log
      const response = await axios.post(
        'https://8e96-103-104-226-58.ngrok-free.app/api/item-lost',
        {
          description,
          location
        },
        {
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
        }
      );
  
      console.log('Response:', response.data); // Debug log
      Alert.alert('Success', 'Lost item reported successfully');
      setModalVisible(false);
    } catch (error) {
      console.error('Error details:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.error || 'There was an issue reporting the problem');
    }
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Lottie Animation */}
        <View className="items-center justify-center mt-6 mb-2">
          <LottieView
            source={{ uri: 'https://lottie.host/98c51c57-6bcf-43ee-ada6-d7934f486a09/LXd8vLyxsV.lottie' }}
            autoPlay
            loop
            style={{ width: 250, height: 250 }}
          />
        </View>

        {/* Options Container */}
        <View className="px-6 space-y-5">
          <TouchableOpacity 
            className="bg-emerald-800 mb-4 rounded-2xl p-5 flex-row items-center shadow-md active:scale-95"
            onPress={() => setModalVisible(true)}
          >
            <View className="bg-white rounded-full p-3">
              <MaterialIcons name="search" size={28} color="#065f46" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-white text-xl font-semibold">I Lost Something</Text>
              <Text className="text-white opacity-80 text-sm">
                Report a lost item and get help from the community.
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={26} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-white rounded-2xl p-5 flex-row items-center border-2 border-emerald-800 shadow-sm active:scale-95"
            // onPress={() => setModalVisible(true)}
            onPress={() => {
              router.push({
                pathname: "/(tabs)/lostandfound/found",}
              );
            }}>
            <View className="bg-emerald-800 rounded-full p-3">
              <MaterialIcons name="back-hand" size={28} color="white" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-emerald-800 text-xl font-semibold">I Found Something</Text>
              <Text className="text-gray-600 text-sm">
                Help return a found item to its owner.
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={26} color="#065f46" />
          </TouchableOpacity>
        </View>

        {/* Quick Tips Section */}
        <View className="px-6 mt-8">
          <View className="bg-gray-100 rounded-xl p-4">
            <Text className="text-gray-800 font-semibold text-lg">Quick Tips:</Text>
            <View className="flex-row items-center mt-2">
              <MaterialIcons name="info" size={18} color="#065f46" />
              <Text className="text-gray-700 ml-2">Provide clear item descriptions.</Text>
            </View>
            <View className="flex-row items-center mt-1">
              <MaterialIcons name="location-on" size={18} color="#065f46" />
              <Text className="text-gray-700 ml-2">Include last known location.</Text>
            </View>
          </View>
        </View>

        {/* How It Works Section */}
        <View className="px-6 mt-8">
          <Text className="text-gray-900 font-bold text-xl mb-3">How It Works</Text>
          <View className="space-y-3">
            <View className="bg-gray-100 mb-2 rounded-xl p-4 flex-row items-start">
              <MaterialIcons name="assignment" size={22} color="#065f46" />
              <View className="ml-3 flex-1">
                <Text className="text-gray-800 font-medium">Report Details</Text>
                <Text className="text-gray-600 text-sm">
                  Submit a detailed description of the lost or found item.
                </Text>
              </View>
            </View>
            <View className="bg-gray-100 mb-2 rounded-xl p-4 flex-row items-start">
              <MaterialIcons name="people" size={22} color="#065f46" />
              <View className="ml-3 flex-1">
                <Text className="text-gray-800 font-medium">Community Help</Text>
                <Text className="text-gray-600 text-sm">
                  Our community will help match lost items with found reports.
                </Text>
              </View>
            </View>
            <View className="bg-gray-100 mb-2 rounded-xl p-4 flex-row items-start">
              <MaterialIcons name="verified-user" size={22} color="#065f46" />
              <View className="ml-3 flex-1">
                <Text className="text-gray-800 font-medium">Safe Return</Text>
                <Text className="text-gray-600 text-sm">
                  Coordinate safe item return through our secure platform.
                </Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/70">
          <View className="bg-white rounded-3xl w-11/12 max-h-[80%] m-6">
            <View className="px-6 pt-6 pb-4 border-b border-gray-200 flex-row justify-between items-center">
              <Text className="text-xl font-semibold text-gray-900">
                New Report
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="rounded-full p-2 bg-gray-100"
              >
                <Icon name="times" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView className="p-6">

              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Location
                </Text>
                <View className="bg-gray-50 rounded-xl border-2 border-gray-200 p-4">
                  <LocationPicker setLocation={setLocation} />
                </View>
              </View>

              <View className="mb-6">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm font-medium text-gray-700">
                    Description
                  </Text>
                </View>
                <TextInput
                  placeholder="Describe the issue..."
                  value={description}
                  onChangeText={setDescription}
                  className="bg-gray-50 rounded-xl border-2 border-gray-200 p-4 text-gray-900"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                className="bg-emerald-800 py-4 rounded-xl mb-4"
              >
                <Text className="text-white text-center font-medium text-lg">
                  Submit Report
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
