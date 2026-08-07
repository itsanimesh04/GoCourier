import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AppShell,
  BottomNav,
  BottomSheet,
  CartBar,
  MenuHeader,
  MenuItemCard,
  PrimaryButton,
  ScreenHeader,
  SecondaryButton,
  ShareButton,
  ShoppingCart
} from '../../components/ui';
import { useAppState } from '../../state/AppState';
import { useCartLines } from '../../lib/useCartLines';

export function RestaurantMenuScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { restaurants, menuItems, cartItems, addItem, removeItem, pendingSwitch, setPendingSwitch, clearCartAndSwitch, loadMenu } = useAppState();
  const [addedInMenu, setAddedInMenu] = useState<string[]>([]);
  const restaurant = restaurants.find((entry) => entry.id === id) ?? restaurants[0];
  const items = menuItems.filter((entry) => entry.restaurantId === restaurant.id);
  const { subtotal, count } = useCartLines();
  const cartRestaurant = restaurants.find((entry) => entry.id === cartItems[0]?.restaurantId);

  useEffect(() => {
    if (id) {
      void loadMenu(id);
    }
  }, [id, loadMenu]);

  return (
    <AppShell
      bottomNav={<BottomNav cartCount={cartItems.length} />}
      className="px-0"
      contentClassName="content-rail py-4"
      floatingCart={
        count ? (
          <CartBar
            count={count}
            total={subtotal}
            onClick={() => navigate('/cart')}
          />
        ) : undefined
      }
    >
      <ScreenHeader title={restaurant.name} right={<ShareButton />} />
      <MenuHeader restaurant={restaurant} />
      <h2 className="mb-3 font-display text-xl font-bold">Recommended</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
        {items.map((item) => {
          const quantity = cartItems.find((cartItem) => cartItem.menuItemId === item.id)?.quantity ?? 0;
          const shouldPresentAsAdd = ['garlic-bread', 'chocolate-shake'].includes(item.id) && !addedInMenu.includes(item.id);
          return (
            <MenuItemCard
              key={item.id}
              item={item}
              quantity={shouldPresentAsAdd ? 0 : quantity}
              onAdd={() => {
                setAddedInMenu((current) => [...current, item.id]);
                addItem(item.id);
              }}
              onIncrement={() => {
                setAddedInMenu((current) => (current.includes(item.id) ? current : [...current, item.id]));
                addItem(item.id);
              }}
              onDecrement={() => removeItem(item.id)}
            />
          );
        })}
      </div>

      <BottomSheet open={Boolean(pendingSwitch)} onClose={() => setPendingSwitch(null)}>
        <div className="text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-brand text-brand">
            <ShoppingCart size={38} />
          </div>
          <h2 className="mt-5 font-display text-2xl font-bold">Switch restaurants?</h2>
          <p className="mx-auto mt-2 max-w-[300px] text-sm leading-5 text-muted">
            You've got items from {cartRestaurant?.name ?? 'another restaurant'} in your cart. Wanna clear it to add from {restaurant.name}?
          </p>
          <div className="mt-6 space-y-3">
            <PrimaryButton icon={false} onClick={clearCartAndSwitch}>
              Clear cart & switch
            </PrimaryButton>
            <SecondaryButton onClick={() => setPendingSwitch(null)}>Nope, keep my cart</SecondaryButton>
          </div>
        </div>
      </BottomSheet>
    </AppShell>
  );
}
