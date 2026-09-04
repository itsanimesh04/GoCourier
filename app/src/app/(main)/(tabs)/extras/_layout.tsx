import { Stack } from 'expo-router';

export default function ExtrasStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="custom-request" />
      <Stack.Screen name="parcel" />
    </Stack>
  );
}
