import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
} from "react-native";
import io from "socket.io-client";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const ForumApp = () => {
  const [forumMessages, setForumMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [expoPushToken, setExpoPushToken] = useState("");
  const socketRef = useRef(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  // Register for push notifications
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      console.log("Push token:", token);
    });

    // Listen for notifications when app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("Notification received:", notification);
    });

    // Listen for user interaction with notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Notification response:", response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // Socket connection setup
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

  // Send message function
  const sendForumMessage = () => {
    if (!username.trim() || !message.trim()) {
      Alert.alert("Error", "Please enter both username and message");
      return;
    }

    const messageData = {
      username,
      message,
      timestamp: new Date().toISOString(),
    };

    socketRef.current.emit("sendForumMessage", messageData);
    setMessage("");
  };

  // Trigger test alert
  const triggerAlert = () => {
    socketRef.current.emit("receiveNotification", {
      title: "Test Alert",
      message: "This is a test alert notification.",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Chat</Text>
        <Text style={styles.userCount}>Users Online: {userCount}</Text>
      </View>

      <ScrollView style={styles.messagesContainer}>
        {forumMessages.map((msg, index) => (
          <View key={index} style={styles.messageCard}>
            <Text style={styles.username}>{msg.username}</Text>
            <Text style={styles.messageText}>{msg.message}</Text>
            <Text style={styles.timestamp}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
        <TextInput
          placeholder="Type your message..."
          value={message}
          onChangeText={setMessage}
          multiline
          style={styles.input}
        />
        <TouchableOpacity
          style={[styles.sendButton, !isConnected && styles.disabledButton]}
          onPress={sendForumMessage}
          disabled={!isConnected}
        >
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.alertButton, !isConnected && styles.disabledButton]}
        onPress={triggerAlert}
        disabled={!isConnected}
      >
        <Text style={styles.alertButtonText}>Trigger Test Alert</Text>
      </TouchableOpacity>

      {!isConnected && (
        <Text style={styles.disconnectedText}>
          Disconnected - Trying to reconnect...
        </Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#065F46',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  userCount: {
    color: 'white',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageCard: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#065F46',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertButton: {
    backgroundColor: '#FF5252',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  alertButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disconnectedText: {
    color: '#FF5252',
    textAlign: 'center',
    padding: 8,
    backgroundColor: '#FFE5E5',
  },
});

export default ForumApp;