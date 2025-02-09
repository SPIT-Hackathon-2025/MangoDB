import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Animated } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Enhanced leaderboard data with user
const leaderboardData = [
  { id: 1, name: "Alice Johnson", saved: 150, isUser: false },
  { id: 2, name: "Michael Smith", saved: 120, isUser: false },
  { id: "user", name: "You", saved: 115, isUser: true },
  { id: 3, name: "Emma Williams", saved: 110, isUser: false },
  { id: 4, name: "Daniel Brown", saved: 95, isUser: false },
  { id: 5, name: "Sophia Davis", saved: 80, isUser: false },
].sort((a, b) => b.saved - a.saved);

export default function GreenTravel() {
  const router = useRouter();

  const renderMedal = (position) => {
    const medals = {
      1: "🥇",
      2: "🥈",
      3: "🥉",
    };
    return medals[position] || null;
  };

  return (
    <SafeAreaView className="flex-1 bg-green-50">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Enhanced Header Section */}
        <View
          className="bg-[#03543F] px-6 pt-10 pb-14 rounded-b-[40px] shadow-lg"
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-3xl font-bold">Greener Travel</Text>
            <Ionicons name="earth" size={32} color="#fff" />
          </View>
          
          <Text className="text-green-100 text-lg mb-6">
            Make a difference with every journey! 🌱
          </Text>

          {/* Enhanced Navigation Button */}
          <TouchableOpacity 
            className="bg-white px-6 py-4 rounded-2xl flex-row items-center justify-center shadow-xl"
            onPress={() => router.push("/(tabs)/travel/go")}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
            }}
          >
            <Ionicons name="navigate-circle" size={28} color="#065f46" />
            <Text className="text-green-800 text-lg font-bold ml-2">
              Start Green Journey
            </Text>
          </TouchableOpacity>
        </View>

        {/* Enhanced Leaderboard */}
        <View className="px-6 mt-8">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-bold text-gray-800">
              Top Savers
            </Text>
            <View className="bg-green-100 px-4 py-2 rounded-full">
              <Text className="text-green-800 font-semibold">
                This Month
              </Text>
            </View>
          </View>

          {leaderboardData.map((user, index) => (
            <TouchableOpacity
              key={user.id}
              className={`mb-3 p-4 rounded-2xl flex-row items-center justify-between ${
                user.isUser 
                  ? 'bg-green-100 border-2 border-green-500'
                  : 'bg-white'
              }`}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
            >
              <View className="flex-row items-center flex-1">
                <View className={`w-8 h-8 rounded-full ${
                  index < 3 ? 'bg-green-700' : 'bg-gray-200'
                } items-center justify-center mr-3`}>
                  <Text className="text-white font-bold">
                    {renderMedal(index + 1) || index + 1}
                  </Text>
                </View>
                <Text className={`text-lg ${
                  user.isUser ? 'text-green-800 font-bold' : 'text-gray-700'
                }`}>
                  {user.name}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons 
                  name="leaf" 
                  size={18} 
                  color={user.isUser ? "#065f46" : "#6B7280"} 
                />
                <Text className={`ml-1 font-bold ${
                  user.isUser ? 'text-green-800' : 'text-gray-600'
                }`}>
                  {user.saved} kg
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}