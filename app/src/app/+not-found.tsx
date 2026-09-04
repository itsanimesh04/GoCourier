import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center bg-bg px-6">
        <Text className="font-display text-2xl font-bold uppercase text-fg">Screen not found</Text>
        <Link href="/" className="mt-4">
          <Text className="font-sans text-sm font-semibold text-primary">Go home</Text>
        </Link>
      </View>
    </>
  );
}
