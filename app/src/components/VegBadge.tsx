import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import { cn } from '../utils/utils';

export default function VegBadge({
  isVeg,
  showLabel = false,
}: {
  isVeg: boolean;
  showLabel?: boolean;
}) {
  return (
    <View className="flex-row items-center gap-1">
      <View
        className={cn(
          'h-3.5 w-3.5 items-center justify-center rounded-[2px] border',
          isVeg ? 'border-green-500' : 'border-primary'
        )}
      >
        <View className={cn('h-1.5 w-1.5 rounded-full', isVeg ? 'bg-green-500' : 'bg-primary')} />
      </View>
      {showLabel ? (
        <Text className="font-sans text-[10px] uppercase text-muted">{isVeg ? 'Veg' : 'Non-Veg'}</Text>
      ) : null}
    </View>
  );
}

export function RemoteImage({
  uri,
  className,
  recyclingKey,
}: {
  uri?: string | null;
  className?: string;
  recyclingKey?: string;
}) {
  if (!uri) {
    return <View className={cn('bg-surface-2', className)} />;
  }
  return (
    <Image
      source={{ uri }}
      recyclingKey={recyclingKey}
      contentFit="cover"
      transition={200}
      className={className}
    />
  );
}
