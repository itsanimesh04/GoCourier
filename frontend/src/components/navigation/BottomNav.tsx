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
    { label: 'Cart', href: mode === 'extras' ? '/extras/cart' : '/cart', icon: ShoppingCart, badge: mode === 'extras' ? extras.cartCount : cartCount },
    { label: 'Orders', href: '/orders', icon: ReceiptText },
    { label: 'Profile', href: '/profile', icon: User }
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-[520px] rounded-full bg-card/95 px-4 sm:px-8 py-2.5 backdrop-blur-xl shadow-2xl">
      <div className="grid grid-cols-4 gap-1 sm:gap-4">
        {items.map((item) => {
          const active =
            location.pathname === item.href ||
            (item.label === 'Orders' && location.pathname.startsWith('/orders')) ||
            (item.label === 'Cart' && (location.pathname === '/cart' || location.pathname === '/extras/cart'));
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.href}
              className={cn(
                'relative flex min-h-[42px] flex-row items-center justify-center gap-1.5 sm:gap-2 rounded-full text-xs sm:text-sm font-medium transition-colors py-1.5 px-2',
                active ? 'text-brand font-bold bg-surface2/60' : 'text-muted hover:text-text'
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.8 : 2.0} aria-hidden />
              <span>{item.label}</span>
              {item.badge ? (
                <span className="absolute -top-1 -right-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-brand px-1 font-display text-[10px] font-bold text-brandContrast shadow-sm">
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
