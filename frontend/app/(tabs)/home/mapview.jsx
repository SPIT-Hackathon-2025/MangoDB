import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, SafeAreaView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios'; // Assuming you use axios for making requests
import { useRouter } from "expo-router";

const MapScreen = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        // Replace this with your actual API endpoint
        const response = await axios.get('https://cdbf-103-104-226-58.ngrok-free.app/api/issues');
        setIssues(response.data);
      } catch (error) {
        console.error('Error fetching issues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  // Default region for map (can be adjusted)
  const defaultRegion = {
    latitude: 19.127075,
    longitude: 72.829607,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <MapView
          style={{ flex: 1 }}
          initialRegion={defaultRegion}
        >
          {issues.map((issue) => (
            issue.location && (
              <Marker
                key={issue._id} // Use a unique identifier for the key
                coordinate={{
                  latitude: issue.location.latitude,
                  longitude: issue.location.longitude,
                }}
                title={issue.description || 'No description'}
              />
            )
          ))}
        </MapView>
      )}
    </SafeAreaView>
  );
};

export default MapScreen;