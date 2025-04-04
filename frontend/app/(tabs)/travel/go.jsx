import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Alert,
} from "react-native";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import uuid from "react-native-uuid";
import axios from "axios";
import * as Location from "expo-location";
import { router } from "expo-router";
import io from "socket.io-client";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

// Debounce utility
const debounce = (func, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
};

const Travel = () => {
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

    const [fromLocation, setFromLocation] = useState("");
    const [toLocation, setToLocation] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [activeInput, setActiveInput] = useState("");
    const [startLatLng, setStartLatLng] = useState(null);
    const [endLatLng, setEndLatLng] = useState(null);

    const API_KEY = process.env.EXPO_PUBLIC_ola_api;
    const BASE_URL = "https://api.olamaps.io/places/v1/autocomplete";

    const fetchSuggestions = async (input) => {
        try {
            if (!input) {
                setSuggestions([]);
                return;
            }

            const requestId = uuid.v4();
            const correlationId = uuid.v4();
            const response = await axios.get(BASE_URL, {
                headers: {
                    "X-Request-Id": requestId,
                    "X-Correlation-Id": correlationId,
                    Origin: "http://localhost:8082",
                },
                params: { input, api_key: API_KEY },
            });

            setSuggestions(response.data.predictions || []);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        }
    };

    const debouncedFetchSuggestions = useCallback(
        debounce(fetchSuggestions, 300),
        []
    );

    const handleInputChange = (text, inputType) => {
        if (inputType === "from") setFromLocation(text);
        else setToLocation(text);

        setActiveInput(inputType);
        debouncedFetchSuggestions(text);
    };

    const handleClearInput = (inputType) => {
        if (inputType === "from") {
            setFromLocation("");
            setStartLatLng(null);
        } else {
            setToLocation("");
            setEndLatLng(null);
        }
        setSuggestions([]);
    };

    const handleSelectSuggestion = (item) => {
        if (activeInput === "from") {
            setFromLocation(item.description);
            setStartLatLng([item.geometry.location.lat, item.geometry.location.lng]);
        } else {
            setToLocation(item.description);
            setEndLatLng([item.geometry.location.lat, item.geometry.location.lng]);
        }
        setSuggestions([]);
    };

    const fetchCurrentLocation = async (inputType) => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                alert("Permission to access location was denied.");
                return;
            }
            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            if (inputType === "from") {
                setStartLatLng([latitude, longitude]);
                setFromLocation("Current Location");
            } else {
                setEndLatLng([latitude, longitude]);
                setToLocation("Current Location");
            }
        } catch (error) {
            console.error("Error fetching location:", error);
            alert("Failed to fetch current location.");
        }
    };

    const handleAlarmButtonPress = () => {
        Alert.alert(
            "Safety Check",
            "Do you need immediate assistance?",
            [
                {
                    text: "No",
                    style: "default",
                    onPress: () => {
                        socketRef.current.emit("sendForumMessage", {
                            username: 'user',
                            message: 'Safe',
                            timestamp: new Date().toISOString()
                        });
                    }
                },
                {
                    text: "Yes",
                    style: "destructive",
                    onPress: () => {
                        socketRef.current.emit("sendForumMessage", {
                            username: 'user',
                            message: 'Alert',
                            timestamp: new Date().toISOString()
                        });
                        router.push({
                            pathname: "/(tabs)/travel/emergency",
                        });
                    }
                }
            ],
            {
                cancelable: false
            }
        );
    };

    return (
        <SafeAreaView
            className="min-h-full bg-background px-4 py-4"
            edges={["left", "right"]}
        >
            <View className="bg-white shadow-lg rounded-lg mb-4 p-6">
                {/* From Section */}
                <View className="mb-4 relative">
                    <Text
                        className="absolute -top-3 left-4 bg-white px-1 text-gray-600 font-psemibold text-sm"
                        style={{ zIndex: 1 }}
                    >
                        From
                    </Text>
                    <View className="flex-row items-center border border-gray-300 rounded-md px-3 py-1.5">
                        <MaterialIcons
                            name="location-on"
                            size={20}
                            color="#065f46"
                            className="mr-3"
                        />
                        <TextInput
                            placeholder="Starting location"
                            value={fromLocation}
                            onChangeText={(text) => handleInputChange(text, "from")}
                            className="flex-1 text-gray-800 text-sm font-pmedium"
                            style={{ height: 40 }}
                        />
                        {fromLocation !== "" && (
                            <TouchableOpacity onPress={() => handleClearInput("from")}>
                                <MaterialIcons name="close" size={20} color="#888" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={() => fetchCurrentLocation("from")}
                            className="ml-2"
                        >
                            <MaterialIcons name="gps-fixed" size={20} color="#065f46" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* To Section */}
                <View className="relative">
                    <Text
                        className="absolute -top-3 left-4 bg-white px-1 text-gray-600 font-psemibold text-sm"
                        style={{ zIndex: 1 }}
                    >
                        To
                    </Text>
                    <View className="flex-row items-center border border-gray-300 rounded-md px-3 py-1.5">
                        <MaterialIcons
                            name="location-on"
                            size={20}
                            color="#065f46"
                            className="mr-3"
                        />
                        <TextInput
                            placeholder="Destination"
                            value={toLocation}
                            onChangeText={(text) => handleInputChange(text, "to")}
                            className="flex-1 text-gray-800 text-sm font-pmedium"
                            style={{ height: 40 }}
                        />
                        {toLocation !== "" && (
                            <TouchableOpacity onPress={() => handleClearInput("to")}>
                                <MaterialIcons name="close" size={20} color="#888" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={() => fetchCurrentLocation("to")}
                            className="ml-2"
                        >
                            <MaterialIcons name="gps-fixed" size={20} color="#065f46" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Suggestions List */}
            {suggestions.length > 0 ? (
                <FlatList
                    data={suggestions}
                    keyExtractor={(item) => item.place_id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => handleSelectSuggestion(item)}
                            className="flex-row items-center bg-white shadow-sm rounded-lg px-4 mx-1 mb-2 h-16"
                        >
                            <MaterialIcons name="place" size={24} color="#065f46" />
                            <View className="ml-4 flex-1">
                                <Text
                                    className="font-medium text-gray-900 text-base truncate"
                                    numberOfLines={1}
                                >
                                    {item.description}
                                </Text>
                                <Text
                                    className="text-gray-500 text-sm truncate"
                                    numberOfLines={1}
                                >
                                    {item.structured_formatting?.secondary_text}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={{ paddingBottom: 64 }}
                />
            ) : (
                <Text className="text-gray-500 text-center mt-4 font-psemibold">
                    No suggestions available. Try searching for another location.
                </Text>
            )}

            {/* Navigate Button */}
            <View className="absolute bottom-[1rem] left-4 right-4 flex-row justify-between items-center">
                <View className="flex-1 mr-2">
                    <TouchableOpacity
                        onPress={handleAlarmButtonPress}
                        className="w-full h-12 bg-emerald-800 rounded-xl justify-center items-center"
                    >
                        <Text className="text-white text-center font-bold text-lg">Emergency Alert</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-1">
                    <TouchableOpacity
                        disabled={!startLatLng || !endLatLng}
                        className={`w-full h-12 bg-emerald-800 rounded-xl justify-center items-center ${startLatLng && endLatLng ? "bg-emerald-800" : "bg-gray-400"
                            }`}
                        onPress={() => {
                            router.push({
                                pathname: "/(tabs)/travel/routescreen",
                                params: {
                                    startLatLng: JSON.stringify(startLatLng),
                                    endLatLng: JSON.stringify(endLatLng),
                                },
                            });
                        }}
                    >
                        <Text className="text-white text-center font-bold text-lg">Find Routes</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default Travel;