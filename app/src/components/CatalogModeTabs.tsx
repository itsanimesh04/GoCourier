import { Pressable, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { selectCatalogMode, setCatalogMode } from '../store/slices/uiSlice';
import { cn } from '../utils/utils';
import { router } from 'expo-router';

export default function CatalogModeTabs({ navigateOnChange = false }: { navigateOnChange?: boolean }) {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectCatalogMode);

  const select = (next: 'food' | 'extras') => {
    dispatch(setCatalogMode(next));
    if (navigateOnChange) router.push(next === 'extras' ? '/extras' : '/food');
  };

  return (
    <View className="flex-row rounded-full border border-border bg-surface p-1">
      {(['food', 'extras'] as const).map((item) => (
        <Pressable
          key={item}
          onPress={() => select(item)}
          className={cn(
            'rounded-full px-5 py-2',
            mode === item ? 'bg-primary' : 'bg-transparent'
          )}
        >
          <Text
            className={cn(
              'font-display text-xs font-semibold uppercase tracking-wide',
              mode === item ? 'text-on-primary' : 'text-muted'
            )}
          >
            {item === 'food' ? 'Food' : 'Extras'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
