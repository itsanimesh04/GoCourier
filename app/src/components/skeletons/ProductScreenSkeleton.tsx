import { ScrollView, View } from 'react-native';
import { BottomBar, SkeletonBlock } from '../ui';

export default function ProductScreenSkeleton() {
  return (
    <View className="flex-1 bg-bg">
      <ScrollView className="flex-1" contentContainerClassName="pb-4" showsVerticalScrollIndicator={false}>
        {/* Product Image Skeleton */}
        <View className="aspect-[4/3] overflow-hidden bg-surface-2">
          <SkeletonBlock className="h-full w-full rounded-none" />
        </View>

        {/* Product Details Skeleton */}
        <View className="px-4 pt-5">
          <View className="mb-2 flex-row items-center gap-2">
            <SkeletonBlock className="h-4 w-4 rounded-sm" />
            <SkeletonBlock className="h-4 w-12 rounded-md" />
          </View>

          <SkeletonBlock className="h-7 w-4/5 rounded-lg" />
          <SkeletonBlock className="mt-2 h-4 w-3/5 rounded-md" />

          <View className="mt-3 gap-1">
            <SkeletonBlock className="h-3.5 w-full rounded" />
            <SkeletonBlock className="h-3.5 w-4/5 rounded" />
          </View>

          <SkeletonBlock className="mt-3 h-4 w-36 rounded" />
          <SkeletonBlock className="mt-3 h-7 w-24 rounded-lg" />

          <View className="mt-5 flex-row items-center justify-between">
            <SkeletonBlock className="h-10 w-28 rounded-xl" />
            <SkeletonBlock className="h-10 w-10 rounded-xl" />
          </View>
        </View>
      </ScrollView>

      <BottomBar>
        <SkeletonBlock className="h-12 w-full rounded-xl" />
      </BottomBar>
    </View>
  );
}
