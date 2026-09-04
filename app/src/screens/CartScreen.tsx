import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import ExtraCard from '../components/ExtraCard';
import QtyStepper from '../components/QtyStepper';
import { RemoteImage } from '../components/VegBadge';
import { BottomBar, EmptyState } from '../components/ui';
import { lineUnitTotal } from '../data/selectors';
import { useAppDispatch, useAppSelector } from '../store';
import {
  removeItem,
  selectCartCount,
  selectCartItems,
  selectCartSubtotal,
  selectDeliveryFee,
  updateQty,
} from '../store/slices/cartSlice';
import { selectExtras, selectMenuItems } from '../store/slices/catalogSlice';
import { usePalette } from '../theme/ThemeProvider';
import type { CartLineItem } from '../utils/types';
import { hasCustomizableAddons, useAddonCustomize } from '../components/AddonCustomizeSheet';

function Line({ item }: { item: CartLineItem }) {
  const dispatch = useAppDispatch();
  const colors = usePalette();
  const menuItems = useAppSelector(selectMenuItems);
  const { openCustomize } = useAddonCustomize();
  const unit = lineUnitTotal(item.unitPrice, item.selectedAddons);
  const menuItem = item.menuItemId ? menuItems.find((m) => m.id === item.menuItemId) : undefined;
  const canEditAddons = menuItem ? hasCustomizableAddons(menuItem) : false;

  return (
    <View className="flex-row gap-3 rounded-2xl border border-border bg-surface p-3">
      <View className="h-20 w-20 overflow-hidden rounded-xl bg-surface-2">
        <RemoteImage uri={item.imageUrl} className="h-full w-full" />
      </View>
      <View className="min-w-0 flex-1">
        <View className="flex-row items-start justify-between gap-2">
          <View className="min-w-0 flex-1">
            <Text numberOfLines={2} className="font-display text-sm font-semibold text-fg">
              {item.name}
            </Text>
            <Text className="mt-0.5 font-sans text-[11px] text-muted">
              {item.kind === 'extra' ? 'Campus Extra' : 'Food'}
            </Text>
            {item.selectedOption ? (
              <Text className="mt-0.5 font-sans text-xs text-muted">
                {item.selectedOption.name} · ₹{item.selectedOption.price}
              </Text>
            ) : null}
            {item.note ? (
              <Text numberOfLines={2} className="mt-0.5 font-sans text-xs text-muted">
                {item.note}
              </Text>
            ) : null}
            {item.selectedAddons.length > 0 ? (
              <Text numberOfLines={1} className="mt-0.5 font-sans text-xs text-muted">
                {item.selectedAddons.map((a) => a.name).join(', ')}
              </Text>
            ) : null}
          </View>
          <Pressable onPress={() => void dispatch(removeItem(item.cartKey))} hitSlop={8} className="p-1">
            <Trash2 size={16} color={colors.muted} />
          </Pressable>
        </View>
        <View className="mt-2 flex-row items-center justify-between">
          <QtyStepper
            value={item.quantity}
            min={0}
            onChange={(n) => void dispatch(updateQty({ cartKey: item.cartKey, quantity: n }))}
          />
          <Text className="font-display text-base font-semibold text-fg">₹{unit * item.quantity}</Text>
        </View>
        {item.kind === 'food' && canEditAddons && menuItem ? (
          <Pressable
            onPress={() =>
              openCustomize({
                menuItem,
                mode: 'edit',
                cartKey: item.cartKey,
                initialAddons: item.selectedAddons,
                initialOption: item.selectedOption,
              })
            }
            className="mt-1"
          >
            <Text className="font-sans text-xs font-semibold text-primary">
              {item.selectedOption || item.selectedAddons.length > 0 ? 'Edit options' : 'Customize'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default function CartScreen() {
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const fee = useAppSelector(selectDeliveryFee);
  const count = useAppSelector(selectCartCount);
  const extras = useAppSelector(selectExtras).filter((p) => p.available);

  if (items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-bg px-6">
        <EmptyState title="Your cart is empty" subtitle="Add some food or campus extras to get started." />
        <Pressable onPress={() => router.push('/')} className="rounded-xl bg-primary px-6 py-3">
          <Text className="font-sans text-sm font-semibold text-on-primary">Browse Food</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg">
      <ScrollView className="flex-1" contentContainerClassName="gap-3 px-4 pb-6 pt-4">
        <Text className="font-display text-2xl font-bold text-fg">Cart · {count}</Text>
        {items.map((item) => (
          <Line key={item.cartKey} item={item} />
        ))}
        {extras.length > 0 ? (
          <View className="mt-3 gap-3">
            <Text className="font-display text-base font-bold text-fg">Add extras</Text>
            {extras.slice(0, 4).map((product) => (
              <ExtraCard key={product.id} product={product} />
            ))}
          </View>
        ) : null}
      </ScrollView>

      <BottomBar className="gap-2">
        <View className="flex-row justify-between">
          <Text className="font-sans text-sm text-muted">Subtotal + delivery</Text>
          <Text className="font-display text-sm font-semibold text-fg">
            ₹{subtotal} + ₹{fee}
          </Text>
        </View>
        <View className="mb-1 flex-row items-center justify-between">
          <Text className="font-display text-base font-bold text-fg">Total</Text>
          <Text className="font-display text-base font-bold text-fg">₹{subtotal + fee}</Text>
        </View>
        <Pressable onPress={() => router.push('/checkout')} className="rounded-xl bg-primary py-3.5">
          <Text className="text-center font-display text-sm font-semibold text-on-primary">Checkout</Text>
        </Pressable>
      </BottomBar>
    </View>
  );
}
