import { FiTrash2 } from 'react-icons/fi';
import QtyStepper from '../../../components/QtyStepper';
import {
  hasCustomizableAddons,
  useAddonCustomize,
} from '../../../components/AddonCustomizeSheet';
import { lineUnitTotal } from '../../../data/selectors';
import { useAppDispatch, useAppSelector } from '../../../store';
import { selectMenuItems } from '../../../store/slices/catalogSlice';
import { removeItem, updateQty } from '../../../store/slices/cartSlice';
import type { CartLineItem as CartLine } from '../../../utils/types';

interface CartLineItemProps {
  item: CartLine;
}

const CartLineItem = ({ item }: CartLineItemProps) => {
  const dispatch = useAppDispatch();
  const menuItems = useAppSelector(selectMenuItems);
  const { openCustomize } = useAddonCustomize();
  const unit = lineUnitTotal(item.unitPrice, item.selectedAddons);
  const menuItem = item.menuItemId
    ? menuItems.find((m) => m.id === item.menuItemId)
    : undefined;
  const canEditAddons = menuItem ? hasCustomizableAddons(menuItem) : false;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:flex-row">
      <div className="h-28 w-full shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:w-28">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold uppercase text-fg sm:text-xl">{item.name}</h3>
            <p className="font-sans text-xs uppercase text-muted">
              {item.kind === 'extra' ? 'Campus Extra' : 'Food'}
            </p>
            {item.note && (
              <p className="mt-1 font-sans text-xs text-muted sm:text-sm">{item.note}</p>
            )}
            {item.selectedAddons.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {item.selectedAddons.map((a) => (
                  <li key={a.id} className="font-sans text-sm text-muted">
                    {a.name} · +₹{a.price}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="button"
            aria-label="Remove item"
            onClick={() => dispatch(removeItem(item.cartKey))}
            className="rounded-xl p-1 text-muted hover:text-primary"
          >
            <FiTrash2 size={18} />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <QtyStepper
            value={item.quantity}
            min={0}
            onChange={(n) =>
              dispatch(updateQty({ cartKey: item.cartKey, quantity: n }))
            }
          />
          <span className="font-display text-lg font-semibold text-fg sm:text-xl">₹ {unit * item.quantity}</span>
        </div>

        {item.kind === 'food' && canEditAddons && menuItem ? (
          <button
            type="button"
            onClick={() =>
              openCustomize({
                menuItem,
                mode: 'edit',
                cartKey: item.cartKey,
                initialAddons: item.selectedAddons,
              })
            }
            className="self-start font-display text-base font-semibold uppercase text-primary underline-offset-2 hover:underline"
          >
            {item.selectedAddons.length > 0 ? 'Edit add-ons' : 'Add add-ons'}
          </button>
        ) : null}
      </div>
    </article>
  );
};

export default CartLineItem;
