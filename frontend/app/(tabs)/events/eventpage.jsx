import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from "@expo/vector-icons";
import io from 'socket.io-client';

export default function EventPage() {
  const params = useLocalSearchParams();
  const event = JSON.parse(params.event);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [connected, setConnected] = useState(false);
  const [username] = useState(`User${Math.floor(Math.random() * 1000)}`);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const scrollViewRef = useRef();
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('http://10.10.121.39:5001', {
      transports: ['websocket'],
      reconnection: true,
      query: { username, eventId: event.id }
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to socket server');
      setConnected(true);
      socket.emit('joinEvent', { eventId: event.id, username });
    });

    socket.on('receiveForumMessage', (message) => {
      console.log('New message:', message);
      setMessages(prevMessages => [...prevMessages, message]);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });

    socket.on('userCount', (count) => {
      console.log('Online users:', count);
      setOnlineUsers(count);
    });

    socket.on('userJoined', ({ username }) => {
      Alert.alert('New User', `${username} joined the chat`);
    });

    socket.on('userLeft', ({ username }) => {
      Alert.alert('User Left', `${username} left the chat`);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setConnected(false);
    });

    // Load previous messages
    socket.emit('getEventMessages', { eventId: event.id });
    socket.on('previousMessages', (previousMessages) => {
      setMessages(previousMessages);
    });

    return () => {
      if (socket) {
        socket.emit('leaveEvent', { eventId: event.id, username });
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
        timestamp: new Date().toISOString()
      };

      socketRef.current.emit('sendForumMessage', messageData);
      setMessageText('');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-emerald-800 px-6 pt-6 pb-6">
        <Text className="text-white text-2xl font-bold">{event.title}</Text>
        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-emerald-100">
            <MaterialIcons name="calendar-today" size={16} color="#A7F3D0" /> {event.date}
          </Text>
          <Text className="text-emerald-100">
            Online Users: {onlineUsers}
          </Text>
        </View>
        <Text className="text-emerald-100 mt-1">
          <MaterialIcons name="location-on" size={16} color="#A7F3D0" /> {event.location}
        </Text>
      </View>

      {/* Event Description */}
      <View className="px-6 py-4 bg-white border-b border-gray-200">
        <Text className="text-gray-600">{event.description}</Text>
      </View>

      {/* Chat Area */}
      <View className="flex-1 bg-gray-50">
        <View className="px-6 py-3 bg-emerald-700">
          <Text className="text-white font-semibold">Event Chat</Text>
          {connected ? (
            <Text className="text-emerald-100 text-xs">Connected as {username}</Text>
          ) : (
            <Text className="text-red-200 text-xs">Connecting...</Text>
          )}
        </View>

        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, index) => (
            <View
              key={index}
              className={`my-2 max-w-[80%] ${
                msg.username === username ? 'self-end ml-auto' : 'self-start mr-auto'
              }`}
            >
              <View
                className={`rounded-2xl px-4 py-2 ${
                  msg.username === username ? 'bg-emerald-600' : 'bg-gray-200'
                }`}
              >
                <Text
                  className={`text-xs mb-1 ${
                    msg.username === username ? 'text-emerald-100' : 'text-gray-600'
                  }`}
                >
                  {msg.username}
                </Text>
                <Text
                  className={msg.username === username ? 'text-white' : 'text-gray-800'}
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

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="border-t border-gray-200 bg-white px-4 py-2"
        >
          <View className="flex-row items-center space-x-2">
            <TextInput
              className="flex-1 bg-gray-100 rounded-full px-4 py-2"
              placeholder="Type a message..."
              value={messageText}
              onChangeText={setMessageText}
              multiline
            />
            <TouchableOpacity
              className={`p-2 rounded-full ${connected ? 'bg-emerald-600' : 'bg-gray-400'}`}
              onPress={sendMessage}
              disabled={!connected}
            >
              <MaterialIcons name="send" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}