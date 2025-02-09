import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const MapComponent = ({ issues }) => {
  // Extract the coordinates from the issues
  const coordinates = issues
    .filter(issue => issue.location && issue.location.latitude && issue.location.longitude)
    .map(issue => ({
      latitude: issue.location.latitude,
      longitude: issue.location.longitude,
    }));

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 19.6139, // Set initial map center, change based on your default location
          longitude: 72.2090,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {/* Iterate over the issues and place markers on the map */}
        {coordinates.map((coordinate, index) => (
          <Marker
            key={index}
            coordinate={coordinate}
            title={`Issue ${index + 1}`} // You can customize this title as per the issue
            description={`Latitude: ${coordinate.latitude}, Longitude: ${coordinate.longitude}`}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  map: {
    flex: 1,
    borderRadius: 10,
  },
});

export default MapComponent;
