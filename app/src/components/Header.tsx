import { Moon, Sun } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../store';
import { selectTheme, toggleTheme } from '../store/slices/uiSlice';
import CampusPicker from './CampusPicker';
import { usePalette } from '../theme/ThemeProvider';

export default function Header() {
  const insets = useSafeAreaInsets();
  const colors = usePalette();
  const theme = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();

  return (
    <View style={{ paddingTop: insets.top }} className="bg-primary">
      <View className="flex-row items-center justify-between gap-2 px-4 py-2.5">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <Pressable onPress={() => router.push('/')} hitSlop={6}>
            <Text className="font-display text-lg font-bold tracking-tight text-on-primary">GoCourier</Text>
          </Pressable>
          <CampusPicker />
        </View>
        <Pressable onPress={() => dispatch(toggleTheme())} hitSlop={10} className="p-1.5">
          {theme === 'dark' ? (
            <Sun size={20} color={colors.onPrimary} />
          ) : (
            <Moon size={20} color={colors.onPrimary} />
          )}
        </Pressable>
      </View>
    </View>
  );
}
