import { BiHeart, BiSolidHeart } from 'react-icons/bi';
import AddonPicker from '../../../components/AddonPicker';
import QtyStepper from '../../../components/QtyStepper';
import type { FoodAddon, SelectedAddon } from '../../../utils/types';
import { cn } from '../../../utils/utils';

interface ProductActionsProps {
  quantity: number;
  onQuantityChange: (n: number) => void;
  addons: FoodAddon[];
  selectedAddons: SelectedAddon[];
  onAddonsChange: (next: SelectedAddon[]) => void;
  onAddToCart: () => void;
  wishlisted: boolean;
  onToggleWishlist: () => void;
  disabled?: boolean;
  unitTotal: number;
}

const ProductActions = ({
  quantity,
  onQuantityChange,
  addons,
  selectedAddons,
  onAddonsChange,
  onAddToCart,
  wishlisted,
  onToggleWishlist,
  disabled,
  unitTotal,
}: ProductActionsProps) => {
  return (
    <div className="mt-8 space-y-6 border-t border-gray-200 pt-6">
      <AddonPicker
        addons={addons}
        selected={selectedAddons}
        onChange={onAddonsChange}
      />

      <div className="flex flex-wrap items-center gap-4">
        <QtyStepper value={quantity} onChange={onQuantityChange} />
        <button
          type="button"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={onToggleWishlist}
          className="border border-gray-300 p-3 text-tertiary hover:border-primary hover:text-primary"
        >
          {wishlisted ? (
            <BiSolidHeart size={22} className="text-primary" />
          ) : (
            <BiHeart size={22} />
          )}
        </button>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onAddToCart}
        className={cn(
          'w-full bg-primary py-3.5 font-bebas text-2xl uppercase tracking-wide text-white transition-colors hover:bg-red-700',
          disabled && 'cursor-not-allowed opacity-50 hover:bg-primary'
        )}
      >
        {disabled ? 'Unavailable' : `Add to Cart · ₹ ${unitTotal * quantity}`}
      </button>
    </div>
  );
};

export default ProductActions;
