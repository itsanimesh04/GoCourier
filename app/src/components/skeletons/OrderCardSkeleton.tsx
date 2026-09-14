import { View } from 'react-native';
import { SkeletonBlock } from '../ui';

export default function OrderCardSkeleton() {
  return (
    <View className="rounded-xl border border-border p-4">
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1 gap-1.5">
          <SkeletonBlock className="h-4 w-24 rounded" />
          <SkeletonBlock className="h-3.5 w-36 rounded" />
        </View>
        <SkeletonBlock className="h-5 w-24 rounded-lg" />
      </View>
      <View className="mt-3.5 flex-row justify-between">
        <SkeletonBlock className="h-4 w-28 rounded" />
        <SkeletonBlock className="h-4 w-16 rounded" />
      </View>
    </View>
  );
}
