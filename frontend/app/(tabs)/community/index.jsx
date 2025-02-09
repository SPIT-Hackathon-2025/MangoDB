import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Modal
} from "react-native";
import { Link } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const initialDiscussions = [
  {
    id: 1,
    title: "Fixing Potholes in Downtown",
    description: "Let's organize a weekend pothole repair drive and request city assistance.",
    createdBy: "Alex Johnson",
    votes: 56,
    comments: 4,
    bgColor: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    id: 2,
    title: "Community Cleanup Initiative",
    description: "Plan a cleanup day for the local park and invite volunteers.",
    createdBy: "Samantha Lee",
    votes: 102,
    comments: 25,
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    id: 3,
    title: "Streetlight Safety Concerns",
    description: "Report and replace broken streetlights to improve nighttime safety.",
    createdBy: "Michael Brown",
    votes: 78,
    comments: 18,
    bgColor: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    id: 4,
    title: "Public Transport Delays Discussion",
    description: "Brainstorm solutions for unreliable bus schedules and metro issues.",
    createdBy: "Emily Davis",
    votes: 134,
    comments: 41,
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
  },
];

const DiscussionCard = ({ discussion, toggleLike }) => {
  return (
    <TouchableOpacity className="bg-white p-5 rounded-2xl shadow-md mb-4 active:scale-95" onPress={() => {
      router.push({
        pathname: "/(tabs)/community/communitypage",
        params: { discussion: JSON.stringify(discussion) },  // Convert to string
      });      
    }}>
      <View className="flex-row items-center mb-3">
        <View className={`${discussion.bgColor} p-3 rounded-full`}>
          <MaterialIcons name="forum" size={24} color={discussion.iconColor.replace('text-', '')} />
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-lg font-bold text-gray-800">{discussion.title}</Text>
          <Text className="text-xs text-gray-500 mt-1">
            <Ionicons name="person-outline" size={12} /> {discussion.createdBy}
          </Text>
        </View>
      </View>

      <Text className="text-gray-600 text-sm leading-5 mb-4">{discussion.description}</Text>

      <View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
        <TouchableOpacity
          onPress={() => toggleLike(discussion.id)}
          className={`flex-row items-center px-3 py-1 rounded-full ${discussion.liked ? 'bg-blue-100' : ''}`}
        >
          <Ionicons
            name={discussion.liked ? "heart" : "heart-outline"}
            size={20}
            color={discussion.liked ? "#2563EB" : "#666"}
          />
          <Text className={`ml-1 font-medium ${discussion.liked ? 'text-blue-600' : 'text-gray-600'}`}>
            {discussion.votes}
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center">
          <View className="flex-row items-center mr-4">
            <Ionicons name="chatbubble-outline" size={18} color="#666" />
            <Text className="ml-1 text-gray-600">{discussion.comments}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function CommunityDiscussions() {
  const [discussions, setDiscussions] = useState(initialDiscussions);
  const [modalVisible, setModalVisible] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    description: "",
    createdBy: "Deep Patel",
    votes: 0,
    comments: 0,
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
  });

  // Toggle Like Function
  const toggleLike = (id) => {
    setDiscussions((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, liked: !item.liked, votes: item.liked ? item.votes - 1 : item.votes + 1 }
          : item
      )
    );
  };

  // Add New Discussion
  const addDiscussion = () => {
    if (newDiscussion.title.trim() === "" || newDiscussion.description.trim() === "") return;

    setDiscussions([
      ...discussions,
      { ...newDiscussion, id: discussions.length + 1 },
    ]);

    setNewDiscussion({
      title: "",
      description: "",
      createdBy: "Deep Patel",
      votes: 0,
      comments: 0,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    });

    setModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header Section */}
        <View className="bg-[#03543F] px-6 pt-10 pb-14 rounded-b-3xl shadow-md">
          <Text className="text-white text-3xl font-bold mb-1">Welcome to the Community</Text>
          <Text className="text-green-100 text-lg">Join the conversation, make a difference</Text>
        </View>

        {/* Discussions List */}
        <View className="px-6 mt-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">Popular Discussions</Text>
          {discussions.map((discussion) => (
            <DiscussionCard key={discussion.id} discussion={discussion} toggleLike={toggleLike} />
          ))}
        </View>
      </ScrollView>

      {/* Floating Button to Open Modal */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-green-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        style={{
          shadowColor: "#065f46",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 8,
        }}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Modal for New Discussion */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-6 rounded-2xl w-11/12 shadow-lg">
            <Text className="text-xl font-bold text-gray-800 mb-4">Start New Discussion</Text>

            <TextInput
              placeholder="Discussion Title"
              className="bg-gray-100 px-4 py-3 rounded-lg mb-3"
              value={newDiscussion.title}
              onChangeText={(text) => setNewDiscussion({ ...newDiscussion, title: text })}
            />

            <TextInput
              placeholder="Discussion Description"
              className="bg-gray-100 px-4 py-3 rounded-lg mb-3"
              multiline
              value={newDiscussion.description}
              onChangeText={(text) => setNewDiscussion({ ...newDiscussion, description: text })}
            />

            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                className="bg-gray-300 px-5 py-3 rounded-lg"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-gray-800 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-green-600 px-5 py-3 rounded-lg"
                onPress={addDiscussion}
              >
                <Text className="text-white font-semibold">Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
