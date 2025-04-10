import { Stack } from "expo-router";

export default function TravelLayout() {
    return (
        <Stack>
            <Stack.Screen 
                name="index" 
                options={{
                    headerTitle: 'Explore',
                    headerTitleAlign: 'center',
                    headerStyle: {
                        height: 80,
                        backgroundColor: '#03543F',
                    },
                    headerTitleStyle: {
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: 'white',
                    },
                }} 
            />
            <Stack.Screen 
                name="go" 
                options={{
                    headerTitle: 'Where To?',
                    headerTitleAlign: 'center',
                    headerStyle: {
                        height: 80,
                    },
                    headerTitleStyle: {
                        fontSize: 18,
                        fontWeight: 'bold',
                    },
                }} 
            />
            <Stack.Screen 
                name="routescreen" 
                options={{
                    headerTitle: 'Available Routes',
                    headerTitleAlign: 'center',
                    headerStyle: {
                        height: 80,
                    },
                    headerTitleStyle: {
                        fontSize: 18,
                        fontWeight: 'bold',
                    },
                }} 
            />
            <Stack.Screen 
                name="mapscreen" 
                options={{
                    headerTitle: 'Your Route',
                    headerTitleAlign: 'center',
                    headerStyle: {
                        height: 80,
                    },
                    headerTitleStyle: {
                        fontSize: 18,
                        fontWeight: 'bold',
                    },
                }} 
            />
            <Stack.Screen 
                name="booking" 
                options={{
                    headerTitle: 'Booking Summary',
                    headerTitleAlign: 'center',
                    headerStyle: {
                        height: 80,
                    },
                    headerTitleStyle: {
                        fontSize: 18,
                        fontWeight: 'bold',
                    },
                }} 
            />
            <Stack.Screen 
                name="tickets" 
                options={{
                    headerTitle: 'Tickets',
                    headerTitleAlign: 'center',
                    headerStyle: {
                        height: 80,
                    },
                    headerTitleStyle: {
                        fontSize: 18,
                        fontWeight: 'bold',
                    },
                }} 
            />
            <Stack.Screen 
                name="emergency" 
                options={{
                    headerTitle: 'Emergency',
                    headerTitleAlign: 'center',
                    headerStyle: {
                        height: 80,
                    },
                    headerTitleStyle: {
                        fontSize: 18,
                        fontWeight: 'bold',
                    },
                }} 
            />
        </Stack>
    );
}
