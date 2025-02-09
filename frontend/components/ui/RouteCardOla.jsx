import React, { useState } from "react";
import { View, Text, ScrollView, TouchableHighlight } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import CarbonSave from "../carbonsave";

const RouteCardOla = ({ route }) => {
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  const modeIcons = {
    WALK: <FontAwesome5 name="walking" size={22} color="#065f46" />,
    BUS: <FontAwesome5 name="bus" size={22} color="#065f46" />,
    RAIL: <FontAwesome5 name="train" size={22} color="#065f46" />,
    SUBWAY: <FontAwesome5 name="subway" size={22} color="#065f46" />,
  };

  // Extract route details
  const { legs, overview_polyline } = route.routes[0];
  console.log(legs);
  const totalDistance = legs.reduce((sum, leg) => sum + leg.distance, 0);
  const carbonValue = (0.192 * totalDistance) / 1000;
  const totalDuration = legs.reduce((sum, leg) => sum + leg.duration, 0);

  const reachByTime = new Date(
    Date.now() + totalDuration * 1000
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const calculateCabFare = (response) => {
    // Average Ola Mini fares
    const baseFare = 50; // ₹50 base fare
    const costPerKm = 12; // ₹12 per km

    // Extract distance from the response
    const totalDistanceMeters = response.routes[0].legs[0].distance; // In meters
    const totalDistanceKm = totalDistanceMeters / 1000; // Convert to kilometers

    // Calculate total fare
    const totalFare = baseFare + totalDistanceKm * costPerKm;

    // Return the rounded total fare
    return Math.round(totalFare);
  };

  // Example Usage
  const response = {
    // Include your provided response JSON here
    routes: [
      {
        legs: [
          {
            distance: 3836, // Example distance in meters
          },
        ],
      },
    ],
  };

  const totalFare = calculateCabFare(route);
  // Extract time and mode for each leg
  const legTimes = legs.map((leg) => ({
    mode: "DRIVE", // Assuming all legs are by car; adjust if data includes mode.
    timeInMinutes: Math.round(leg.duration / 60),
    readableDistance: leg.readable_distance,
    instructions: leg.steps.map((step) => step.instructions).join(", "),
    cost: Number(leg.readable_distance * 15).toFixed(0),
  }));

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

    setShowLeftFade(contentOffset.x > 0);
    setShowRightFade(
      contentOffset.x < contentSize.width - layoutMeasurement.width
    );
  };

  return (
    <View className="p-5 mb-5 bg-white rounded-lg shadow-md border border-gray-200">
      {/* Modes of Transport */}
      <View className="relative">
        {/* Left Fade */}
        {showLeftFade && (
          <LinearGradient
            colors={["rgba(255,255,255,1)", "rgba(255,255,255,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 32,
              zIndex: 1,
            }}
          />
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
          }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {legTimes.map((leg, index) => (
            <View key={index} className="flex-row items-center">
              <View className="flex items-center">
                {modeIcons[leg.mode] || (
                  <FontAwesome5 name="car" size={22} color="#065f46" />
                )}
                <Text className="text-sm text-gray-700 mt-2 font-medium">
                  {leg.timeInMinutes} min
                </Text>
              </View>
              {/* Arrow Icon (not after the last mode) */}
              {index < legTimes.length - 1 && (
                <Text>
                  <FontAwesome5
                    name="arrow-right"
                    size={14}
                    color="#065f46"
                    className="mx-4"
                  />
                </Text>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Right Fade */}
        {showRightFade && (
          <LinearGradient
            colors={["rgba(255,255,255,0)", "rgba(255,255,255,1)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: 12,
              zIndex: 1,
            }}
          />
        )}
      </View>

      {/* Separator */}
      <View className="h-[1px] bg-gray-200 my-3" />

      {/* Total Time and Reach By */}
      <View className="flex-row justify-between items-center my-1">
        <View>
          <Text className="text-sm text-gray-600">
            Total Duration:{" "}
            <Text className="font-semibold text-md text-emerald-800">
              {Math.round(totalDuration / 60)} min
            </Text>
          </Text>
          {/* <Text className="text-xs text-gray-500">Reach By: {reachByTime}</Text> */}
        </View>
        <CarbonSave value={Number(carbonValue.toFixed(3)) || 0} />
      </View>

      {/* Separator */}
      <View className="h-[1px] bg-gray-200 my-3" />

      {/* Fare and Small Button */}
      <View className="flex-row justify-between items-center mt-1">
        <Text className="text-md text-gray-800 font-semibold">
          Fare:{" "}
          <Text className="text-lg font-bold text-emerald-800">
            ₹{totalFare || "80"}
          </Text>
        </Text>
        {/* Styled TouchableHighlight Button */}
        <TouchableHighlight
          onPress={() =>
            router.push({
              pathname: "/(tabs)/travel/mapscreen",
              params: {
                overview_polyline,
                // legs: JSON.stringify(legs),
              },
            })
          }
          underlayColor="#047857"
          style={{
            backgroundColor: "#047857",
            borderRadius: 6,
            paddingVertical: 8,
            paddingHorizontal: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center justify-between space-x-4 w-[4rem]">
            <Text className="text-md font-medium text-white">Travel</Text>
            <FontAwesome5 name="arrow-right" size={14} color="#ffffff" />
          </View>
        </TouchableHighlight>
      </View>
    </View>
  );
};

export default RouteCardOla;
