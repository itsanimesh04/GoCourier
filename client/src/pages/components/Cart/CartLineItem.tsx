import { useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import AddonPicker from '../../../components/AddonPicker';
import QtyStepper from '../../../components/QtyStepper';
import { getAddonsForMenuItem } from '../../../data/foodAddons';
import { lineUnitTotal } from '../../../data/selectors';
import { useAppDispatch } from '../../../store';
import { removeItem, setItemAddons, updateQty } from '../../../store/slices/cartSlice';
import type { CartLineItem as CartLine } from '../../../utils/types';

interface CartLineItemProps {
  item: CartLine;
}

const CartLineItem = ({ item }: CartLineItemProps) => {
  const dispatch = useAppDispatch();
  const [editingAddons, setEditingAddons] = useState(false);
  const unit = lineUnitTotal(item.unitPrice, item.selectedAddons);
  const addons = item.menuItemId ? getAddonsForMenuItem(item.menuItemId) : [];

  return (
    <article className="flex flex-col gap-4 border border-gray-200 p-4 sm:flex-row">
      <div className="h-28 w-full shrink-0 overflow-hidden bg-gray-100 sm:w-28">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bebas text-2xl uppercase text-tertiary">{item.name}</h3>
            <p className="font-bebas text-sm uppercase text-gray-500">
              {item.kind === 'extra' ? 'Campus Extra' : 'Food'}
            </p>
            {item.selectedAddons.length > 0 && (
              <p className="mt-1 font-sans text-sm text-gray-600">
                {item.selectedAddons.map((a) => a.name).join(', ')}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Remove item"
            onClick={() => dispatch(removeItem(item.cartKey))}
            className="p-1 text-gray-500 hover:text-primary"
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
          <span className="font-bebas text-2xl text-tertiary">₹ {unit * item.quantity}</span>
        </div>

        {item.kind === 'food' && addons.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setEditingAddons((v) => !v)}
              className="font-bebas text-base uppercase text-primary underline-offset-2 hover:underline"
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
