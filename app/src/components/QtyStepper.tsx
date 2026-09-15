import { Minus, Plus } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { usePalette } from '../theme/ThemeProvider';
import { haptic } from '../utils/haptics';

export default function QtyStepper({
  value,
  onChange,
  min = 1,
  max = 20,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  const colors = usePalette();

  const handleDecrement = () => {
    if (value > min) {
      haptic.selection();
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      haptic.selection();
      onChange(value + 1);
    }
  };

  return (
    <View className="flex-row items-center overflow-hidden rounded-2xl border border-border/80 bg-surface-2/80 shadow-inner">
      <Pressable
        onPress={handleDecrement}
        disabled={value <= min}
        className="px-3.5 py-2 active:scale-90 disabled:opacity-30"
        hitSlop={8}
      >
        <Minus size={15} color={colors.fg} strokeWidth={2.5} />
      </Pressable>
      <Text className="min-w-[32px] text-center font-display text-base font-bold text-fg">
        {value}
      </Text>
      <Pressable
        onPress={handleIncrement}
        disabled={value >= max}
        className="px-3.5 py-2 active:scale-90 disabled:opacity-30"
        hitSlop={8}
      >
        <Plus size={15} color={colors.fg} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}
