import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";
import axios from "axios";
import LocationPicker from "../../../components/ui/LocationPicker";
import Icon from "react-native-vector-icons/FontAwesome";

const LostScreen = () => {
  const [location, setLocation] = useState(null);
  const [description, setDescription] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [items, setItems] = useState([]);

  const handleSubmit = async () => {
    if (!location || !description) {
      Alert.alert("Error", "Please provide all the details");
      return;
    }

    try {
      // Create request body as a plain object
      const requestBody = {
        description: description,
        location: location, // This is already an object with latitude and longitude
      };
      const response = await axios.post(
        "https://666c-103-104-226-58.ngrok-free.app/api/item-lost",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
     
      // console.log("Response:", response.data); // Debug log
      Alert.alert("Success", "Item reported successfully");
      setModalVisible(false);
      fetchItems();
    } catch (error) {
      console.error("Error details:", error.response?.data || error.message);
      Alert.alert("Error", "There was an issue reporting the problem");
    }
  };
  const fetchItems = async () => {
    try {
      const response = await axios.get(
        "https://666c-103-104-226-58.ngrok-free.app/api/items"
      );
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ... keeping all the handler functions same ...

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-12 pb-4 px-6 border-b border-gray-200">
        <Text className="text-2xl font-semibold text-gray-900">Items</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Report Card - Highlighted */}

        <View className="p-6">
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-200 shadow-sm"
          >
            <Text className="text-xl font-semibold text-emerald-900 mb-2">
              Tag your Lost Item
            </Text>
            <Text className="text-emerald-700 text-sm mb-4">
              Look for you lost items here
            </Text>
            <View className="bg-emerald-800 self-start px-6 py-3 rounded-xl">
              <Text className="text-white font-medium">New Log</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Items List */}
        <View className="px-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Recent Items Found
          </Text>
          {items.map((item) => (
            <View
              key={item._id?.toString() || Math.random().toString()}
              className="bg-white rounded-2xl p-4 mb-4 border-2 border-gray-200"
            >
              <View className="flex-row">
                {item.imageUrl && (
                  <Image
                    source={{
                      uri: `https://666c-103-104-226-58.ngrok-free.app/${item.imageUrl}`,
                    }}
                    className="w-20 h-20 rounded-lg mr-4"
                  />
                )}
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 mb-1">
                    {item.location?.latitude.toFixed(4)},{" "}
                    {item.location?.longitude.toFixed(4)}
                  </Text>
                  <Text className="text-gray-900 text-sm mb-2">
                    {item.description || "No description provided"}
                  </Text>
                  <View className="flex-row items-center space-x-4">
                    <TouchableOpacity
                      onPress={() => handleVote(item._id, "upvote")}
                      className="flex-row items-center"
                    >
                      <Icon
                        name="arrow-up"
                        size={12}
                        color={item.haxsVotedUp ? "#065f46" : "#6b7280"}
                      />
                      <Text className="ml-1 text-xs text-gray-500">
                        {item.upvotes || 0}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleVote(item._id, "downvote")}
                      className="flex-row items-center"
                    >
                      <Icon
                        name="arrow-down"
                        size={12}
                        color={item.hasVotedDown ? "#065f46" : "#6b7280"}
                      />
                      <Text className="ml-1 text-xs text-gray-500">
                        {item.downvotes || 0}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Improved Modal - Compact */}
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
};

export default LostScreen;
