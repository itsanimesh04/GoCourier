import { memo } from 'react';
import { Heart, Minus, Plus, Star, Store, UtensilsCrossed } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../store';
import { selectRestaurantById } from '../store/slices/catalogSlice';
import { addFoodItem, decrementFoodItem, selectMenuItemQty } from '../store/slices/cartSlice';
import { selectIsFoodWishlisted, toggleFoodWishlist } from '../store/slices/wishlistSlice';
import type { MenuItem } from '../utils/types';
import PriceDisplay from './PriceDisplay';
import VegBadge, { RemoteImage } from './VegBadge';
import { usePalette } from '../theme/ThemeProvider';
import { hasCustomizableAddons, useAddonCustomize } from './AddonCustomizeSheet';
import { haptic } from '../utils/haptics';

function FoodCard({ menuItem }: { menuItem: MenuItem }) {
  const dispatch = useAppDispatch();
  const colors = usePalette();
  const { openCustomize } = useAddonCustomize();
  const wishlisted = useAppSelector(selectIsFoodWishlisted(menuItem.id));
  const cartQty = useAppSelector(selectMenuItemQty(menuItem.id));
  const restaurant = useAppSelector(selectRestaurantById(menuItem.restaurantId));

  const handleAdd = () => {
    if (!menuItem.isAvailable) return;
    haptic.medium();
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

  const handleDecrement = () => {
    haptic.selection();
    void dispatch(decrementFoodItem(menuItem.id));
  };

  const handleIncrement = () => {
    haptic.selection();
    handleAdd();
  };

  const handleToggleWishlist = () => {
    haptic.light();
    dispatch(toggleFoodWishlist(menuItem.id));
  };

  return (
    <View className="relative w-full min-w-0 overflow-hidden rounded-3xl border border-border/80 bg-surface shadow-sm">
      <Pressable
        onPress={() => {
          haptic.selection();
          router.push(`/food/foods/${menuItem.id}`);
        }}
        className="w-full"
      >
        <View
          style={{ aspectRatio: 4 / 3, width: '100%', minHeight: 120 }}
          className="relative overflow-hidden bg-surface-2"
        >
          {menuItem.imageUrl ? (
            <RemoteImage uri={menuItem.imageUrl} className="h-full w-full" recyclingKey={menuItem.id} />
          ) : (
            <View className="h-full w-full items-center justify-center bg-surface-2">
              <UtensilsCrossed size={28} color={colors.muted} opacity={0.6} />
              <Text className="mt-1 font-display text-xs font-bold uppercase tracking-wider text-muted">
                {menuItem.name ? menuItem.name.slice(0, 2) : 'FD'}
              </Text>
            </View>
          )}

          {/* Floating Veg Badge */}
          <View className="absolute left-2.5 top-2.5 rounded-full bg-surface/90 px-1.5 py-1 shadow-sm">
            <VegBadge isVeg={menuItem.isVeg} />
          </View>

          {/* Rating tag */}
          <View className="absolute bottom-2 left-2.5 flex-row items-center gap-1 rounded-full bg-surface/90 px-2 py-0.5 shadow-sm">
            <Star size={10} color="#f59e0b" fill="#f59e0b" />
            <Text className="font-sans text-[10px] font-bold text-fg">
              {menuItem.rating.toFixed(1)}
            </Text>
          </View>

          {!menuItem.isAvailable && (
            <View className="absolute inset-0 items-center justify-center bg-black/60">
              <View className="rounded-full bg-surface px-3 py-1">
                <Text className="font-display text-[10px] font-bold uppercase tracking-wider text-fg">
                  Sold out
                </Text>
              </View>
            </View>
          )}
        </View>

        <View className="p-3.5 pb-2">
          <Text numberOfLines={1} className="font-display text-sm font-bold text-fg">
            {menuItem.name}
          </Text>

          {restaurant ? (
            <View className="mt-1 flex-row items-center gap-1">
              <Store size={11} color={colors.primary} />
              <Text numberOfLines={1} className="flex-1 font-sans text-xs text-muted">
                {restaurant.name}
              </Text>
            </View>
          ) : null}

          <Text numberOfLines={2} className="mt-1 font-sans text-xs leading-relaxed text-muted">
            {menuItem.description}
          </Text>
        </View>
      </Pressable>

      {/* Bottom section: Price and Action button grouped so they NEVER overlap */}
      <View className="mt-auto px-3.5 pb-3.5 pt-1">
        <PriceDisplay
          price={menuItem.price}
          originalPrice={menuItem.originalPrice}
          size="md"
          className="mb-2"
        />

        {!menuItem.isAvailable ? (
          <View className="rounded-2xl border border-border bg-surface-2/60 px-3 py-2 opacity-50">
            <Text className="text-center font-display text-xs font-bold uppercase text-muted">
              Unavailable
            </Text>
          </View>
        ) : cartQty > 0 ? (
          <View className="flex-row items-center overflow-hidden rounded-2xl border border-primary bg-primary shadow-sm">
            <Pressable
              onPress={handleDecrement}
              className="flex-1 items-center py-2 active:bg-black/10"
              hitSlop={4}
            >
              <Minus size={14} color={colors.onPrimary} strokeWidth={2.5} />
            </Pressable>
            <Text className="min-w-[28px] text-center font-display text-sm font-bold text-on-primary">
              {cartQty}
            </Text>
            <Pressable
              onPress={handleIncrement}
              className="flex-1 items-center py-2 active:bg-black/10"
              hitSlop={4}
            >
              <Plus size={14} color={colors.onPrimary} strokeWidth={2.5} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={handleAdd}
            className="rounded-2xl border border-primary bg-primary/10 py-2 shadow-none active:bg-primary"
          >
            <Text className="text-center font-display text-xs font-bold uppercase tracking-wider text-primary">
              + Add
            </Text>
          </Pressable>
        )}
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
    </View>
  );
}

export default memo(FoodCard);
