import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Vibration } from "react-native";
import {
  FlingGestureHandler,
  Directions,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

const Account = ({ navigation }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      if (countdown > 0) {
        setCountdown((prev) => prev - 1);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Vibration.vibrate(800);
      } else {
        clearInterval(interval);
        triggerEmergencyCall();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  const triggerEmergencyCall = () => {
    alert("🚨 Calling emergency contacts...");
    // Add emergency call logic here
  };

  const cancelSOS = () => {
    alert("✅ Emergency canceled");
    navigation.goBack();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FlingGestureHandler
        direction={Directions.LEFT}
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === State.END) {
            cancelSOS();
          }
        }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: "#b30000",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 28, fontWeight: "bold" }}>
              ⚠️ EMERGENCY SOS
            </Text>
            <Text style={{ color: "white", fontSize: 18, marginTop: 10 }}>
              Swipe left within {countdown} seconds to cancel
            </Text>
            <TouchableOpacity
              onPress={cancelSOS}
              style={{
                marginTop: 20,
                backgroundColor: "black",
                padding: 15,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "white", fontSize: 16 }}>Cancel Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </FlingGestureHandler>
    </GestureHandlerRootView>
  );
};

export default Account;
