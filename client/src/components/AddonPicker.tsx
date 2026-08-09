import type { FoodAddon, SelectedAddon } from '../utils/types';
import { cn } from '../utils/utils';

interface AddonPickerProps {
  addons: FoodAddon[];
  selected: SelectedAddon[];
  onChange: (next: SelectedAddon[]) => void;
  className?: string;
}

const AddonPicker = ({ addons, selected, onChange, className }: AddonPickerProps) => {
  if (addons.length === 0) return null;

  const toggle = (addon: FoodAddon) => {
    const exists = selected.some((s) => s.id === addon.id);
    if (exists) {
      onChange(selected.filter((s) => s.id !== addon.id));
    } else {
      onChange([...selected, { id: addon.id, name: addon.name, price: addon.price }]);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="font-bebas text-xl uppercase tracking-wide text-tertiary">Add-ons</h4>
      <ul className="space-y-2">
        {addons.map((addon) => {
          const checked = selected.some((s) => s.id === addon.id);
          return (
            <li key={addon.id}>
              <label className="flex cursor-pointer items-center justify-between gap-3 border border-gray-200 px-3 py-2.5 hover:border-gray-400">
                <span className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex h-4 w-4 items-center justify-center border border-tertiary',
                      checked && 'bg-tertiary'
                    )}
                  >
                    {checked && <span className="h-1.5 w-1.5 bg-white" />}
                  </span>
                  <span className="font-bebas text-base uppercase text-tertiary">{addon.name}</span>
                </span>
                <span className="font-bebas text-base text-gray-600">+ ₹ {addon.price}</span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => toggle(addon)}
                />
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AddonPicker;
