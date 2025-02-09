import { Stack } from "expo-router";

export default function TravelLayout() {
    return (
        <Stack>
            <Stack.Screen 
                name="index" 
                options={{
                    headerTitle: 'Issues',
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
                    headerTintColor: 'white',
                }} 
            />
            <Stack.Screen 
                name="mapview" 
                options={{
                    headerTitle: 'Issues near you',
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
                    headerTintColor: 'white',
                }} 
            />
        </Stack>
    );
}
