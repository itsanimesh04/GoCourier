import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { ChevronUp, X } from 'lucide-react-native';
import { selectFoodCategories, selectMenuItems } from '../store/slices/catalogSlice';
import { getAllCategories } from '../data/selectors';
import { closeFilterDrawer, selectFilterDrawerOpen } from '../store/slices/uiSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { DEFAULT_FOOD_FILTERS, type FoodFilters } from '../utils/types';
import { cn } from '../utils/utils';
import { usePalette } from '../theme/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function AccordionSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View className="border-b border-border">
      <Pressable onPress={onToggle} className="flex-row items-center justify-between py-4">
        <Text className="font-display text-base font-semibold uppercase tracking-wide text-fg">{title}</Text>
        <ChevronUp size={16} color="#a1a1aa" style={{ transform: [{ rotate: open ? '0deg' : '180deg' }] }} />
      </Pressable>
      {open ? <View className="pb-4">{children}</View> : null}
    </View>
  );
}

function RadioRow({
  label,
  checked,
  onSelect,
  struck,
}: {
  label: string;
  checked: boolean;
  onSelect: () => void;
  struck?: boolean;
}) {
  return (
    <Pressable onPress={onSelect} className="flex-row items-center gap-3 py-1.5">
      <View className={cn('h-4 w-4 items-center justify-center rounded-full border border-fg', checked && 'bg-fg')}>
        {checked ? <View className="h-1.5 w-1.5 rounded-full bg-bg" /> : null}
      </View>
      <Text className={cn('font-display text-sm font-semibold uppercase tracking-wide text-fg', struck && 'text-muted line-through')}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function FilterDrawer({
  value,
  onApply,
  showRating = false,
  maxPrice = 750,
}: {
  value: FoodFilters;
  onApply: (filters: FoodFilters) => void;
  showRating?: boolean;
  maxPrice?: number;
}) {
  const dispatch = useAppDispatch();
  const colors = usePalette();
  const insets = useSafeAreaInsets();
  const open = useAppSelector(selectFilterDrawerOpen);
  const [draft, setDraft] = useState<FoodFilters>(value);
  const [sections, setSections] = useState({
    availability: true,
    price: true,
    diet: true,
    category: true,
    rating: true,
  });
  const menuItems = useAppSelector(selectMenuItems);
  const foodCategories = useAppSelector(selectFoodCategories);
  const categories =
    foodCategories.length > 0 ? foodCategories.map((c) => c.name) : getAllCategories(menuItems);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  if (!open) return null;

  return (
    <Modal visible animationType="slide" transparent onRequestClose={() => dispatch(closeFilterDrawer())}>
      <View className="flex-1 justify-end bg-black/60">
        <Pressable className="flex-1" onPress={() => dispatch(closeFilterDrawer())} />
        <View style={{ paddingBottom: insets.bottom }} className="max-h-[88%] rounded-t-3xl bg-surface">
          <View className="flex-row items-center justify-between border-b border-border px-4 py-4">
            <Text className="font-display text-xl font-bold uppercase tracking-wide text-fg">Filter</Text>
            <Pressable onPress={() => dispatch(closeFilterDrawer())} className="p-1">
              <X size={20} color={colors.fg} />
            </Pressable>
          </View>
          <ScrollView className="px-4" keyboardShouldPersistTaps="handled">
            <AccordionSection
              title="Availability"
              open={sections.availability}
              onToggle={() => setSections((s) => ({ ...s, availability: !s.availability }))}
            >
              <RadioRow label="All" checked={draft.availability === 'all'} onSelect={() => setDraft((d) => ({ ...d, availability: 'all' }))} />
              <RadioRow label="In Stock" checked={draft.availability === 'in_stock'} onSelect={() => setDraft((d) => ({ ...d, availability: 'in_stock' }))} />
              <RadioRow
                label="Out of Stock"
                checked={draft.availability === 'out_of_stock'}
                onSelect={() => setDraft((d) => ({ ...d, availability: 'out_of_stock' }))}
                struck
              />
            </AccordionSection>
            <AccordionSection title="Price" open={sections.price} onToggle={() => setSections((s) => ({ ...s, price: !s.price }))}>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="mb-1 font-sans text-xs uppercase text-muted">From</Text>
                  <TextInput
                    keyboardType="number-pad"
                    value={String(draft.priceFrom)}
                    onChangeText={(t) =>
                      setDraft((d) => ({ ...d, priceFrom: Math.min(Number(t) || 0, d.priceTo) }))
                    }
                    className="rounded-xl border border-border bg-surface-2 px-3 py-2 font-display text-base font-semibold text-fg"
                  />
                </View>
                <View className="flex-1">
                  <Text className="mb-1 font-sans text-xs uppercase text-muted">To</Text>
                  <TextInput
                    keyboardType="number-pad"
                    value={String(draft.priceTo)}
                    onChangeText={(t) =>
                      setDraft((d) => ({
                        ...d,
                        priceTo: Math.max(Number(t) || 0, d.priceFrom),
                      }))
                    }
                    className="rounded-xl border border-border bg-surface-2 px-3 py-2 font-display text-base font-semibold text-fg"
                  />
                </View>
              </View>
              <Text className="mt-2 font-sans text-xs text-muted">Max ₹{maxPrice}</Text>
            </AccordionSection>
            <AccordionSection title="Dietary" open={sections.diet} onToggle={() => setSections((s) => ({ ...s, diet: !s.diet }))}>
              <RadioRow label="All" checked={draft.diet === 'all'} onSelect={() => setDraft((d) => ({ ...d, diet: 'all' }))} />
              <RadioRow label="Veg" checked={draft.diet === 'veg'} onSelect={() => setDraft((d) => ({ ...d, diet: 'veg' }))} />
              <RadioRow label="Non-Veg" checked={draft.diet === 'non_veg'} onSelect={() => setDraft((d) => ({ ...d, diet: 'non_veg' }))} />
            </AccordionSection>
            <AccordionSection
              title="Category"
              open={sections.category}
              onToggle={() => setSections((s) => ({ ...s, category: !s.category }))}
            >
              {categories.map((cat) => (
                <RadioRow
                  key={cat}
                  label={cat}
                  checked={draft.categories.includes(cat)}
                  onSelect={() =>
                    setDraft((d) => ({
                      ...d,
                      categories: d.categories.includes(cat)
                        ? d.categories.filter((c) => c !== cat)
                        : [...d.categories, cat],
                    }))
                  }
                />
              ))}
            </AccordionSection>
            {showRating ? (
              <AccordionSection
                title="Rating"
                open={sections.rating}
                onToggle={() => setSections((s) => ({ ...s, rating: !s.rating }))}
              >
                {[null, 4.5, 4.0, 3.5].map((rating) => (
                  <RadioRow
                    key={String(rating)}
                    label={rating == null ? 'All' : `${rating}+ Stars`}
                    checked={draft.minRating === rating}
                    onSelect={() => setDraft((d) => ({ ...d, minRating: rating }))}
                  />
                ))}
              </AccordionSection>
            ) : null}
          </ScrollView>
          <View className="flex-row gap-2 border-t border-border p-4">
            <Pressable
              onPress={() =>
                setDraft({
                  ...DEFAULT_FOOD_FILTERS,
                  query: value.query,
                  cuisine: value.cuisine,
                  priceTo: maxPrice,
                })
              }
              className="flex-1 rounded-xl border border-border py-2.5"
            >
              <Text className="text-center font-display text-base font-semibold uppercase tracking-wide text-fg">
                Reset
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                onApply(draft);
                dispatch(closeFilterDrawer());
              }}
              className="flex-[2] rounded-xl bg-primary py-2.5"
            >
              <Text className="text-center font-display text-base font-semibold uppercase tracking-wide text-on-primary">
                Apply
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
