import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, Vibration, Alert } from "react-native";
import {
  FlingGestureHandler,
  Directions,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import io from "socket.io-client";
import { router } from "expo-router";

const Account = () => {
  const [countdown, setCountdown] = useState(3);
  const [attempts, setAttempts] = useState(0);
  const socketRef = useRef(null);
  const countdownInterval = useRef(null);
  const isConfirmed = useRef(false); // To prevent unnecessary SOS triggers

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://10.10.121.39:5001", {
        transports: ["websocket"],
        reconnection: true,
      });
    }
  }, []);

  useEffect(() => {
    if (attempts < 3 && !isConfirmed.current) {
      startCountdown();
    }
    return () => clearInterval(countdownInterval.current);
  }, [attempts]);

  const startCountdown = () => {
    clearInterval(countdownInterval.current);
    setCountdown(3);

    countdownInterval.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          Vibration.vibrate(800);
          return prev - 1;
        } else {
          clearInterval(countdownInterval.current);
          handleMissedResponse();
          return 3;
        }
      });
    }, 1000);
  };

  const handleMissedResponse = () => {
    if (isConfirmed.current) return; // Stop if already confirmed
    if (attempts < 2) {
      setAttempts((prev) => prev + 1);
    } else {
      emitEmergencySignal();
    }
  };

  const respondToCheck = () => {
    isConfirmed.current = true;
    clearInterval(countdownInterval.current);
    setCountdown(3);
    setAttempts(0);
    Alert.alert("Response Received", "You confirmed your presence.");
    goBack();
  };

  const emitEmergencySignal = () => {
    if (!isConfirmed.current) {
      socketRef.current.emit("sendForumMessage", {
        username: "user",
        message: "Alert: Emergency Signal Sent",
        timestamp: new Date().toISOString(),
      });
      Alert.alert("Emergency Alert Sent", "Notified all users.");
      goBack();
    }
  };

  const goBack = () => {
    router.push("/home");
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FlingGestureHandler
        direction={Directions.LEFT}
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === State.END) {
            respondToCheck();
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
              ⚠️ ATTENTION REQUIRED
            </Text>
            <Text style={{ color: "white", fontSize: 18, marginTop: 10 }}>
              Swipe left or tap below within {countdown} seconds
            </Text>
            <TouchableOpacity
              onPress={respondToCheck}
              style={{
                marginTop: 20,
                backgroundColor: "black",
                padding: 15,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "white", fontSize: 16 }}>Confirm Presence</Text>
            </TouchableOpacity>
          </View>
        </View>
      </FlingGestureHandler>
    </GestureHandlerRootView>
  );
};

export default Account;