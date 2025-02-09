import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import io from "socket.io-client";

export default function EventPage() {
  const params = useLocalSearchParams();
  const event = JSON.parse(params.event);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [connected, setConnected] = useState(false);
  const [username] = useState(`User${Math.floor(Math.random() * 1000)}`);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const scrollViewRef = useRef();
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("http://10.10.121.39:5001", {
      transports: ["websocket"],
      reconnection: true,
      query: { username, eventId: event.id },
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Connected to socket server");
      setConnected(true);
      socket.emit("joinEvent", { eventId: event.id, username });
    });

    socket.on("receiveForumMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });

    socket.on("userCount", (count) => setOnlineUsers(count));

    socket.on("userJoined", ({ username }) => {
      Alert.alert("New User", `${username} joined the chat`);
    });

    socket.on("userLeft", ({ username }) => {
      Alert.alert("User Left", `${username} left the chat`);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.emit("getEventMessages", { eventId: event.id });
    socket.on("previousMessages", (previousMessages) => {
      setMessages(previousMessages);
    });

    return () => {
      if (socket) {
        socket.emit("leaveEvent", { eventId: event.id, username });
        socket.disconnect();
      }
    };
  }, [event.id, username]);

  const sendMessage = () => {
    if (messageText.trim() && socketRef.current && connected) {
      const messageData = {
        username,
        message: messageText,
        eventId: event.id,
        timestamp: new Date().toISOString(),
      };

      socketRef.current.emit("sendForumMessage", messageData);
      setMessageText("");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Event Details Section */}
      <View className="bg-background px-6 pt-8 pb-6 rounded-b-3xl shadow-md">
        <Text className="text-emerald-800 text-2xl font-pbold">{event.title}</Text>
        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-emerald-700 flex-row items-center">
            <MaterialIcons name="calendar-today" size={16} color="#334155" /> {event.date}
          </Text>
          <Text className="text-green-800">👥 {onlineUsers} Online</Text>
        </View>
        <Text className="text-emerald-700 mt-1 flex-row items-center">
          <MaterialIcons name="location-on" size={16} color="#334155" /> {event.location}
        </Text>
      </View>

      {/* Chat Section */}
      <View className="flex-1 bg-white mt-4 mx-4 rounded-3xl shadow-lg overflow-hidden">
        {/* Chat Header */}
        <View className="bg-emerald-700 py-3 px-6 rounded-t-3xl">
          <Text className="text-white font-semibold text-lg">Event Chat</Text>
        </View>

        {/* Messages List */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 pt-4 bg-gray-50"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, index) => (
            <View
              key={index}
              className={`mb-3 max-w-[80%] ${
                msg.username === username ? "self-end ml-auto" : "self-start mr-auto"
              }`}
            >
              <View
                className={`rounded-xl px-4 py-2 shadow-sm ${
                  msg.username === username ? "bg-emerald-600" : "bg-gray-200"
                }`}
              >
                <Text
                  className={`text-xs mb-1 ${
                    msg.username === username ? "text-emerald-100" : "text-gray-600"
                  }`}
                >
                  {msg.username}
                </Text>
                <Text
                  className={msg.username === username ? "text-white" : "text-gray-800"}
                >
                  {msg.message}
                </Text>
              </View>
              <Text className="text-xs text-gray-500 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Message Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="border-t border-gray-200 bg-white px-4 py-3"
        >
          <View className="flex-row items-center space-x-2">
            <TextInput
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 shadow-sm"
              placeholder="Type a message..."
              value={messageText}
              onChangeText={setMessageText}
              multiline
            />
            <TouchableOpacity
              className={`p-3 rounded-full shadow-md ${
                connected ? "bg-emerald-600" : "bg-gray-400"
              }`}
              onPress={sendMessage}
              disabled={!connected}
            >
              <MaterialIcons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
