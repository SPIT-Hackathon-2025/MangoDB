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
import CaptureImage from "../../../components/ui/CaptureImage";

const FoundScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [location, setLocation] = useState(null);
  const [description, setDescription] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [items, setItems] = useState([]);

  const handleSubmit = async () => {
    if (!imageUri || !location || !description) {
      Alert.alert("Error", "Please provide all the details");
      return;
    }

    const formData = new FormData();
    formData.append("image", {
      uri: imageUri,
      type: "image/jpeg",
      name: "issue_image.jpg",
    });
    formData.append("description", description);
    formData.append("location", JSON.stringify(location));

    try {
      console.log("Sending formData:", formData);
      const response = await axios.post(
        "https://3329-103-104-226-58.ngrok-free.app/api/item-found",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const res = await axios.post(
        "https://3329-103-104-226-58.ngrok-free.app/api/append-csv",
        {
          Contact: "9152743762",
          description: description,
          productName: "Found Item",
          personName: "Anonymous",
        }
      );
      console.log("Response:", response.data);
      Alert.alert("Success", "Found item reported successfully");
      setModalVisible(false);
      fetchItems();
    } catch (error) {
      console.error("Error details:", error.response?.data || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.error || "There was an issue reporting the item"
      );
    }
  };

  const fetchItems = async () => {
    try {
      const response = await axios.get(
        "https://3329-103-104-226-58.ngrok-free.app/api/lost-items"
      );
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="pt-12 pb-4 px-6 border-b border-gray-200">
        <Text className="text-2xl font-semibold text-gray-900">Items</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-200 shadow-sm"
        >
          <Text className="text-xl font-semibold text-emerald-900 mb-2">
            Tag Found Item
          </Text>
          <Text className="text-emerald-700 text-sm mb-4">
            Tag Found Items to help the community.
          </Text>
          <View className="bg-emerald-800 self-start px-6 py-3 rounded-xl">
            <Text className="text-white font-medium">New Item</Text>
          </View>
        </TouchableOpacity>

        <Text className="text-lg font-semibold text-gray-900 mb-4 mt-6">
          Recent Items Lost
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
                    uri: `https://3329-103-104-226-58.ngrok-free.app/${item.imageUrl}`,
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
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/70">
          <View className="bg-white rounded-3xl w-11/12 max-h-[80%] m-6 p-6">
            <Text className="text-xl font-semibold text-gray-900 mb-4">
              New Report
            </Text>
            <CaptureImage setImageUri={setImageUri} />
            <LocationPicker setLocation={setLocation} />
            <TextInput
              placeholder="Describe the issue..."
              value={description}
              onChangeText={setDescription}
              className="bg-gray-50 rounded-xl border-2 border-gray-200 p-4 text-gray-900 mt-4"
              multiline
            />
            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-emerald-800 py-4 rounded-xl mt-6"
            >
              <Text className="text-white text-center font-medium text-lg">
                Submit Report
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* AI Floating Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-emerald-800 p-4 rounded-full shadow-lg"
        onPress={() =>
          Alert.alert("AI Assistant", "This feature is under development.")
        }
      >
        <Icon name="robot" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default FoundScreen;
