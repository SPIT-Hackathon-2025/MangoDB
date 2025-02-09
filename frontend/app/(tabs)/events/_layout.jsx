import { Stack } from "expo-router";

export default function EventsLayout() {
    return (
        <Stack>
            <Stack.Screen 
                name="index" 
                options={{
                    headerTitle: 'Events',
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
                    headerTintColor: 'white', // Set back button color to white
                }} 
            />
            <Stack.Screen 
                name="eventpage" 
                options={{
                    headerTitle: 'Event Details',
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
                    headerTintColor: 'white', // Set back button color to white
                }} 
            />
        </Stack>
    );
}
