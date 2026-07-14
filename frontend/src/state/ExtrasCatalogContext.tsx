import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { extrasProducts, extrasStores, type ExtrasProduct, type ExtrasStore } from '../data/extrasCatalog';

export interface ExtrasCartLine { productId: string; quantity: number }

interface ExtrasCatalogContextValue {
  products: ExtrasProduct[];
  stores: ExtrasStore[];
  cart: ExtrasCartLine[];
  cartCount: number;
  subtotal: number;
  add: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
  quantity: (productId: string) => number;
}

const ExtrasCatalogContext = createContext<ExtrasCatalogContextValue | null>(null);

export function ExtrasCatalogProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<ExtrasCartLine[]>([]);
  const add = useCallback((productId: string) => setCart((current) => {
    const existing = current.find((line) => line.productId === productId);
    return existing
      ? current.map((line) => line.productId === productId ? { ...line, quantity: line.quantity + 1 } : line)
      : [...current, { productId, quantity: 1 }];
  }), []);
  const remove = useCallback((productId: string) => setCart((current) => current
    .map((line) => line.productId === productId ? { ...line, quantity: line.quantity - 1 } : line)
    .filter((line) => line.quantity > 0)), []);
  const clear = useCallback(() => setCart([]), []);
  const value = useMemo<ExtrasCatalogContextValue>(() => ({
    products: extrasProducts,
    stores: extrasStores,
    cart,
    cartCount: cart.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: cart.reduce((sum, line) => sum + (extrasProducts.find((product) => product.id === line.productId)?.price ?? 0) * line.quantity, 0),
    add,
    remove,
    clear,
    quantity: (productId) => cart.find((line) => line.productId === productId)?.quantity ?? 0
  }), [add, cart, clear, remove]);
  return <ExtrasCatalogContext.Provider value={value}>{children}</ExtrasCatalogContext.Provider>;
}

export function useExtrasCatalog() {
  const context = useContext(ExtrasCatalogContext);
  if (!context) throw new Error('useExtrasCatalog must be used inside ExtrasCatalogProvider');
  return context;
}
