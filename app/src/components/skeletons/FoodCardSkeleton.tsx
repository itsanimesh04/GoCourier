import { View } from 'react-native';
import { SkeletonBlock } from '../ui';

export default function FoodCardSkeleton() {
  return (
    <View className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-border bg-surface">
      <View className="aspect-[4/3] w-full overflow-hidden bg-surface-2">
        <SkeletonBlock className="h-full w-full rounded-none" />
      </View>

      <View className="p-3">
        <View className="mb-2 flex-row items-center gap-1.5">
          <SkeletonBlock className="h-3.5 w-3.5 rounded-sm" />
          <SkeletonBlock className="h-4 w-12 rounded-md" />
        </View>

        <View className="gap-1.5">
          <SkeletonBlock className="h-4 w-4/5 rounded-md" />
          <SkeletonBlock className="h-4 w-3/5 rounded-md" />
        </View>

        <View className="mt-2 flex-row items-center gap-2">
          <SkeletonBlock className="h-3 w-8 rounded" />
          <SkeletonBlock className="h-3 w-20 rounded" />
        </View>

        <View className="mt-2.5 gap-1">
          <SkeletonBlock className="h-3 w-full rounded" />
          <SkeletonBlock className="h-3 w-3/4 rounded" />
        </View>

        <View className="mt-3">
          <SkeletonBlock className="h-5 w-16 rounded-md" />
        </View>
      </View>

      <View className="mt-auto px-3 pb-3">
        <SkeletonBlock className="h-9 w-full rounded-lg" />
      </View>
    </View>
  );
}
