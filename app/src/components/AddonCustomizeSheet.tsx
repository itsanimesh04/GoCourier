import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Keyboard,
  Pressable,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetTextInput,
  type BottomSheetBackdropProps,
  type BottomSheetFooterProps,
} from '@gorhom/bottom-sheet';
import { ChevronDown, Search, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch } from '../store';
import { addFoodItem, setItemAddons } from '../store/slices/cartSlice';
import { lineUnitTotal } from '../data/selectors';
import { usePalette } from '../theme/ThemeProvider';
import type {
  FoodAddon,
  FoodOptionChoice,
  MenuItem,
  SelectedAddon,
  SelectedOption,
} from '../utils/types';
import { cn } from '../utils/utils';
import VegBadge, { RemoteImage } from './VegBadge';
import QtyStepper from './QtyStepper';

const PREVIEW_COUNT = 4;

type SheetMode = 'add' | 'edit';

type OpenArgs = {
  menuItem: MenuItem;
  mode?: SheetMode;
  cartKey?: string;
  initialAddons?: SelectedAddon[];
  initialOption?: SelectedOption;
  initialQuantity?: number;
};

type AddonCustomizeContextValue = {
  openCustomize: (args: OpenArgs) => void;
  hasCustomizableAddons: (item: MenuItem) => boolean;
};

const AddonCustomizeContext = createContext<AddonCustomizeContextValue | null>(null);

export function hasCustomizableAddons(item: MenuItem): boolean {
  if (item.optionSet && item.optionSet.choices.length > 0) return true;
  if (item.addonGroups && item.addonGroups.some((g) => g.subgroups.some((s) => s.addons.length > 0))) {
    return true;
  }
  return (item.addons?.length ?? 0) > 0;
}

type ListRow =
  | { type: 'header'; key: string }
  | { type: 'options'; key: string }
  | { type: 'search'; key: string }
  | { type: 'subgroup'; key: string; title: string }
  | {
      type: 'addon';
      key: string;
      addon: FoodAddon;
    }
  | { type: 'more'; key: string; subgroupId: string; remaining: number };

export function AddonCustomizeProvider({ children }: { children: ReactNode }) {
  const sheetRef = useRef<BottomSheet>(null);
  const dispatch = useAppDispatch();
  const colors = usePalette();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [mode, setMode] = useState<SheetMode>('add');
  const [cartKey, setCartKey] = useState<string | undefined>();
  const [selected, setSelected] = useState<SelectedAddon[]>([]);
  const [selectedOption, setSelectedOption] = useState<SelectedOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const snapPoints = useMemo(() => ['72%', '92%'], []);

  const openCustomize = useCallback((args: OpenArgs) => {
    setMenuItem(args.menuItem);
    setMode(args.mode ?? 'add');
    setCartKey(args.cartKey);
    setSelected(args.initialAddons ?? []);
    setSelectedOption(args.initialOption ?? null);
    setQuantity(args.initialQuantity ?? 1);
    setQuery('');
    setExpanded({});
    setVisible(true);
    requestAnimationFrame(() => sheetRef.current?.expand());
  }, []);

  const close = useCallback(() => {
    Keyboard.dismiss();
    sheetRef.current?.close();
  }, []);

  const toggleAddon = useCallback((addon: FoodAddon) => {
    setSelected((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) return prev.filter((a) => a.id !== addon.id);
      return [...prev, { id: addon.id, name: addon.name, price: addon.price }];
    });
  }, []);

  const pickOption = useCallback((choice: FoodOptionChoice) => {
    setSelectedOption({ id: choice.id, name: choice.name, price: choice.price });
  }, []);

  const requiresOption = Boolean(menuItem?.optionSet && menuItem.optionSet.choices.length > 0);
  const basePrice = selectedOption?.price ?? menuItem?.price ?? 0;
  const unitTotal = menuItem ? lineUnitTotal(basePrice, selected) : 0;
  const canConfirm = Boolean(menuItem?.isAvailable) && (!requiresOption || Boolean(selectedOption));

  const hasAddons = Boolean(
    menuItem &&
      ((menuItem.addonGroups &&
        menuItem.addonGroups.some((g) => g.subgroups.some((s) => s.addons.length > 0))) ||
        (menuItem.addons?.length ?? 0) > 0)
  );

  const rows = useMemo((): ListRow[] => {
    if (!menuItem) return [];
    const q = query.trim().toLowerCase();
    const result: ListRow[] = [{ type: 'header', key: 'header' }];

    if (menuItem.optionSet && menuItem.optionSet.choices.length > 0) {
      result.push({ type: 'options', key: 'options' });
    }

    if (hasAddons) {
      result.push({ type: 'search', key: 'search' });

      const groups =
        menuItem.addonGroups && menuItem.addonGroups.length > 0
          ? menuItem.addonGroups
          : [
              {
                id: 'flat',
                name: '',
                subgroups: [
                  {
                    id: 'flat-sub',
                    name: 'Add-ons',
                    addons: menuItem.addons ?? [],
                  },
                ],
              },
            ];

      for (const group of groups) {
        for (const sub of group.subgroups) {
          let addons = sub.addons;
          if (q) {
            addons = addons.filter((a) => a.name.toLowerCase().includes(q));
          }
          if (addons.length === 0) continue;

          if (sub.name.trim()) {
            result.push({ type: 'subgroup', key: `sub-${sub.id}`, title: sub.name });
          }

          const isExpanded = expanded[sub.id] || !!q;
          const visibleAddons = isExpanded ? addons : addons.slice(0, PREVIEW_COUNT);
          for (const addon of visibleAddons) {
            result.push({ type: 'addon', key: `addon-${addon.id}`, addon });
          }
          if (!isExpanded && addons.length > PREVIEW_COUNT) {
            result.push({
              type: 'more',
              key: `more-${sub.id}`,
              subgroupId: sub.id,
              remaining: addons.length - PREVIEW_COUNT,
            });
          }
        }
      }
    }

    return result;
  }, [menuItem, query, expanded, hasAddons]);

  const confirm = useCallback(() => {
    if (!menuItem || !canConfirm) return;
    const option = selectedOption ?? undefined;
    const unitPrice = option?.price ?? menuItem.price;
    const displayName = option ? `${menuItem.name} · ${option.name}` : menuItem.name;

    if (mode === 'edit' && cartKey) {
      void dispatch(
        setItemAddons({
          cartKey,
          selectedAddons: selected,
          selectedOption: option,
          unitPrice,
        })
      );
    } else {
      void dispatch(
        addFoodItem({
          menuItemId: menuItem.id,
          restaurantId: menuItem.restaurantId,
          name: displayName,
          imageUrl: menuItem.imageUrl,
          unitPrice,
          quantity,
          selectedAddons: selected,
          selectedOption: option,
        })
      );
    }
    close();
  }, [menuItem, canConfirm, selectedOption, mode, cartKey, selected, quantity, dispatch, close]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.55} />
    ),
    []
  );

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={Math.max(insets.bottom, 8)}>
        <View className="flex-row items-center gap-3 border-t border-border bg-surface px-4 py-3">
          {mode === 'add' ? (
            <QtyStepper value={quantity} onChange={setQuantity} />
          ) : (
            <View className="min-w-[72px]" />
          )}
          <Pressable
            onPress={confirm}
            disabled={!canConfirm}
            className="flex-1 rounded-xl bg-primary py-3.5 disabled:opacity-40"
          >
            <Text className="text-center font-display text-sm font-semibold uppercase text-on-primary">
              {mode === 'edit'
                ? `Update · ₹ ${unitTotal}`
                : `Add item ₹ ${unitTotal * quantity}`}
            </Text>
          </Pressable>
        </View>
      </BottomSheetFooter>
    ),
    [confirm, insets.bottom, canConfirm, mode, quantity, unitTotal]
  );

  const renderItem: ListRenderItem<ListRow> = useCallback(
    ({ item }) => {
      if (item.type === 'header' && menuItem) {
        return (
          <View className="flex-row items-center gap-3 px-4 pb-3 pt-1">
            <View className="relative h-14 w-14 overflow-hidden rounded-lg bg-surface-2">
              <RemoteImage uri={menuItem.imageUrl} className="h-full w-full" />
              <View className="absolute left-1 top-1">
                <VegBadge isVeg={menuItem.isVeg} />
              </View>
            </View>
            <Text className="flex-1 font-display text-lg font-bold text-fg" numberOfLines={2}>
              {menuItem.name}
            </Text>
            <Pressable onPress={close} hitSlop={12} className="p-1">
              <X size={20} color={colors.muted} />
            </Pressable>
          </View>
        );
      }

      if (item.type === 'options' && menuItem?.optionSet) {
        return (
          <View className="px-4 pb-3">
            <Text className="pb-2 font-display text-sm font-bold uppercase tracking-wide text-fg">
              {menuItem.optionSet.name}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {menuItem.optionSet.choices.map((choice) => {
                const active = selectedOption?.id === choice.id;
                return (
                  <Pressable
                    key={choice.id}
                    onPress={() => pickOption(choice)}
                    className={cn(
                      'rounded-xl border px-3 py-2',
                      active ? 'border-primary bg-primary/10' : 'border-border bg-surface-2'
                    )}
                  >
                    <Text
                      className={cn(
                        'font-sans text-sm font-semibold',
                        active ? 'text-primary' : 'text-fg'
                      )}
                    >
                      {choice.name}
                    </Text>
                    <Text className="font-display text-xs text-muted">₹{choice.price}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      }

      if (item.type === 'search') {
        return (
          <View className="mx-4 mb-3 flex-row items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2.5">
            <Search size={16} color={colors.muted} />
            <BottomSheetTextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search add-ons"
              placeholderTextColor={colors.muted}
              className="flex-1 font-sans text-sm text-fg"
              autoCorrect={false}
            />
            {query ? (
              <Pressable onPress={() => setQuery('')}>
                <X size={14} color={colors.muted} />
              </Pressable>
            ) : null}
          </View>
        );
      }

      if (item.type === 'subgroup') {
        return (
          <Text className="px-4 pb-2 pt-4 font-display text-sm font-bold uppercase tracking-wide text-fg">
            {item.title}
          </Text>
        );
      }

      if (item.type === 'more') {
        return (
          <Pressable
            onPress={() => setExpanded((e) => ({ ...e, [item.subgroupId]: true }))}
            className="flex-row items-center gap-1 px-4 py-2"
          >
            <Text className="font-sans text-sm font-semibold text-primary">
              +{item.remaining} more
            </Text>
            <ChevronDown size={14} color={colors.primary} />
          </Pressable>
        );
      }

      if (item.type === 'addon') {
        const checked = selected.some((a) => a.id === item.addon.id);
        return (
          <Pressable
            onPress={() => toggleAddon(item.addon)}
            className="flex-row items-center gap-3 border-b border-border/60 px-4 py-3"
          >
            <View className="relative h-12 w-12 overflow-hidden rounded-md bg-surface-2">
              <RemoteImage uri={item.addon.imageUrl} className="h-full w-full" />
              {item.addon.isVeg !== undefined ? (
                <View className="absolute left-0.5 top-0.5">
                  <VegBadge isVeg={Boolean(item.addon.isVeg)} />
                </View>
              ) : null}
            </View>
            <Text className="flex-1 font-sans text-sm text-fg">{item.addon.name}</Text>
            <Text className="font-display text-sm font-semibold text-fg">₹{item.addon.price}</Text>
            <View
              className={cn(
                'h-5 w-5 items-center justify-center rounded-[3px] border border-fg',
                checked && 'bg-fg'
              )}
            >
              {checked ? <View className="h-2 w-2 bg-bg" /> : null}
            </View>
          </Pressable>
        );
      }

      return null;
    },
    [close, colors, menuItem, query, selected, selectedOption, toggleAddon, pickOption]
  );

  const value = useMemo(
    () => ({ openCustomize, hasCustomizableAddons }),
    [openCustomize]
  );

  return (
    <AddonCustomizeContext.Provider value={value}>
      {children}
      {visible ? (
        <BottomSheet
          ref={sheetRef}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose
          onClose={() => setVisible(false)}
          backdropComponent={renderBackdrop}
          footerComponent={renderFooter}
          backgroundStyle={{ backgroundColor: colors.surface }}
          handleIndicatorStyle={{ backgroundColor: colors.muted }}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
        >
          <BottomSheetFlatList
            data={rows}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            keyboardShouldPersistTaps="handled"
          />
        </BottomSheet>
      ) : null}
    </AddonCustomizeContext.Provider>
  );
}

export function useAddonCustomize() {
  const ctx = useContext(AddonCustomizeContext);
  if (!ctx) {
    throw new Error('useAddonCustomize must be used within AddonCustomizeProvider');
  }
  return ctx;
}
