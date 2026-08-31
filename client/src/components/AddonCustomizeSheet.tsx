import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { FiChevronDown, FiSearch, FiX } from 'react-icons/fi';
import QtyStepper from './QtyStepper';
import VegBadge from './VegBadge';
import { lineUnitTotal } from '../data/selectors';
import { useAppDispatch } from '../store';
import { addFoodItem, setItemAddons } from '../store/slices/cartSlice';
import type { FoodAddon, MenuItem, SelectedAddon } from '../utils/types';
import { cn } from '../utils/utils';

const PREVIEW_COUNT = 4;

type SheetMode = 'add' | 'edit';

type OpenArgs = {
  menuItem: MenuItem;
  mode?: SheetMode;
  cartKey?: string;
  initialAddons?: SelectedAddon[];
  initialQuantity?: number;
};

type AddonCustomizeContextValue = {
  openCustomize: (args: OpenArgs) => void;
  hasCustomizableAddons: (item: MenuItem) => boolean;
};

const AddonCustomizeContext = createContext<AddonCustomizeContextValue | null>(null);

export function hasCustomizableAddons(item: MenuItem): boolean {
  if (item.addonGroups?.some((g) => g.subgroups.some((s) => s.addons.length > 0))) {
    return true;
  }
  return (item.addons?.length ?? 0) > 0;
}

export function AddonCustomizeProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [mode, setMode] = useState<SheetMode>('add');
  const [cartKey, setCartKey] = useState<string | undefined>();
  const [selected, setSelected] = useState<SelectedAddon[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const openCustomize = useCallback((args: OpenArgs) => {
    setMenuItem(args.menuItem);
    setMode(args.mode ?? 'add');
    setCartKey(args.cartKey);
    setSelected(args.initialAddons ?? []);
    setQuantity(args.initialQuantity ?? 1);
    setQuery('');
    setExpanded({});
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  const toggleAddon = (addon: FoodAddon) => {
    setSelected((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) return prev.filter((a) => a.id !== addon.id);
      return [...prev, { id: addon.id, name: addon.name, price: addon.price }];
    });
  };

  const unitTotal = menuItem ? lineUnitTotal(menuItem.price, selected) : 0;

  const groups = useMemo(() => {
    if (!menuItem) return [];
    if (menuItem.addonGroups && menuItem.addonGroups.length > 0) return menuItem.addonGroups;
    return [
      {
        id: 'flat',
        name: '',
        subgroups: [{ id: 'flat-sub', name: 'Add-ons', addons: menuItem.addons ?? [] }],
      },
    ];
  }, [menuItem]);

  const confirm = () => {
    if (!menuItem || !menuItem.isAvailable) return;
    if (mode === 'edit' && cartKey) {
      void dispatch(setItemAddons({ cartKey, selectedAddons: selected }));
    } else {
      void dispatch(
        addFoodItem({
          menuItemId: menuItem.id,
          restaurantId: menuItem.restaurantId,
          name: menuItem.name,
          imageUrl: menuItem.imageUrl,
          unitPrice: menuItem.price,
          quantity,
          selectedAddons: selected,
        })
      );
    }
    close();
  };

  const value = useMemo(
    () => ({ openCustomize, hasCustomizableAddons }),
    [openCustomize]
  );

  const q = query.trim().toLowerCase();

  return (
    <AddonCustomizeContext.Provider value={value}>
      {children}
      {open && menuItem ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/55"
            onClick={close}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-border bg-surface shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                {menuItem.imageUrl ? (
                  <img
                    src={menuItem.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
                <span className="absolute left-1 top-1">
                  <VegBadge isVeg={menuItem.isVeg} showLabel={false} />
                </span>
              </div>
              <h2 className="min-w-0 flex-1 font-display text-lg font-bold text-fg">
                {menuItem.name}
              </h2>
              <button
                type="button"
                onClick={close}
                className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-fg"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="border-b border-border px-4 py-3">
              <label className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2.5">
                <FiSearch className="shrink-0 text-muted" size={16} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search add-ons"
                  className="w-full bg-transparent font-sans text-sm text-fg outline-none placeholder:text-muted"
                />
                {query ? (
                  <button type="button" onClick={() => setQuery('')}>
                    <FiX size={14} className="text-muted" />
                  </button>
                ) : null}
              </label>
            </div>

            <div className="flex-1 overflow-y-auto px-1 pb-2">
              {groups.map((group) =>
                group.subgroups.map((sub) => {
                  let addons = sub.addons;
                  if (q) addons = addons.filter((a) => a.name.toLowerCase().includes(q));
                  if (addons.length === 0) return null;
                  const isExpanded = expanded[sub.id] || !!q;
                  const visible = isExpanded ? addons : addons.slice(0, PREVIEW_COUNT);
                  const remaining = addons.length - PREVIEW_COUNT;

                  return (
                    <div key={sub.id} className="pt-2">
                      {sub.name.trim() ? (
                        <p className="px-4 pb-2 pt-2 font-display text-sm font-bold uppercase tracking-wide text-fg">
                          {sub.name}
                        </p>
                      ) : null}
                      <ul>
                        {visible.map((addon) => {
                          const checked = selected.some((a) => a.id === addon.id);
                          return (
                            <li key={addon.id}>
                              <button
                                type="button"
                                onClick={() => toggleAddon(addon)}
                                className="flex w-full items-center gap-3 border-b border-border/60 px-4 py-3 text-left hover:bg-surface-2/60"
                              >
                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-surface-2">
                                  {addon.imageUrl ? (
                                    <img
                                      src={addon.imageUrl}
                                      alt=""
                                      className="h-full w-full object-cover"
                                    />
                                  ) : null}
                                  {addon.isVeg !== undefined ? (
                                    <span className="absolute left-0.5 top-0.5">
                                      <VegBadge isVeg={Boolean(addon.isVeg)} showLabel={false} />
                                    </span>
                                  ) : null}
                                </div>
                                <span className="min-w-0 flex-1 font-sans text-sm text-fg">
                                  {addon.name}
                                </span>
                                <span className="font-display text-sm font-semibold text-fg">
                                  ₹{addon.price}
                                </span>
                                <span
                                  className={cn(
                                    'inline-flex h-5 w-5 items-center justify-center rounded-[3px] border border-fg',
                                    checked && 'bg-fg'
                                  )}
                                >
                                  {checked ? (
                                    <span className="h-2 w-2 bg-bg" />
                                  ) : null}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                      {!isExpanded && remaining > 0 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setExpanded((e) => ({ ...e, [sub.id]: true }))
                          }
                          className="flex items-center gap-1 px-4 py-2 font-sans text-sm font-semibold text-primary"
                        >
                          +{remaining} more <FiChevronDown size={14} />
                        </button>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center gap-3 border-t border-border bg-surface px-4 py-3">
              {mode === 'add' ? (
                <QtyStepper value={quantity} onChange={setQuantity} />
              ) : (
                <div className="min-w-[72px]" />
              )}
              <button
                type="button"
                disabled={!menuItem.isAvailable}
                onClick={confirm}
                className="flex-1 rounded-xl bg-primary py-3.5 font-display text-sm font-semibold uppercase text-on-primary disabled:opacity-40"
              >
                {mode === 'edit'
                  ? `Update · ₹ ${unitTotal}`
                  : `Add item ₹ ${unitTotal * quantity}`}
              </button>
            </div>
          </div>
        </div>
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
