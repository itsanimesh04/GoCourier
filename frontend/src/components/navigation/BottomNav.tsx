import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, ReceiptText, User } from '../icons';
import { cn } from '../../lib/utils';
import { useServiceMode } from '../../state/ServiceModeContext';
import { useExtrasCatalog } from '../../state/ExtrasCatalogContext';

export interface BottomNavProps {
  cartCount?: number;
}

export function BottomNav({ cartCount = 0 }: BottomNavProps) {
  const location = useLocation();
  const { config, mode } = useServiceMode();
  const extras = useExtrasCatalog();
  const items = [
    { label: 'Home', href: config.homeRoute, icon: Home },
    {
      label: 'Cart',
      href: mode === 'extras' ? '/extras/cart' : '/cart',
      icon: ShoppingCart,
      badge: mode === 'extras' ? extras.cartCount : cartCount
    },
    { label: 'Orders', href: '/orders', icon: ReceiptText },
    { label: 'Profile', href: '/profile', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl safe-bottom">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-4 gap-1 px-2 py-2 sm:px-6">
        {items.map((item) => {
          const active =
            location.pathname === item.href ||
            (item.label === 'Orders' && location.pathname.startsWith('/orders')) ||
            (item.label === 'Cart' &&
              (location.pathname === '/cart' || location.pathname === '/extras/cart'));
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.href}
              className={cn(
                'relative flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] sm:text-xs font-medium premium-transition py-1.5 px-2 sm:flex-row sm:gap-2 sm:text-sm',
                active
                  ? 'text-primary font-semibold bg-primary/5'
                  : 'text-muted hover:text-foreground hover:bg-input/60'
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.8 : 2.0} aria-hidden />
              <span>{item.label}</span>
              {item.badge ? (
                <span className="absolute top-1 right-1/4 sm:right-2 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-primary px-1 font-display text-[10px] font-bold text-primary-foreground shadow-subtle">
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
