import { Moon, Sun, ShoppingBag } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../store';
import { selectTheme, toggleTheme } from '../store/slices/uiSlice';
import { selectCartCount } from '../store/slices/cartSlice';
import CampusPicker from './CampusPicker';
import { usePalette } from '../theme/ThemeProvider';
import { haptic } from '../utils/haptics';

export default function Header() {
  const insets = useSafeAreaInsets();
  const colors = usePalette();
  const theme = useAppSelector(selectTheme);
  const cartCount = useAppSelector(selectCartCount);
  const dispatch = useAppDispatch();

  const handleToggleTheme = () => {
    haptic.medium();
    dispatch(toggleTheme());
  };

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="border-b border-border/60 bg-bg"
    >
      <View className="flex-row items-center justify-between gap-3 px-4 py-2.5">
        <View className="min-w-0 flex-1">
          <CampusPicker variant="header" />
        </View>

        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={handleToggleTheme}
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-surface-2 active:scale-90"
          >
            {theme === 'dark' ? (
              <Sun size={17} color={colors.fg} />
            ) : (
              <Moon size={17} color={colors.fg} />
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              haptic.selection();
              router.push('/cart');
            }}
            hitSlop={8}
            className="relative h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-surface-2 active:scale-90"
          >
            <ShoppingBag size={17} color={colors.fg} />
            {cartCount > 0 && (
              <View className="absolute -right-1 -top-1 h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1">
                <Text className="font-display text-[9px] font-bold text-on-primary">
                  {cartCount > 9 ? '9+' : cartCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
