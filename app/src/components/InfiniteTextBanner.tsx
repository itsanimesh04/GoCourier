import { ScrollView, Text, View } from 'react-native';
import { cn } from '../utils/utils';

/** Native horizontal chip strip (replaces broken CSS-style marquee). */
export default function InfiniteTextBanner({
  items,
  bgClass = 'bg-surface',
  textClass = 'text-fg',
}: {
  items: string[];
  bgClass?: string;
  textClass?: string;
}) {
  if (!items.length) return null;

  return (
    <View className={cn('py-2.5', bgClass)}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-4">
        {items.map((item) => (
          <View key={item} className="rounded-full border border-border bg-bg/40 px-3.5 py-1.5">
            <Text className={cn('font-sans text-xs font-medium', textClass)} numberOfLines={1}>
              {item}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
