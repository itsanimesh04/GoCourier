import { Stack } from 'expo-router';
import Header from '../../components/Header';
import { View } from 'react-native';

export default function MainLayout() {
  return (
    <View className="flex-1 bg-bg">
      <Header />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="checkout" />
      </Stack>
    </View>
  );
}
