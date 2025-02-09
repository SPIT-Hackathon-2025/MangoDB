import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import CaptureImage from "../../../components/ui/CaptureImage";
import LocationPicker from "../../../components/ui/LocationPicker";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import io from "socket.io-client";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const IssueScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [location, setLocation] = useState(null);
  const [description, setDescription] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [issues, setIssues] = useState([]);
  const router = useRouter();
    const [isConnected, setIsConnected] = useState(false);
    const [userCount, setUserCount] = useState(0);
    const [expoPushToken, setExpoPushToken] = useState("");
    const socketRef = useRef(null);
    const notificationListener = useRef();
    const responseListener = useRef();
  

    useEffect(() => {
      if (!socketRef.current) {
        socketRef.current = io("http://10.10.121.39:5001", {
          transports: ['websocket'],
          reconnection: true,
        });
      }
  
      const socket = socketRef.current;
  
      socket.on('connect', () => {
        setIsConnected(true);
        console.log("Socket connected");
      });
      
      socket.on('disconnect', () => {
        setIsConnected(false);
        console.log("Socket disconnected");
      });
      
      socket.on("receiveForumMessage", async (newMessage) => {
        console.log("New message received:", newMessage);
        await scheduleNotification(newMessage);
        setForumMessages(prev => [...prev, newMessage]);
      });
      
      socket.on("userCount", count => {
        console.log("User count updated:", count);
        setUserCount(count);
      });
      
      socket.on("receiveNotification", ({ title, message }) => {
        console.log("Notification received from socket:", { title, message });
        Alert.alert(title, message);
      });
  
      return () => {
        socket.off("receiveForumMessage");
        socket.off("receiveNotification");
        socket.off("connect");
        socket.off("disconnect");
        socket.off("userCount");
      };
    }, []);

  // Function to register for push notifications
    async function registerForPushNotificationsAsync() {
      let token;
  
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
  
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          Alert.alert('Failed', 'Failed to get push token for push notification!');
          return;
        }
        
        token = (await Notifications.getExpoPushTokenAsync()).data;
      } else {
        Alert.alert('Must use physical device', 'Push notifications require a physical device');
      }
  
      return token;
    }
  
    // Schedule a notification
    const scheduleNotification = async (messageData) => {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `New message from ${messageData.username}`,
            body: messageData.message,
            data: { messageData },
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: { seconds: 1 },
        });
        console.log("Notification scheduled successfully");
      } catch (error) {
        console.error("Error scheduling notification:", error);
        Alert.alert("Notification Error", "Failed to schedule notification");
      }
    };
  

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
    formData.append(
      "question",
      "generate a short description of the problem in the image. by problem i mean one which needs complaining to respective authority that can solve it. Only print what problem is present in the image. Do not give any type pf JSON Data. Do not give a preamble or postamble to it. Do not include info about the respective authority as well if such problem is not present in the image, just output 'no.'"
    );

    try {
      await axios.post(
        "https://3329-103-104-226-58.ngrok-free.app/api/report-issue",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const ans = await axios.post(
        "https://3329-103-104-226-58.ngrok-free.app/llm/query",
        {
          query: description,
        }
      );
      const formattedData = ans.data
        .map((item) => `${item.departmentName}:\n${item.Contact}`)
        .join("\n\n");

      Alert.alert("Success", formattedData);
      // socketRef.current.emit("sendForumMessage", {'username':'user',
      //   'message':'New Report',
      //   'timestamp': new Date().toISOString()})
      setModalVisible(false);
      fetchIssues();
    } catch (error) {
      Alert.alert("Error", "There was an issue reporting the problem");
    }
  };

  const fetchIssues = async () => {
    try {
      const response = await axios.get(
        "https://3329-103-104-226-58.ngrok-free.app/api/issues"
      );
      setIssues(response.data);
    } catch (error) {
      console.error("Error fetching issues:", error);
    }
  };

  const handleAI = async () => {
    if (!imageUri) {
      Alert.alert("Error", "Please capture an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", {
      uri: imageUri,
      type: "image/jpeg",
      name: "issue_image.jpg",
    });
    formData.append("question", "What?");

    try {
      const response = await axios.post(
        "https://3329-103-104-226-58.ngrok-free.app/gemini",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("AI Response:", response.data);
      setDescription(response.data);
    } catch (error) {
      console.error("AI request failed:", error);
      Alert.alert("Error", "Failed to get AI response.");
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleVote = (id, type) => {
    const updatedIssues = issues.map((issue) => {
      if (issue._id === id) {
        issue.upvotes = issue.upvotes || 0;
        issue.downvotes = issue.downvotes || 0;
        if (type === "upvote") {
          issue.hasVotedUp = !issue.hasVotedUp;
          issue.upvotes += issue.hasVotedUp ? 1 : -1;
        } else {
          issue.hasVotedDown = !issue.hasVotedDown;
          issue.downvotes += issue.hasVotedDown ? 1 : -1;
        }
      }
      return issue;
    });
    setIssues(updatedIssues);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}

      <ScrollView className="flex-1">
        {/* Report Card - Highlighted */}
        <View className="p-6">
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-200 shadow-sm"
          >
            <Text className="text-xl font-semibold text-emerald-900 mb-2">
              Report an Issue
            </Text>
            <Text className="text-emerald-700 text-sm mb-4">
              Help improve your community by reporting issues
            </Text>
            <View className="bg-emerald-800 self-start px-6 py-3 rounded-xl">
              <Text className="text-white font-medium">New Report</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Issues List */}
        <View className="px-6">
        <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">Alarm</Text>
            <TouchableOpacity
              onPress={()=>{socketRef.current.emit("sendForumMessage", {'username':'user',
                'message':'Alert',
                'timestamp': new Date().toISOString()})}}
              className="bg-emerald-800 px-4 py-2 rounded-xl"
            >
              <Text className="text-white text-sm">Alarm Button</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">Recent Reports</Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/home/mapview")}
              className="bg-emerald-800 px-4 py-2 rounded-xl"
            >
              <Text className="text-white text-sm">Go to Map View</Text>
            </TouchableOpacity>
          </View>

          {issues.map((item) => (
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
                  <Text className="text-xs text-gray-500 mb-1">{item.address}</Text>
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
                        color={item.hasVotedUp ? "#065f46" : "#6b7280"}
                      />
                      <Text className="ml-1 text-xs text-gray-500">{item.upvotes || 0}</Text>
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
                      <Text className="ml-1 text-xs text-gray-500">{item.downvotes || 0}</Text>
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
              <Text className="text-xl font-semibold text-gray-900">New Report</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="rounded-full p-2 bg-gray-100"
              >
                <Icon name="times" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView className="p-6">
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">Photo</Text>
                <View className="bg-gray-50 rounded-xl border-2 border-gray-200 p-4">
                  <CaptureImage setImageUri={setImageUri} />
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">Location</Text>
                <View className="bg-gray-50 rounded-xl border-2 border-gray-200 p-4">
                  <LocationPicker setLocation={setLocation} />
                </View>
              </View>

              <View className="mb-6">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm font-medium text-gray-700">Description</Text>
                  <TouchableOpacity
                    className="flex-row items-center px-2 py-1 rounded-full bg-gray-50 border border-gray-200"
                    onPress={handleAI}
                  >
                    <Icon name="magic" size={12} color="#6b7280" className="mr-1" />
                    <Text className="text-xs text-gray-500 ml-1">Use AI</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  placeholder="Describe the issue..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  className="text-gray-900 p-3 bg-gray-100 rounded-xl"
                  maxLength={200}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                className="w-full py-3 mt-6 rounded-xl bg-emerald-800 flex items-center"
              >
                <Text className="text-white text-lg">Submit Report</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default IssueScreen;