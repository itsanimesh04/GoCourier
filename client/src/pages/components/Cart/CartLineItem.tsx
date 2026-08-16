import { useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import AddonPicker from '../../../components/AddonPicker';
import QtyStepper from '../../../components/QtyStepper';
import { lineUnitTotal } from '../../../data/selectors';
import { useAppDispatch, useAppSelector } from '../../../store';
import { selectMenuItems } from '../../../store/slices/catalogSlice';
import { removeItem, setItemAddons, updateQty } from '../../../store/slices/cartSlice';
import type { CartLineItem as CartLine } from '../../../utils/types';

interface CartLineItemProps {
  item: CartLine;
}

const CartLineItem = ({ item }: CartLineItemProps) => {
  const dispatch = useAppDispatch();
  const menuItems = useAppSelector(selectMenuItems);
  const [editingAddons, setEditingAddons] = useState(false);
  const unit = lineUnitTotal(item.unitPrice, item.selectedAddons);
  const addons = item.menuItemId
    ? menuItems.find((m) => m.id === item.menuItemId)?.addons ?? []
    : [];

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
              <p className="mt-1 font-sans text-sm text-muted">
                {item.selectedAddons.map((a) => a.name).join(', ')}
              </p>
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

        {item.kind === 'food' && addons.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setEditingAddons((v) => !v)}
              className="font-display text-base font-semibold uppercase text-primary underline-offset-2 hover:underline"
            >
              {editingAddons ? 'Hide add-ons' : 'Edit add-ons'}
            </button>
            {editingAddons && (
              <div className="mt-3">
                <AddonPicker
                  addons={addons}
                  selected={item.selectedAddons}
                  onChange={(next) =>
                    dispatch(setItemAddons({ cartKey: item.cartKey, selectedAddons: next }))
                  }
                />
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default CartLineItem;
