import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, ScrollView } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg"; // Import QR Code component
import { useLocalSearchParams } from "expo-router";

const TicketPage = () => {
  const { legz } = useLocalSearchParams(); // Fetching route parameter 'legz'
  const [legs, setLegs] = useState([
    {
      mode: "BUS",
      from: { name: "SWATANTRYAVEER SAVARKAR CHK-BHY(E)" },
      to: { name: "KASHIMIRA" },
      startTime: "2025-01-17T09:15:00",
      endTime: "2025-01-17T09:45:00",
      route: "DINDOSHI BUS STN. - BHAYANDER STN.(E)",
      distance: 3820,
    },
    {
      mode: "SUBWAY",
      from: { name: "CHURCHGATE" },
      to: { name: "ANDHERI" },
      startTime: "2025-01-17T10:00:00",
      endTime: "2025-01-17T10:30:00",
      route: "WESTERN LINE",
      distance: 21140,
    },
    {
      mode: "RAIL",
      from: { name: "BANDRA TERMINUS" },
      to: { name: "SURAT" },
      startTime: "2025-01-17T11:00:00",
      endTime: "2025-01-17T14:00:00",
      route: "AVANTIKA EXPRESS",
      distance: 263000,
    },
  ]); // Initial state for legs

  useEffect(() => {
    if (legz) {
      try {
        // Parse the legz and set it to legs state
        const parsedLegs = JSON.parse(legz);
        setLegs(parsedLegs);
      } catch (error) {
        console.error("Error parsing legs:", error);
        setLegs([]); // Fallback if parsing fails
      }
    }
  }, [legz]); // Re-run effect when legz changes

  // Helper function to calculate duration
  const getDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const durationInMinutes = Math.floor((endTime - startTime) / (1000 * 60));
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  // Mode-specific icons and colors
  const modeStyles = {
    BUS: { color: "text-blue-600", icon: "bus" },
    SUBWAY: { color: "text-green-600", icon: "subway" },
    RAIL: { color: "text-red-600", icon: "train" },
  };

  if (legs.length === 0) {
    // Display a message if there are no legs to display
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-1 justify-center items-center">
          <Text className="text-xl text-gray-500">
            No ticket data available.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const transportLegs = legs.filter(
    (leg) => ["RAIL", "SUBWAY", "BUS"].includes(leg.mode)
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="p-4 mt-2">
        {transportLegs.map((leg, index) => {
          const mode = modeStyles[leg.mode];
          return (
            <View
              key={index}
              className="flex-row justify-between items-center rounded-lg shadow-md p-4 mb-6 bg-white"
            >
              {/* Left Section: Ticket Info */}
              <View className="flex-1 mr-4">
                {/* Mode and Title */}
                <View className="flex-row items-center mb-4">
                  <FontAwesome5
                    name={mode?.icon || "question"}
                    size={20}
                    color="#065f46"
                    className="mr-2"
                  />
                  <Text className={`text-lg font-bold text-emerald-700`}>
                    {leg.mode === "RAIL" && "Train Ticket"}
                    {leg.mode === "SUBWAY" && "Subway Ticket"}
                    {leg.mode === "BUS" && "Bus Ticket"}
                  </Text>
                </View>

                {/* From and To */}
                <View className="mb-4">
                  <Text className="text-sm text-gray-500">From:</Text>
                  <Text
                    className="text-base font-medium text-gray-800 truncate"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {leg.from.name}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-2">To:</Text>
                  <Text
                    className="text-base font-medium text-gray-800 truncate"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {leg.to.name}
                  </Text>
                </View>

                {/* Time Taken and Distance */}
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-sm text-gray-500">
                    Time Taken:{" "}
                    <Text className="text-base font-medium text-gray-800">
                      {getDuration(leg.startTime, leg.endTime)}
                    </Text>
                  </Text>
                </View>

                {/* Route */}
                <View>
                  <Text className="text-sm text-gray-500">Route:</Text>
                  <Text
                    className="text-base font-medium text-gray-800 truncate"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ maxWidth: "100%" }}
                  >
                    {leg.route || ""}
                  </Text>
                </View>
              </View>

              {/* Right Section: QR Code */}
              <View>
                <QRCode
                  value={`Ticket for ${leg.mode} from ${leg.from.name} to ${leg.to.name}`}
                  size={90}
                  backgroundColor="white"
                  color="#065f46"
                />
              </View>
            </View>
          );
        })}

        {/* {legs.filter((leg) => !["RAIL", "SUBWAY", "BUS"].includes(leg.mode))
          .length === 0 ? null : (
          <Text className="text-sm text-gray-500 text-center mt-4">
            Only transport legs involving RAIL, SUBWAY, or BUS are displayed as
            tickets.
          </Text>
        )} */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TicketPage;
