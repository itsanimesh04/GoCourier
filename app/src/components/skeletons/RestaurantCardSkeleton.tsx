import { View } from 'react-native';
import { SkeletonBlock } from '../ui';

export default function RestaurantCardSkeleton() {
  return (
    <View className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-border bg-surface">
      <View style={{ aspectRatio: 4 / 3, width: '100%', minHeight: 120 }} className="overflow-hidden bg-surface-2">
        <SkeletonBlock className="h-full w-full rounded-none" />
        <View className="absolute left-2 top-2">
          <SkeletonBlock className="h-4 w-12 rounded-lg bg-surface/80" />
        </View>
      </View>

      <View className="p-3">
        <View className="flex-row items-start justify-between gap-2">
          <SkeletonBlock className="h-4 w-28 rounded-md" />
          <SkeletonBlock className="h-3 w-6 rounded" />
        </View>

        <View className="mt-2">
          <SkeletonBlock className="h-3 w-16 rounded" />
        </View>

        <View className="mt-2 gap-1">
          <SkeletonBlock className="h-3 w-full rounded" />
          <SkeletonBlock className="h-3 w-2/3 rounded" />
        </View>
      </View>
    </View>
  );
}
