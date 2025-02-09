import { Stack } from "expo-router";

export default function TravelLayout() {
    return (
        <Stack>
            <Stack.Screen 
                name="index" 
                options={{
                    headerTitle: 'Lost & Found',
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
                name="found" 
                options={{
                    headerTitle: 'Found Item',
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
                name="lost" 
                options={{
                    headerTitle: 'Lost Item',
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
