import { Minus, Plus } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import type { ExtraProduct } from '../utils/types';
import { useAppDispatch, useAppSelector } from '../store';
import { addExtra, selectCartItems, updateQty } from '../store/slices/cartSlice';
import PriceDisplay from './PriceDisplay';
import { RemoteImage } from './VegBadge';
import { usePalette } from '../theme/ThemeProvider';
import { haptic } from '../utils/haptics';

export default function ExtraCard({ product }: { product: ExtraProduct }) {
  const dispatch = useAppDispatch();
  const colors = usePalette();
  const items = useAppSelector(selectCartItems);
  const cartKey = `extra:${product.id}`;
  const line = items.find((i) => i.cartKey === cartKey);
  const cartQty = line?.quantity ?? 0;
  const imageUrl = product.imageUrl ?? '';

  const handleAdd = () => {
    if (!product.available) return;
    haptic.medium();
    void dispatch(
      addExtra({
        extrasProductId: product.id,
        name: product.name,
        imageUrl,
        unitPrice: product.price,
      })
    );
  };

  const handleDecrement = () => {
    haptic.selection();
    void dispatch(updateQty({ cartKey, quantity: cartQty - 1 }));
  };

  const handleIncrement = () => {
    haptic.selection();
    handleAdd();
  };

  return (
    <View className="relative w-full min-w-0 overflow-hidden rounded-3xl border border-border/80 bg-surface shadow-sm">
      <View className="relative aspect-square w-full overflow-hidden bg-surface-2">
        <RemoteImage uri={imageUrl} className="h-full w-full" recyclingKey={product.id} />
        {!product.available ? (
          <View className="absolute inset-0 items-center justify-center bg-black/60">
            <View className="rounded-full bg-surface px-2.5 py-1">
              <Text className="font-display text-[9px] font-bold uppercase tracking-wider text-fg">
                Sold out
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <View className="items-center p-3">
        <Text className="font-sans text-[10px] font-bold uppercase tracking-wider text-muted">
          {product.storeName}
        </Text>
        <Text numberOfLines={1} className="mt-0.5 w-full text-center font-display text-sm font-bold text-fg">
          {product.name}
        </Text>
        <Text className="mt-0.5 font-sans text-xs text-muted">
          {product.unit} · {product.category}
        </Text>
        <PriceDisplay price={product.price} size="sm" className="mt-1.5 justify-center" />
      </View>

      <View className="mt-auto px-3 pb-3">
        {!product.available ? (
          <View className="rounded-2xl border border-border bg-surface-2/60 px-2 py-1.5 opacity-50">
            <Text className="text-center font-display text-xs font-bold uppercase text-muted">
              Unavailable
            </Text>
          </View>
        ) : cartQty > 0 ? (
          <View className="flex-row items-center overflow-hidden rounded-2xl border border-primary bg-primary shadow-sm">
            <Pressable
              onPress={handleDecrement}
              className="flex-1 items-center py-1.5 active:bg-black/10"
              hitSlop={4}
            >
              <Minus size={14} color={colors.onPrimary} strokeWidth={2.5} />
            </Pressable>
            <Text className="min-w-[28px] text-center font-display text-sm font-bold text-on-primary">
              {cartQty}
            </Text>
            <Pressable
              onPress={handleIncrement}
              className="flex-1 items-center py-1.5 active:bg-black/10"
              hitSlop={4}
            >
              <Plus size={14} color={colors.onPrimary} strokeWidth={2.5} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={handleAdd}
            className="rounded-2xl border border-primary bg-primary/10 py-1.5 shadow-none active:bg-primary"
          >
            <Text className="text-center font-display text-xs font-bold uppercase tracking-wider text-primary">
              + Add
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
