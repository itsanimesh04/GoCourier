import { ScrollView, View } from 'react-native';
import { SkeletonBlock } from '../ui';
import FoodCardSkeleton from './FoodCardSkeleton';

export default function RestaurantScreenSkeleton() {
  return (
    <ScrollView className="flex-1 bg-bg" showsVerticalScrollIndicator={false}>
      {/* Hero Header Skeleton */}
      <View className="relative h-[220px] bg-surface-2">
        <SkeletonBlock className="h-full w-full rounded-none" />
        <View className="absolute bottom-0 left-0 right-0 p-4">
          <SkeletonBlock className="mb-2 h-4 w-14 rounded-lg bg-surface/80" />
          <SkeletonBlock className="h-7 w-52 rounded-lg" />
          <SkeletonBlock className="mt-2 h-4 w-28 rounded-md" />
          <View className="mt-3 flex-row items-center gap-3">
            <SkeletonBlock className="h-3.5 w-12 rounded" />
            <SkeletonBlock className="h-3.5 w-14 rounded" />
            <SkeletonBlock className="h-3.5 w-24 rounded" />
          </View>
        </View>
      </View>

      {/* Content Skeleton */}
      <View className="px-4 pt-5">
        <View className="mb-4 flex-row items-center justify-between">
          <SkeletonBlock className="h-4 w-16 rounded" />
          <SkeletonBlock className="h-9 w-20 rounded-xl" />
        </View>

        {/* Category Pills Skeleton */}
        <View className="mb-5 flex-row gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-8 w-18 rounded-full" />
          ))}
        </View>

        {/* Food Items — 2-col to match live RestaurantScreen layout */}
        <View className="gap-3 pb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} className="flex-row items-start gap-3">
              <View className="min-w-0 flex-1">
                <FoodCardSkeleton />
              </View>
              <View className="min-w-0 flex-1">
                <FoodCardSkeleton />
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
