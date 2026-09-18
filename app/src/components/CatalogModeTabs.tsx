import { Pressable, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { selectCatalogMode, setCatalogMode } from '../store/slices/uiSlice';
import { cn } from '../utils/utils';
import { router } from 'expo-router';
import { haptic } from '../utils/haptics';

export default function CatalogModeTabs({ navigateOnChange = false }: { navigateOnChange?: boolean }) {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectCatalogMode);

  const select = (next: 'food' | 'extras') => {
    if (next !== mode) {
      haptic.selection();
    }
    if (navigateOnChange) {
      router.push(next === 'extras' ? '/extras' : '/food');
    } else {
      dispatch(setCatalogMode(next));
    }
  };

  return (
    <View className="flex-row items-center rounded-2xl border border-border/80 bg-surface-2/80 p-1">
      {(['food', 'extras'] as const).map((item) => {
        const active = mode === item;
        return (
          <Pressable
            key={item}
            onPress={() => select(item)}
            className={cn(
              'flex-1 items-center justify-center rounded-xl py-2',
              active ? 'bg-primary shadow-sm' : 'bg-transparent'
            )}
          >
            <Text
              className={cn(
                'font-display text-xs font-bold uppercase tracking-wider',
                active ? 'text-on-primary' : 'text-muted'
              )}
            >
              {item === 'food' ? 'Food & Drinks' : 'Campus Extras'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
