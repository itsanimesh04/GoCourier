import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const heroImage = require('../../assets/food/chicken-biryani.jpg');

export default function AuthShell({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <View className="relative h-[24%] min-h-[140px] overflow-hidden bg-primary">
        <Image source={heroImage} contentFit="cover" className="absolute inset-0 opacity-30" />
        <LinearGradient
          colors={['rgba(255,0,64,0.35)', 'rgba(255,0,64,0.92)']}
          style={{ position: 'absolute', inset: 0 }}
        />
        <View className="mt-auto px-5 pb-5">
          <Pressable onPress={() => router.push('/')}>
            <Text className="font-display text-xl font-bold tracking-tight text-on-primary">GoCourier</Text>
          </Pressable>
          <Text className="mt-1 font-sans text-sm text-on-primary/90">Campus food, delivered on time</Text>
        </View>
      </View>
      <View className="flex-1 px-5 pt-6" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <Text className="font-display text-2xl font-bold text-fg">{title}</Text>
        <Text className="mt-1.5 font-sans text-sm text-muted">{subtitle}</Text>
        <View className="mt-6">{children}</View>
        <View className="mt-6">{footer}</View>
      </View>
    </View>
  );
}
