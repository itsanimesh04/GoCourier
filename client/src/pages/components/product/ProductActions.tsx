import { BiHeart, BiSolidHeart } from 'react-icons/bi';
import QtyStepper from '../../../components/QtyStepper';
import { cn } from '../../../utils/utils';

interface ProductActionsProps {
  quantity: number;
  onQuantityChange: (n: number) => void;
  onAddToCart: () => void;
  wishlisted: boolean;
  onToggleWishlist: () => void;
  disabled?: boolean;
  unitTotal: number;
  customizeLabel?: boolean;
}

const ProductActions = ({
  quantity,
  onQuantityChange,
  onAddToCart,
  wishlisted,
  onToggleWishlist,
  disabled,
  unitTotal,
  customizeLabel,
}: ProductActionsProps) => {
  return (
    <div className="mt-8 space-y-6 border-t border-border pt-6">
      {customizeLabel ? (
        <p className="font-sans text-sm text-muted">
          Customize add-ons when you add this item to your cart.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <QtyStepper value={quantity} onChange={onQuantityChange} />
        <button
          type="button"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={onToggleWishlist}
          className="rounded-xl border border-border p-3 text-fg hover:border-primary hover:text-primary"
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
          'w-full rounded-xl bg-primary py-3 font-display text-sm font-semibold uppercase tracking-wide text-on-primary transition-opacity hover:opacity-90',
          disabled && 'cursor-not-allowed opacity-50 hover:opacity-50'
        )}
      >
        {disabled
          ? 'Unavailable'
          : customizeLabel
            ? `Customize · ₹ ${unitTotal}+`
            : `Add to Cart · ₹ ${unitTotal}`}
      </button>
    </div>
  );
};

export default ProductActions;
