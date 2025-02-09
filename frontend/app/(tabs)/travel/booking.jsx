import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, SafeAreaView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Linking } from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";

const BookingPage = () => {
    const { selectedLegs, amount } = useLocalSearchParams();
    const [legs, setLegs] = useState([]);
    const [bookingAmount, setBookingAmount] = useState(null);

    useEffect(() => {
        if (selectedLegs) {
            setLegs(JSON.parse(selectedLegs));
        }
        if (amount) {
            setBookingAmount(amount);
        }
    }, [selectedLegs, amount]);

    const formatDuration = (duration) => {
        const minutes = Math.round(duration / 60);
        return `${minutes} min`;
    };

    const renderIcon = (mode) => {
        switch (mode) {
            case "WALK":
                return <FontAwesome name="male" size={24} color="#64748b" />;
            case "RAIL":
                return <MaterialIcons name="train" size={24} color="#0369a1" />;
            case "BUS":
                return <FontAwesome name="bus" size={24} color="#b45309" />;
            case "SUBWAY":
                return <FontAwesome name="subway" size={24} color="#7e22ce" />;
            default:
                return <FontAwesome name="question" size={24} color="#dc2626" />;
        }
    };

    const handlePayment = () => {
        const upiID = "deeppatel223204@okicici";
        const payeeName = "Deep Patel";
        const transactionRef = `TXN_${Date.now()}`;
        const transactionNote = "Booking Payment";
        const sendingAmt = bookingAmount || "0.00";

        const paymentUrl = `upi://pay?pa=${upiID}&pn=${payeeName}&am=${sendingAmt}&cu=INR&tn=${transactionNote}&tr=${transactionRef}`;

        Linking.canOpenURL(paymentUrl)
            .then((supported) => {
                if (!supported) {
                    Alert.alert(
                        "Error",
                        "No UPI apps installed on your device. Please install one and try again."
                    );
                } else {
                    return Linking.openURL(paymentUrl);
                }
            })
            .then(() => {
                setTimeout(() => {
                    router.push({
                        pathname: "/(tabs)/travel/tickets",
                        params: { legz: JSON.stringify(legs) }
                    });
                    // router.replace("/(tabs)/travel/index");
                }, 500);
            })
            .catch((err) => {
                Alert.alert("Error", "Failed to initiate UPI payment.");
            });
    };

    const renderLegCard = (leg, index) => (
        <View
            key={index}
            className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 mb-4"
        >
            {/* Mode and Duration Header */}
            <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center flex-1">
                    <View className="p-2.5 bg-gray-50 rounded-lg">
                        {renderIcon(leg.mode)}
                    </View>
                    <Text className="ml-3 font-semibold text-gray-800 text-lg flex-1" numberOfLines={1}>
                        {leg.mode === "WALK" ? "Walking" : leg.route || leg.mode}
                    </Text>
                </View>
                <View className="bg-gray-50 px-4 py-1.5 rounded-full">
                    <Text className="text-gray-600 font-medium">
                        {formatDuration(leg.duration)}
                    </Text>
                </View>
            </View>

            {/* Stations */}
            <View className="space-y-4">
                {/* From Station */}
                <View className="flex-row items-center">
                    <View className="mr-3">
                        <FontAwesome name="circle" size={12} color="#0284c7" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-gray-800 font-medium text-base" numberOfLines={2}>
                            {leg.from.name}
                        </Text>
                    </View>
                </View>

                {/* Vertical Line */}
                <View className="ml-[5.5px] h-8 border-l-2 border-dashed border-gray-200" />

                {/* To Station */}
                <View className="flex-row items-center">
                    <View className="mr-3">
                        <FontAwesome name="circle" size={12} color="#dc2626" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-gray-800 font-medium text-base" numberOfLines={2}>
                            {leg.to.name}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Distance */}
            <View className="mt-5 flex-row justify-end">
                <View className="bg-gray-50 px-4 py-1.5 rounded-full">
                    <Text className="text-gray-600 text-sm font-medium">
                        {leg.distance > 1000
                            ? `${(leg.distance / 1000).toFixed(1)} km`
                            : `${Math.round(leg.distance)} m`}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView 
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Header Section */}
                <View className="px-5 py-6 bg-white border-b border-gray-100">
                    <Text className="text-2xl font-bold text-gray-800">Booking Summary</Text>
                    <Text className="text-sm text-gray-600 mt-1">
                        Review your journey details below
                    </Text>
                </View>

                {/* Journey Cards Container */}
                <View className="px-4 pt-4">
                    {legs.map((leg, index) => renderLegCard(leg, index))}
                </View>

                {/* Price Card */}
                <View className="px-4 pb-4">
                    <View className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                        <Text className="text-gray-600 text-sm font-medium">Total Amount</Text>
                        <View className="flex-row items-center mt-1">
                            <Text className="text-3xl font-bold text-gray-800">₹{bookingAmount}</Text>
                            <Text className="ml-2 text-gray-500 text-sm">via UPI</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Fixed Payment Button */}
            <View className="absolute bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-gray-200">
                <TouchableOpacity
                    onPress={handlePayment}
                    className="bg-emerald-600 py-4 rounded-xl items-center shadow-sm active:bg-emerald-700"
                >
                    <Text className="text-white font-semibold text-lg">
                        Pay ₹{bookingAmount}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default BookingPage;