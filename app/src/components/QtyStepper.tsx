import { Minus, Plus } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { usePalette } from '../theme/ThemeProvider';

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
  return (
    <View className="flex-row items-center overflow-hidden rounded-xl border border-border">
      <Pressable
        onPress={() => onChange(Math.max(min, value - 1))}
        className="px-3 py-2"
        hitSlop={8}
      >
        <Minus size={16} color={colors.fg} />
      </Pressable>
      <Text className="min-w-[28px] text-center font-display text-xl font-semibold text-fg">{value}</Text>
      <Pressable
        onPress={() => onChange(Math.min(max, value + 1))}
        className="px-3 py-2"
        hitSlop={8}
      >
        <Plus size={16} color={colors.fg} />
      </Pressable>
    </View>
  );
}
