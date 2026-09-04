import { Stack } from 'expo-router';

export default function FoodStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="restaurants/[id]" />
      <Stack.Screen name="foods/[id]" />
    </Stack>
  );
}
