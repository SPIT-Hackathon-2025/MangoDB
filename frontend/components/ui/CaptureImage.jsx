import React, { useState } from 'react';
import { View, Image, Alert, TouchableOpacity, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const CaptureImage = ({ setImageUri }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleCaptureImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Camera access is needed to capture an image.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <View className="my-4">
      <TouchableOpacity
        onPress={handleCaptureImage}
        className="bg-emerald-800 p-3 rounded-xl shadow-md"
      >
        <Text className="text-white text-center font-semibold">Capture Image</Text>
      </TouchableOpacity>

      {selectedImage && (
        <Image
          source={{ uri: selectedImage }}
          className="w-40 h-40 mt-3 rounded-xl"
        />
      )}
    </View>
  );
};

export default CaptureImage;
