import { Package, ShoppingBag } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { usePalette } from '../theme/ThemeProvider';

export default function ExtrasServiceCards() {
  const colors = usePalette();
  return (
    <View className="gap-3">
      <Pressable
        onPress={() => router.push('/extras/custom-request')}
        className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4"
      >
        <View className="rounded-xl bg-primary/15 p-3">
          <ShoppingBag size={20} color={colors.primary} />
        </View>
        <View className="flex-1">
          <Text className="font-display text-sm font-semibold uppercase text-fg">Custom request</Text>
          <Text className="mt-0.5 font-sans text-xs text-muted">Need something specific? We’ll quote and fetch it.</Text>
        </View>
      </Pressable>
      <Pressable
        onPress={() => router.push('/extras/parcel')}
        className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4"
      >
        <View className="rounded-xl bg-primary/15 p-3">
          <Package size={20} color={colors.primary} />
        </View>
        <View className="flex-1">
          <Text className="font-display text-sm font-semibold uppercase text-fg">Parcel pickup & drop</Text>
          <Text className="mt-0.5 font-sans text-xs text-muted">Send or collect parcels with tonight’s batch.</Text>
        </View>
      </Pressable>
    </View>
  );
}
