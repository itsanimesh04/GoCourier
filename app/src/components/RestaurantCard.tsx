import { memo } from 'react';
import { Heart, Star, Clock, Store } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../store';
import { selectIsRestaurantWishlisted, toggleRestaurantWishlist } from '../store/slices/wishlistSlice';
import type { Restaurant } from '../utils/types';
import { RemoteImage } from './VegBadge';
import { usePalette } from '../theme/ThemeProvider';
import { cn } from '../utils/utils';
import { haptic } from '../utils/haptics';

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const dispatch = useAppDispatch();
  const colors = usePalette();
  const wishlisted = useAppSelector(selectIsRestaurantWishlisted(restaurant.id));

  const handleToggleWishlist = () => {
    haptic.light();
    dispatch(toggleRestaurantWishlist(restaurant.id));
  };

  return (
    <Pressable
      onPress={() => {
        haptic.selection();
        router.push(`/food/restaurants/${restaurant.id}`);
      }}
      className="relative w-full min-w-0 overflow-hidden rounded-3xl border border-border/80 bg-surface shadow-sm active:scale-[0.98]"
    >
      <View style={{ aspectRatio: 4 / 3, width: '100%', minHeight: 120 }} className="relative overflow-hidden bg-surface-2">
        {restaurant.imageUrl ? (
          <RemoteImage uri={restaurant.imageUrl} className="h-full w-full" recyclingKey={restaurant.id} />
        ) : (
          <View className="h-full w-full items-center justify-center bg-surface-2">
            <Store size={28} color={colors.muted} opacity={0.6} />
            <Text className="mt-1 font-display text-xs font-bold uppercase tracking-wider text-muted">
              {restaurant.name ? restaurant.name.slice(0, 2) : 'RT'}
            </Text>
          </View>
        )}

        {/* Status Pill */}
        <View
          className={cn(
            'absolute left-2.5 top-2.5 rounded-full px-2.5 py-0.5 shadow-sm',
            restaurant.isOpen ? 'bg-emerald-500' : 'bg-surface/90'
          )}
        >
          <Text
            className={cn(
              'font-sans text-[9px] font-bold uppercase tracking-wider',
              restaurant.isOpen ? 'text-white' : 'text-muted'
            )}
          >
            {restaurant.isOpen ? 'Open Now' : 'Closed'}
          </Text>
        </View>

        {/* ETA Badge */}
        {restaurant.etaMinutes ? (
          <View className="absolute bottom-2 left-2.5 flex-row items-center gap-1 rounded-full bg-surface/90 px-2 py-0.5 shadow-sm">
            <Clock size={10} color={colors.primary} />
            <Text className="font-sans text-[10px] font-bold text-fg">
              {restaurant.etaMinutes} min
            </Text>
          </View>
        ) : null}
      </View>

      <View className="p-3.5">
        <View className="flex-row items-start justify-between gap-2">
          <Text numberOfLines={1} className="flex-1 font-display text-sm font-bold text-fg">
            {restaurant.name}
          </Text>
          <View className="flex-row items-center gap-1 rounded-md bg-surface-2 px-1.5 py-0.5">
            <Star size={10} color="#f59e0b" fill="#f59e0b" />
            <Text className="font-sans text-[10px] font-bold text-fg">{restaurant.rating.toFixed(1)}</Text>
          </View>
        </View>

        <Text numberOfLines={1} className="mt-1 font-sans text-xs font-medium text-primary">
          {restaurant.cuisine}
        </Text>

        <Text numberOfLines={1} className="mt-0.5 font-sans text-xs leading-snug text-muted">
          {restaurant.address}
        </Text>
      </View>

      {/* Favorite Heart Button */}
      <Pressable
        onPress={handleToggleWishlist}
        hitSlop={8}
        className="absolute right-2.5 top-2.5 z-10 rounded-full bg-surface/90 p-2 shadow-sm active:scale-75"
      >
        <Heart
          size={15}
          color={wishlisted ? colors.primary : colors.fg}
          fill={wishlisted ? colors.primary : 'transparent'}
        />
      </Pressable>
    </Pressable>
  );
}

export default memo(RestaurantCard);
