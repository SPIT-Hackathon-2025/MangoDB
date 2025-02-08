import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const initialEvents = [
  {
    id: 1,
    title: "Tech Conference 2025",
    date: "March 15, 2025",
    location: "Convention Center",
    description: "Annual technology conference featuring latest innovations",
    icon: "computer",
    attendees: 156,
    interested: 243,
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: 2,
    title: "Startup Meetup",
    date: "March 20, 2025",
    location: "Innovation Hub",
    description: "Networking event for startup founders and entrepreneurs",
    icon: "groups",
    attendees: 89,
    interested: 134,
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    id: 3,
    title: "Coding Workshop",
    date: "March 25, 2025",
    location: "Tech Campus",
    description: "Hands-on coding workshop for developers",
    icon: "code",
    attendees: 45,
    interested: 98,
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    id: 4,
    title: "AI Summit 2025",
    date: "April 5, 2025",
    location: "Digital Arena",
    description: "Exploring the future of artificial intelligence and machine learning",
    icon: "psychology",
    attendees: 201,
    interested: 322,
    bgColor: "bg-orange-100",
    iconColor: "text-orange-600",
  },
];

const EventCard = ({ event, toggleInterest }) => {
  return (
    <TouchableOpacity 
      className="bg-white p-5 rounded-2xl shadow-md mb-4 active:scale-95"
      onPress={() => {
        router.push({
          pathname: "/(tabs)/events/eventpage",
          params: { event: JSON.stringify(event) },
        });
      }}
    >
      <View className="flex-row items-center mb-3">
        <View className={`${event.bgColor} p-3 rounded-full`}>
          <MaterialIcons 
            name={event.icon} 
            size={24} 
            color={event.iconColor.replace('text-', '')} 
          />
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-lg font-bold text-gray-800">{event.title}</Text>
          <Text className="text-xs text-gray-500 mt-1">
            <MaterialIcons name="calendar-today" size={12} /> {event.date}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mb-3">
        <MaterialIcons name="location-on" size={16} color="#666" />
        <Text className="text-gray-600 ml-1">{event.location}</Text>
      </View>

      <Text className="text-gray-600 text-sm leading-5 mb-4">{event.description}</Text>

      <View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity
            onPress={() => toggleInterest(event.id)}
            className={`flex-row items-center px-3 py-1 rounded-full ${
              event.isInterested ? 'bg-emerald-100' : ''
            }`}
          >
            <MaterialIcons
              name={event.isInterested ? "star" : "star-outline"}
              size={20}
              color={event.isInterested ? "#059669" : "#666"}
            />
            <Text className={`ml-1 font-medium ${
              event.isInterested ? 'text-emerald-600' : 'text-gray-600'
            }`}>
              {event.interested}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-emerald-600 ml-2 px-3 py-1 rounded-full flex-row items-center"
            onPress={() => {
              router.push({
                pathname: "/(tabs)/events/eventpage",
                params: { event: JSON.stringify(event) },
              });
            }}
          >
            <MaterialIcons name="group-add" size={20} color="white" />
            <Text className="text-white ml-2 font-medium">Join</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center">
          <View className="flex-row items-center mr-4">
            <MaterialIcons name="people" size={18} color="#666" />
            <Text className="ml-1 text-gray-600">{event.attendees}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#666" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function Events() {
  const [events, setEvents] = useState(initialEvents);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
    icon: "event",
    attendees: 0,
    interested: 0,
    bgColor: "bg-emerald-100",
    iconColor: "text-emerald-600",
  });

  const toggleInterest = (id) => {
    setEvents((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              isInterested: !item.isInterested,
              interested: item.isInterested ? item.interested - 1 : item.interested + 1,
            }
          : item
      )
    );
  };

  const addEvent = () => {
    if (newEvent.title.trim() === "" || newEvent.description.trim() === "") return;

    setEvents([
      ...events,
      { ...newEvent, id: events.length + 1 },
    ]);

    setNewEvent({
      title: "",
      date: "",
      location: "",
      description: "",
      icon: "event",
      attendees: 0,
      interested: 0,
      bgColor: "bg-emerald-100",
      iconColor: "text-emerald-600",
    });

    setModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header Section */}
        <View className="bg-emerald-800 px-6 pt-10 pb-14 rounded-b-3xl shadow-md">
          <Text className="text-white text-3xl font-bold mb-1">Events</Text>
          <Text className="text-green-100 text-lg">Discover and join exciting gatherings</Text>
        </View>

        {/* Events List */}
        <View className="px-6 mt-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">Upcoming Events</Text>
          {events.map((event) => (
            <EventCard key={event.id} event={event} toggleInterest={toggleInterest} />
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-emerald-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        style={{
          shadowColor: "#065f46",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 8,
        }}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* New Event Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-6 rounded-2xl w-11/12 shadow-lg">
            <Text className="text-xl font-bold text-gray-800 mb-4">Create New Event</Text>

            <TextInput
              placeholder="Event Title"
              className="bg-gray-100 px-4 py-3 rounded-lg mb-3"
              value={newEvent.title}
              onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
            />

            <TextInput
              placeholder="Date (e.g., March 15, 2025)"
              className="bg-gray-100 px-4 py-3 rounded-lg mb-3"
              value={newEvent.date}
              onChangeText={(text) => setNewEvent({ ...newEvent, date: text })}
            />

            <TextInput
              placeholder="Location"
              className="bg-gray-100 px-4 py-3 rounded-lg mb-3"
              value={newEvent.location}
              onChangeText={(text) => setNewEvent({ ...newEvent, location: text })}
            />

            <TextInput
              placeholder="Event Description"
              className="bg-gray-100 px-4 py-3 rounded-lg mb-3"
              multiline
              value={newEvent.description}
              onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
            />

            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                className="bg-gray-300 px-5 py-3 rounded-lg"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-gray-800 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-emerald-600 px-5 py-3 rounded-lg"
                onPress={addEvent}
              >
                <Text className="text-white font-semibold">Create Event</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}