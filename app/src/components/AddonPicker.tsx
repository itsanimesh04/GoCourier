import { Pressable, Text, View } from 'react-native';
import { cn } from '../utils/utils';
import type { FoodAddon, SelectedAddon } from '../utils/types';

export default function AddonPicker({
  addons,
  selected,
  onChange,
}: {
  addons: FoodAddon[];
  selected: SelectedAddon[];
  onChange: (next: SelectedAddon[]) => void;
}) {
  if (addons.length === 0) return null;

  const toggle = (addon: FoodAddon) => {
    const exists = selected.some((a) => a.id === addon.id);
    onChange(
      exists
        ? selected.filter((a) => a.id !== addon.id)
        : [...selected, { id: addon.id, name: addon.name, price: addon.price }]
    );
  };

  return (
    <View className="gap-2">
      <Text className="font-sans text-xs uppercase text-muted">Add-ons</Text>
      {addons.map((addon) => {
        const checked = selected.some((a) => a.id === addon.id);
        return (
          <Pressable key={addon.id} onPress={() => toggle(addon)} className="flex-row items-center gap-3 py-1.5">
            <View
              className={cn(
                'h-4 w-4 items-center justify-center rounded-[3px] border border-fg',
                checked && 'bg-fg'
              )}
            >
              {checked ? <View className="h-1.5 w-1.5 bg-bg" /> : null}
            </View>
            <Text className="flex-1 font-sans text-sm text-fg">{addon.name}</Text>
            <Text className="font-display text-sm font-semibold text-fg">+ ₹ {addon.price}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
