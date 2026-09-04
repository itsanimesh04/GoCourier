import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Heart, Star } from 'lucide-react-native';
import FoodCard from '../components/FoodCard';
import PriceDisplay from '../components/PriceDisplay';
import QtyStepper from '../components/QtyStepper';
import VegBadge, { RemoteImage } from '../components/VegBadge';
import { BottomBar, TwoColGrid } from '../components/ui';
import { getRelatedFoods } from '../data/relatedFoods';
import { lineUnitTotal } from '../data/selectors';
import { useAppDispatch, useAppSelector } from '../store';
import { addFoodItem } from '../store/slices/cartSlice';
import { selectMenuItems, selectRestaurants } from '../store/slices/catalogSlice';
import { selectIsFoodWishlisted, toggleFoodWishlist } from '../store/slices/wishlistSlice';
import { usePalette } from '../theme/ThemeProvider';
import { hasCustomizableAddons, useAddonCustomize } from '../components/AddonCustomizeSheet';

export default function ProductScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const menuItems = useAppSelector(selectMenuItems);
  const restaurants = useAppSelector(selectRestaurants);
  const item = menuItems.find((m) => m.id === id);
  const restaurant = item ? restaurants.find((r) => r.id === item.restaurantId) : undefined;
  const dispatch = useAppDispatch();
  const colors = usePalette();
  const { openCustomize } = useAddonCustomize();
  const wishlisted = useAppSelector(selectIsFoodWishlisted(id));
  const [quantity, setQuantity] = useState(1);
  const [addedFlash, setAddedFlash] = useState(false);
  const related = useMemo(() => (item ? getRelatedFoods(item, menuItems) : []), [item, menuItems]);

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center bg-bg px-6">
        <Text className="font-display text-2xl font-bold text-fg">Item not found</Text>
        <Pressable onPress={() => router.push('/food')} className="mt-4">
          <Text className="font-sans text-sm font-semibold text-primary">Browse food</Text>
        </Pressable>
      </View>
    );
  }

  const handleAdd = () => {
    if (hasCustomizableAddons(item)) {
      openCustomize({ menuItem: item, mode: 'add', initialQuantity: quantity });
      return;
    }
    void dispatch(
      addFoodItem({
        menuItemId: item.id,
        restaurantId: item.restaurantId,
        name: item.name,
        imageUrl: item.imageUrl,
        unitPrice: item.price,
        quantity,
        selectedAddons: [],
      })
    );
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 1800);
  };

  const ctaLabel = !item.isAvailable
    ? 'Unavailable'
    : hasCustomizableAddons(item)
      ? `Customize · ₹${item.price * quantity}+`
      : addedFlash
        ? 'Added ✓'
        : `Add · ₹${lineUnitTotal(item.price, []) * quantity}`;

  return (
    <View className="flex-1 bg-bg">
      <ScrollView className="flex-1" contentContainerClassName="pb-4">
        <View className="aspect-[4/3] overflow-hidden bg-surface-2">
          <RemoteImage uri={item.imageUrl} className="h-full w-full" />
        </View>

        <View className="px-4 pt-5">
          <View className="mb-2 flex-row items-center gap-2">
            <VegBadge isVeg={item.isVeg} showLabel />
            {!item.isAvailable ? (
              <Text className="rounded-lg bg-surface-2 px-2 py-0.5 font-sans text-[10px] uppercase text-muted">
                Sold out
              </Text>
            ) : null}
          </View>
          <Text className="font-display text-2xl font-bold tracking-tight text-fg">{item.name}</Text>
          <Text className="mt-2 font-sans text-sm leading-relaxed text-muted">{item.description}</Text>
          {restaurant ? (
            <Pressable
              onPress={() => router.push(`/food/restaurants/${restaurant.id}`)}
              className="mt-3 flex-row items-center gap-2"
            >
              <Star size={12} color="#eab308" fill="#eab308" />
              <Text className="font-sans text-sm text-muted">
                {restaurant.name} · {restaurant.rating.toFixed(1)} · {restaurant.etaMinutes} min
              </Text>
            </Pressable>
          ) : null}
          {item.category ? (
            <Text className="mt-2 font-sans text-xs uppercase tracking-wide text-muted">{item.category}</Text>
          ) : null}
          <PriceDisplay price={item.price} originalPrice={item.originalPrice} size="lg" className="mt-3" />

          <View className="mt-5 flex-row items-center justify-between">
            <QtyStepper value={quantity} onChange={setQuantity} />
            <Pressable
              onPress={() => dispatch(toggleFoodWishlist(item.id))}
              className="rounded-xl border border-border p-3"
            >
              <Heart
                size={18}
                color={wishlisted ? colors.primary : colors.fg}
                fill={wishlisted ? colors.primary : 'transparent'}
              />
            </Pressable>
          </View>
          {hasCustomizableAddons(item) ? (
            <Text className="mt-3 font-sans text-sm text-muted">
              Customize add-ons when you add this item to your cart.
            </Text>
          ) : null}
        </View>

        {related.length > 0 ? (
          <View className="mt-8 border-t border-border px-4 pt-6">
            <Text className="font-display text-lg font-bold text-fg">Related</Text>
            <Text className="mb-4 font-sans text-xs text-muted">
              More from {item.category ?? 'this kitchen'}
            </Text>
            <TwoColGrid>
              {related.map((food) => (
                <FoodCard key={food.id} menuItem={food} />
              ))}
            </TwoColGrid>
          </View>
        ) : null}
      </ScrollView>

      <BottomBar>
        <Pressable
          disabled={!item.isAvailable}
          onPress={handleAdd}
          className="rounded-xl bg-primary py-3.5 disabled:opacity-40"
        >
          <Text className="text-center font-display text-sm font-semibold text-on-primary">{ctaLabel}</Text>
        </Pressable>
      </BottomBar>
    </View>
  );
}
