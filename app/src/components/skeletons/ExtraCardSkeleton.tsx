import { View } from 'react-native';
import { SkeletonBlock } from '../ui';

export default function ExtraCardSkeleton() {
  return (
    <View className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-border bg-surface">
      <View className="aspect-square w-full overflow-hidden bg-surface-2">
        <SkeletonBlock className="h-full w-full rounded-none" />
      </View>

      <View className="items-center p-2.5">
        <SkeletonBlock className="h-3 w-14 rounded" />
        <SkeletonBlock className="mt-1.5 h-4 w-24 rounded-md" />
        <SkeletonBlock className="mt-1.5 h-3 w-16 rounded" />
        <SkeletonBlock className="mt-2 h-4 w-12 rounded-md" />
      </View>

      <View className="mt-auto px-2 pb-2.5">
        <SkeletonBlock className="h-7 w-full rounded-lg" />
      </View>
    </View>
  );
}
