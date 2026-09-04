import { Text, View } from 'react-native';
import { cn } from '../utils/utils';

export default function PriceDisplay({
  price,
  originalPrice,
  size = 'md',
  className,
}: {
  price: number;
  originalPrice?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClass = size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-sm' : 'text-base';
  const showStrike = originalPrice != null && originalPrice > price;

  return (
    <View className={cn('flex-row items-baseline gap-1.5', className)}>
      <Text className={cn('font-display font-semibold text-fg', sizeClass)}>₹ {price}</Text>
      {showStrike ? (
        <Text className="font-sans text-xs text-muted line-through">₹ {originalPrice}</Text>
      ) : null}
    </View>
  );
}
