import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableHighlight,
  TouchableOpacity,
  Alert,
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import { useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons, FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import Modal from "react-native-modal";
import { router } from "expo-router";

// Minimal map style for a cleaner look
const MINIMAL_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#e8f5e9" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#b3e5fc" }],
  },
];

// Decode polyline function
const decodePolyline = (encoded) => {
  let index = 0,
    len = encoded.length;
  let lat = 0,
    lng = 0;
  const coordinates = [];

  while (index < len) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }
  return coordinates;
};

const MapScreen = () => {
  const { id, route, overview_polyline } = useLocalSearchParams();
  const [decodedLegs, setDecodedLegs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [selectedLegs, setSelectedLegs] = useState([]);
  const [amount, setAmount] = useState(0); // Track the total cost
  const mapRef = useRef(null);
  const [renderMap, setRenderMap] = useState(false); // State to track if map is rendered

  const modeColors = {
    WALK: "#77DD77", // Light green
    RAIL: "#779ECB", // Soft blue
    BUS: "#FFB347", // Orange
    METRO: "#008080", // Lavender
    SUBWAY: "#008080",
  };

  // Handle leg selection
  const handleLegSelection = (leg) => {
    if (leg.mode === "WALK") return; // Ignore selection for walking legs

    setSelectedLegs((prev) => {
      const isSelected = prev.some(
        (selectedLeg) =>
          selectedLeg.startTime === leg.startTime &&
          selectedLeg.endTime === leg.endTime
      );

      setAmount(modalContent?.totalCost || 0);

      if (isSelected) {
        return prev.filter(
          (selectedLeg) =>
            selectedLeg.startTime !== leg.startTime ||
            selectedLeg.endTime !== leg.endTime
        );
      } else {
        return [...prev, leg];
      }
    });
  };

  const isLegSelected = (leg) => {
    if (leg.mode === "WALK") return false;
    return selectedLegs.some(
      (selectedLeg) =>
        selectedLeg.startTime === leg.startTime &&
        selectedLeg.endTime === leg.endTime
    );
  };

  const renderLegIcon = (mode) => {
    switch (mode) {
      case "WALK":
        return <FontAwesome name="male" size={24} color={modeColors["WALK"]} />;
      case "RAIL":
        return (
          <MaterialIcons name="train" size={24} color={modeColors["RAIL"]} />
        );
      case "BUS":
        return <FontAwesome name="bus" size={24} color={modeColors["BUS"]} />;
      case "SUBWAY":
        return (
          <FontAwesome name="subway" size={24} color={modeColors["METRO"]} />
        );
      default:
        return <FontAwesome name="question" size={24} color="red" />;
    }
  };

  const [debouncedRoute, setDebouncedRoute] = useState(route);
  useEffect(() => {
    if (route) {
      setDebouncedRoute(route);
    } else if (overview_polyline) {
      setDebouncedRoute(overview_polyline);
    }
  }, [route, overview_polyline]);

  const handleMapReady = () => {
    setTimeout(() => {
      if (decodedLegs.length > 0) {
        const firstLeg = decodedLegs[0].coordinates[0];
        mapRef.current.animateToRegion(
          {
            latitude: firstLeg.latitude,
            longitude: firstLeg.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          },
          1000
        );
      }
      setRenderMap(true);
    }, 200);
  };

  // Update decoded legs on screen focus
  useFocusEffect(
    React.useCallback(() => {
      if (debouncedRoute && !overview_polyline) {
        try {
          const parsedRoute = JSON.parse(debouncedRoute);
          setModalContent(parsedRoute);
          if (parsedRoute.legs) {
            const legsWithColors = parsedRoute.legs.map((leg) => {
              const coordinates = decodePolyline(leg.legGeometry.points);
              return {
                coordinates,
                color: modeColors[leg.mode] || "#000000",
                mode: leg.mode,
              };
            });
            setDecodedLegs(legsWithColors);
          } else {
            console.warn("Route legs are missing.");
          }
        } catch (error) {
          console.error("Error parsing route:", error);
        } finally {
          setIsLoading(false);
        }
      } else if (debouncedRoute && overview_polyline) {
        const coordinates = decodePolyline(debouncedRoute);
        setDecodedLegs([{ coordinates, color: "#000000" }]);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    }, [debouncedRoute])
  );

  useEffect(() => {
    return () => {
      setDecodedLegs([]);
      setModalContent(null);
      setSelectedLegs([]);
      console.log("Cleanup completed");
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading map data...</Text>
      </View>
    );
  }

  if (!debouncedRoute) {
    return (
      <View style={styles.errorContainer}>
        <Text>No route data available. Please go back and try again.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        customMapStyle={MINIMAL_MAP_STYLE}
        onMapReady={handleMapReady}
        region={{
          latitude:
            decodedLegs.length > 0
              ? decodedLegs[0].coordinates[0].latitude
              : 19.29462,
          longitude:
            decodedLegs.length > 0
              ? decodedLegs[0].coordinates[0].longitude
              : 72.85618,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation={true}
      >
        {renderMap &&
          decodedLegs.map((leg, index) => (
            <React.Fragment key={index}>
              <Polyline
                coordinates={leg.coordinates}
                strokeColor={modeColors[leg.mode] || "#000000"} // Use modeColors for strokeColor
                strokeWidth={4}
              />
              <Marker
                coordinate={leg.coordinates[0]}
                pinColor={index === 0 ? "green" : "black"}
                onPress={() => {
                  Alert.alert(
                    "Pokestop View",
                    "Would you like to view this location in Street View?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "View",
                        onPress: () =>
                          router.push({
                            pathname: "/(tabs)/travel/PhotoView",
                            params: {
                              latitude: leg.coordinates[0].latitude,
                              longitude: leg.coordinates[0].longitude,
                            },
                          }),
                      },
                    ]
                  );
                }}
              />
              <Marker
                coordinate={leg.coordinates[leg.coordinates.length - 1]}
                pinColor={index === decodedLegs.length - 1 ? "red" : "black"}
                onPress={() => {
                  Alert.alert(
                    "Pokestop View",
                    "Would you like to view this location in Street View?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "View",
                        onPress: () =>
                          router.push({
                            pathname: "/(tabs)/travel/PhotoView",
                            params: {
                              latitude:
                                leg.coordinates[leg.coordinates.length - 1].latitude,
                              longitude:
                                leg.coordinates[leg.coordinates.length - 1].longitude,
                            },
                          }),
                      },
                    ]
                  );
                }}
              />
            </React.Fragment>
          ))}
      </MapView>
      <TouchableHighlight
        underlayColor="rgba(6, 95, 70, 1)"
        style={styles.button}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.buttonText}>View Route</Text>
      </TouchableHighlight>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        onBackButtonPress={() => setIsModalVisible(false)}
        style={styles.bottomSheetModal}
      >
        <View style={styles.modalContent}>
          {modalContent ? (
            <View style={styles.modalInnerContainer}>
              <ScrollView style={styles.legsContainer}>
                {modalContent.legs.map((leg, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.legCard,
                      isLegSelected(leg) && styles.selectedLegCard,
                      leg.mode === "WALK" && styles.walkingLegCard,
                    ]}
                    onPress={() => handleLegSelection(leg)}
                    disabled={leg.mode === "WALK"}
                  >
                    <View style={styles.legCardHeader}>
                      <View style={styles.legIconContainer}>
                        {renderLegIcon(leg.mode)}
                      </View>
                      <Text style={styles.legModeTitle}>
                        {leg.mode === "WALK"
                          ? "Walking"
                          : leg.mode === "BUS"
                            ? `Bus ${leg.routeShortName || ''}`
                            : leg.mode}
                      </Text>
                    </View>

                    <View style={styles.legCardContent}>
                      <View style={styles.legLocationInfo}>
                        <Text style={styles.legInfoLabel}>From:</Text>
                        <Text style={styles.legInfoText}>{leg.from.name}</Text>
                        <Text style={styles.legInfoLabel}>To:</Text>
                        <Text style={styles.legInfoText}>{leg.to.name}</Text>
                      </View>

                      <View style={styles.legDetailsGrid}>
                        <View style={styles.legDetailsColumn}>
                          <Text style={styles.legDetailsLabel}>Distance</Text>
                          <Text style={styles.legDetailsValue}>
                            {leg.distance > 1000
                              ? `${(leg.distance / 1000).toFixed(1)} km`
                              : `${Math.round(leg.distance)} m`}
                          </Text>
                        </View>
                        <View style={styles.legDetailsColumn}>
                          <Text style={styles.legDetailsLabel}>Duration</Text>
                          <Text style={styles.legDetailsValue}>
                            {Math.round(leg.duration / 60)} mins
                          </Text>
                        </View>
                      </View>

                      <View style={styles.legTimeInfo}>
                        <Text style={styles.legTimeLabel}>Start Time</Text>
                        <Text style={styles.legTimeValue}>
                          {new Date(leg.startTime).toLocaleTimeString()}
                        </Text>
                        <Text style={styles.legTimeLabel}>End Time</Text>
                        <Text style={styles.legTimeValue}>
                          {new Date(leg.endTime).toLocaleTimeString()}
                        </Text>
                      </View>

                      {leg.mode === "BUS" && (
                        <View style={styles.additionalInfo}>
                          <Text style={styles.additionalInfoLabel}>Route</Text>
                          <Text style={styles.additionalInfoText}>
                            {leg.routeLongName}
                          </Text>
                          <Text style={styles.additionalInfoLabel}>Agency</Text>
                          <Text style={styles.additionalInfoText}>
                            {leg.agencyName}
                          </Text>
                        </View>
                      )}

                      {leg.mode === "RAIL" && (
                        <View style={styles.additionalInfo}>
                          <Text style={styles.additionalInfoLabel}>Line</Text>
                          <Text style={styles.additionalInfoText}>
                            {leg.routeLongName}
                          </Text>
                          <Text style={styles.additionalInfoLabel}>Agency</Text>
                          <Text style={styles.additionalInfoText}>
                            {leg.agencyName}
                          </Text>
                        </View>
                      )}
                    </View>

                    {leg.mode !== "WALK" && (
                      <View style={styles.checkboxContainer}>
                        <View
                          style={[
                            styles.checkbox,
                            isLegSelected(leg) && styles.checkboxSelected,
                          ]}
                        >
                          {isLegSelected(leg) && (
                            <MaterialIcons
                              name="check"
                              size={16}
                              color="white"
                            />
                          )}
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.buttonContainer}>
                <TouchableHighlight
                  underlayColor="rgba(6, 95, 70, 0.98)"
                  style={[
                    styles.bookNowButton,
                    selectedLegs.length === 0 && styles.bookNowButtonDisabled,
                  ]}
                  disabled={selectedLegs.length === 0}
                  onPress={() => {
                    setIsModalVisible(false);
                    router.push({
                      pathname: "/(tabs)/travel/booking",
                      params: {
                        selectedLegs: JSON.stringify(selectedLegs),
                        amount: amount,
                      },
                    });
                  }}
                >
                  <Text style={styles.bookNowButtonText}>
                    {selectedLegs.length === 0
                      ? "Select rides to book"
                      : `Book ${selectedLegs.length} selected ${selectedLegs.length === 1 ? "ride" : "rides"}`}
                  </Text>
                </TouchableHighlight>
              </View>
            </View>
          ) : (
            <Text>No route details available.</Text>
          )}
        </View>
      </Modal>
      <View style={styles.legendContainer}>
        {Object.entries(modeColors).map(([mode, color]) => (
          <View key={mode} style={styles.legendItem}>
            <View style={[styles.colorBox, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{mode}</Text>
          </View>
        ))}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  bottomSheetModal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: "80%",
    width: "100%",
  },
  modalInnerContainer: {
    flex: 1,
    flexDirection: "column",
  },
  legsContainer: {
    flex: 1,
    padding: 16,
  },
  legCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "column",
    position: 'relative',
    minHeight: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedLegCard: {
    backgroundColor: "#f0fdf4",
    borderColor: "#064e3b",
  },
  walkingLegCard: {
    backgroundColor: "#ffffff",
    opacity: 0.7,
  },
  legCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 10,
  },
  legIconContainer: {
    marginRight: 10,
  },
  legModeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  legCardContent: {
    flex: 1,
  },
  legLocationInfo: {
    marginBottom: 10,
  },
  legInfoLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 5,
  },
  legInfoText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  legDetailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 10,
  },
  legDetailsColumn: {
    alignItems: "center",
  },
  legDetailsLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 5,
  },
  legDetailsValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  legTimeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  legTimeLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  legTimeValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  additionalInfo: {
    backgroundColor: "#f3f4f6",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  additionalInfoLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 5,
  },
  additionalInfoText: {
    fontSize: 14,
    fontWeight: "500",
  },
  checkboxContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#064e3b",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#064e3b",
  },
  checkboxDisabled: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#94a3b8",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  button: {
    position: "absolute",
    bottom: 14,
    right: 6,
    backgroundColor: "rgba(6, 95, 70, 1)",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  buttonContainer: {
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "white",
  },
  bookNowButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
    backgroundColor: "#064e3b",
  },
  bookNowButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  bookNowButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  legendContainer: {
    position: "absolute",
    bottom: 5,
    left: 5,
    backgroundColor: "rgba(255, 255, 255, 1)",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
  },
  
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  
  colorBox: {
    width: 15,
    height: 15,
    marginRight: 8,
    borderRadius: 3,
  },
  
  legendText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
  },
  
});


export default MapScreen;
