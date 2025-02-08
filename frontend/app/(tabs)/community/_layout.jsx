import { Stack } from "expo-router";

export default function TravelLayout() {
    return (
        <Stack>
            <Stack.Screen 
                name="index" 
                options={{
                    headerTitle: 'Communities',
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
                name="communitypage" 
                options={{
                    headerTitle: 'Community Page',
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
