import { Heart, Minus, Plus, Star, Store } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../store';
import { selectRestaurants } from '../store/slices/catalogSlice';
import { addFoodItem, decrementFoodItem, selectMenuItemQty } from '../store/slices/cartSlice';
import { selectIsFoodWishlisted, toggleFoodWishlist } from '../store/slices/wishlistSlice';
import type { MenuItem } from '../utils/types';
import PriceDisplay from './PriceDisplay';
import VegBadge, { RemoteImage } from './VegBadge';
import { usePalette } from '../theme/ThemeProvider';
import { hasCustomizableAddons, useAddonCustomize } from './AddonCustomizeSheet';

export default function FoodCard({ menuItem }: { menuItem: MenuItem }) {
  const dispatch = useAppDispatch();
  const colors = usePalette();
  const { openCustomize } = useAddonCustomize();
  const wishlisted = useAppSelector(selectIsFoodWishlisted(menuItem.id));
  const cartQty = useAppSelector(selectMenuItemQty(menuItem.id));
  const restaurants = useAppSelector(selectRestaurants);
  const restaurant = restaurants.find((r) => r.id === menuItem.restaurantId);

  const add = () => {
    if (!menuItem.isAvailable) return;
    if (hasCustomizableAddons(menuItem)) {
      openCustomize({ menuItem, mode: 'add', initialQuantity: 1 });
      return;
    }
    void dispatch(
      addFoodItem({
        menuItemId: menuItem.id,
        restaurantId: menuItem.restaurantId,
        name: menuItem.name,
        imageUrl: menuItem.imageUrl,
        unitPrice: menuItem.price,
        quantity: 1,
        selectedAddons: [],
      })
    );
  };

  return (
    <View className="relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-border bg-surface">
      <Pressable onPress={() => router.push(`/food/foods/${menuItem.id}`)}>
        <View className="aspect-[4/3] w-full overflow-hidden bg-surface-2">
          <RemoteImage uri={menuItem.imageUrl} className="h-full w-full" recyclingKey={menuItem.id} />
          {!menuItem.isAvailable ? (
            <View className="absolute left-2 top-2 rounded-lg bg-surface px-2 py-0.5">
              <Text className="font-sans text-[10px] font-bold uppercase tracking-wider text-fg">Sold out</Text>
            </View>
          ) : null}
        </View>
        <View className="p-3">
          <View className="mb-1.5 flex-row flex-wrap items-center gap-1.5">
            <VegBadge isVeg={menuItem.isVeg} />
            {menuItem.category ? (
              <Text className="rounded-md bg-surface-2 px-1.5 py-0.5 font-sans text-[10px] font-medium uppercase tracking-wide text-muted">
                {menuItem.category}
              </Text>
            ) : null}
          </View>
          <Text numberOfLines={2} className="font-display text-sm font-semibold leading-snug text-fg">
            {menuItem.name}
          </Text>
          <View className="mt-1 flex-row items-center gap-1">
            <Star size={11} color="#eab308" fill="#eab308" />
            <Text className="font-sans text-[11px] text-muted">{menuItem.rating.toFixed(1)}</Text>
          </View>
          {restaurant ? (
            <View className="mt-1 flex-row items-center gap-1">
              <Store size={12} color={colors.muted} />
              <Text numberOfLines={1} className="flex-1 font-sans text-[11px] text-muted">
                {restaurant.name}
              </Text>
            </View>
          ) : null}
          <Text numberOfLines={2} className="mt-1.5 font-sans text-xs leading-relaxed text-muted">
            {menuItem.description}
          </Text>
          <PriceDisplay price={menuItem.price} originalPrice={menuItem.originalPrice} size="md" className="mt-2" />
        </View>
      </Pressable>

      <View className="mt-auto px-3 pb-3">
        {!menuItem.isAvailable ? (
          <View className="rounded-lg border border-primary px-2 py-2 opacity-40">
            <Text className="text-center font-display text-xs font-semibold text-primary">UNAVAILABLE</Text>
          </View>
        ) : cartQty > 0 ? (
          <View className="flex-row items-center rounded-lg border border-primary bg-primary">
            <Pressable onPress={() => void dispatch(decrementFoodItem(menuItem.id))} className="flex-1 items-center py-2">
              <Minus size={14} color={colors.onPrimary} />
            </Pressable>
            <Text className="min-w-[28px] text-center font-display text-base font-semibold text-on-primary">
              {cartQty}
            </Text>
            <Pressable onPress={add} className="flex-1 items-center py-2">
              <Plus size={14} color={colors.onPrimary} />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={add} className="rounded-lg border border-primary px-2 py-2">
            <Text className="text-center font-display text-xs font-semibold text-primary">ADD TO CART</Text>
          </Pressable>
        )}
      </View>

      <Pressable
        onPress={() => dispatch(toggleFoodWishlist(menuItem.id))}
        className="absolute right-2 top-2 z-10 rounded-xl bg-surface/90 p-1.5"
      >
        <Heart size={16} color={wishlisted ? colors.primary : colors.fg} fill={wishlisted ? colors.primary : 'transparent'} />
      </Pressable>
    </View>
  );
}
