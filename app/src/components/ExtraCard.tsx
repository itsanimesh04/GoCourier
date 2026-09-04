import { Minus, Plus } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import type { ExtraProduct } from '../utils/types';
import { useAppDispatch, useAppSelector } from '../store';
import { addExtra, selectCartItems, updateQty } from '../store/slices/cartSlice';
import PriceDisplay from './PriceDisplay';
import { RemoteImage } from './VegBadge';
import { usePalette } from '../theme/ThemeProvider';

export default function ExtraCard({ product }: { product: ExtraProduct }) {
  const dispatch = useAppDispatch();
  const colors = usePalette();
  const items = useAppSelector(selectCartItems);
  const cartKey = `extra:${product.id}`;
  const line = items.find((i) => i.cartKey === cartKey);
  const cartQty = line?.quantity ?? 0;
  const imageUrl = product.imageUrl ?? '';

  const add = () => {
    if (!product.available) return;
    void dispatch(
      addExtra({
        extrasProductId: product.id,
        name: product.name,
        imageUrl,
        unitPrice: product.price,
      })
    );
  };

  return (
    <View className="relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-border bg-surface">
      <View className="aspect-square w-full overflow-hidden bg-surface-2">
        <RemoteImage uri={imageUrl} className="h-full w-full" recyclingKey={product.id} />
        {!product.available ? (
          <View className="absolute left-2 top-2 rounded-lg bg-surface-2 px-2 py-0.5">
            <Text className="font-sans text-[10px] font-bold uppercase tracking-wider text-fg">Sold out</Text>
          </View>
        ) : null}
      </View>
      <View className="items-center p-2.5">
        <Text className="font-sans text-[11px] text-muted">{product.storeName}</Text>
        <Text numberOfLines={1} className="mt-0.5 w-full text-center font-display text-sm font-semibold text-fg">
          {product.name}
        </Text>
        <Text className="mt-0.5 font-sans text-[11px] text-muted">
          {product.unit} · {product.category}
        </Text>
        <PriceDisplay price={product.price} size="sm" className="mt-1.5 justify-center" />
      </View>
      <View className="mt-auto px-2 pb-2.5">
        {!product.available ? (
          <View className="rounded-lg border border-primary px-2 py-1 opacity-40">
            <Text className="text-center font-display text-xs font-semibold text-primary">Unavailable</Text>
          </View>
        ) : cartQty > 0 ? (
          <View className="flex-row items-center rounded-lg border border-primary bg-primary">
            <Pressable
              onPress={() => void dispatch(updateQty({ cartKey, quantity: cartQty - 1 }))}
              className="flex-1 items-center py-1"
            >
              <Minus size={14} color={colors.onPrimary} />
            </Pressable>
            <Text className="min-w-[28px] text-center font-display text-base font-semibold text-on-primary">
              {cartQty}
            </Text>
            <Pressable onPress={add} className="flex-1 items-center py-1">
              <Plus size={14} color={colors.onPrimary} />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={add} className="rounded-lg border border-primary px-2 py-1">
            <Text className="text-center font-display text-xs font-semibold text-primary">Add to cart</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
