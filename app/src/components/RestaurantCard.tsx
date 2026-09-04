import { Heart, Star } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../store';
import { selectIsRestaurantWishlisted, toggleRestaurantWishlist } from '../store/slices/wishlistSlice';
import type { Restaurant } from '../utils/types';
import { RemoteImage } from './VegBadge';
import { usePalette } from '../theme/ThemeProvider';
import { cn } from '../utils/utils';

export default function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const dispatch = useAppDispatch();
  const colors = usePalette();
  const wishlisted = useAppSelector(selectIsRestaurantWishlisted(restaurant.id));

  return (
    <Pressable
      onPress={() => router.push(`/food/restaurants/${restaurant.id}`)}
      className="relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-border bg-surface"
    >
      <View className="aspect-[4/3] w-full overflow-hidden bg-surface-2">
        <RemoteImage uri={restaurant.imageUrl} className="h-full w-full" recyclingKey={restaurant.id} />
        <View
          className={cn(
            'absolute left-2 top-2 rounded-lg px-2 py-0.5',
            restaurant.isOpen ? 'bg-green-500' : 'bg-surface'
          )}
        >
          <Text
            className={cn(
              'font-sans text-[10px] font-bold uppercase',
              restaurant.isOpen ? 'text-white' : 'text-fg'
            )}
          >
            {restaurant.isOpen ? 'Open' : 'Closed'}
          </Text>
        </View>
      </View>
      <View className="p-3">
        <View className="flex-row items-start justify-between gap-2">
          <Text numberOfLines={2} className="flex-1 font-display text-sm font-semibold text-fg">
            {restaurant.name}
          </Text>
          <View className="flex-row items-center gap-0.5">
            <Star size={11} color="#eab308" fill="#eab308" />
            <Text className="font-sans text-[11px] text-muted">{restaurant.rating.toFixed(1)}</Text>
          </View>
        </View>
        <Text numberOfLines={1} className="mt-1 font-sans text-[11px] text-muted">
          {restaurant.cuisine}
        </Text>
        <Text numberOfLines={2} className="mt-1 font-sans text-[11px] text-muted">
          {restaurant.address}
        </Text>
      </View>
      <Pressable
        onPress={() => dispatch(toggleRestaurantWishlist(restaurant.id))}
        className="absolute right-2 top-2 z-10 rounded-xl bg-surface/90 p-1.5"
      >
        <Heart
          size={16}
          color={wishlisted ? colors.primary : colors.fg}
          fill={wishlisted ? colors.primary : 'transparent'}
        />
      </Pressable>
    </Pressable>
  );
}
