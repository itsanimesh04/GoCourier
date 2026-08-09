import { FiMinus, FiPlus } from 'react-icons/fi';
import { extrasImageUrl } from '../data/extrasImages';
import type { ExtrasProduct } from '../data/extrasCatalog';
import { extrasStores } from '../data/extrasCatalog';
import { useAppDispatch, useAppSelector } from '../store';
import {
  addExtra,
  selectCartItems,
  updateQty,
} from '../store/slices/cartSlice';
import PriceDisplay from './PriceDisplay';

const ExtraCard = ({ product }: { product: ExtrasProduct }) => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const cartKey = `extra:${product.id}`;
  const line = items.find((i) => i.cartKey === cartKey);
  const cartQty = line?.quantity ?? 0;
  const store = extrasStores.find((s) => s.id === product.storeId);
  const imageUrl = extrasImageUrl(product.imageIndex);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.available) return;
    dispatch(
      addExtra({
        extrasProductId: product.id,
        name: product.name,
        imageUrl,
        unitPrice: product.price,
      })
    );
  };

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-muted">
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-surface-2">
        <img
          src={imageUrl}
          alt={product.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {!product.available && (
          <span className="absolute left-2 top-2 z-10 rounded-lg bg-surface-2 px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-fg">
            Sold out
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center p-2 text-center sm:p-2.5">
        <p className="font-sans text-[11px] text-muted">{store?.name ?? 'Campus store'}</p>
        <h3 className="mt-0.5 w-full truncate font-display text-sm font-semibold text-fg">
          {product.name}
        </h3>
        <p className="mt-0.5 font-sans text-[11px] text-muted">
          {product.unit} · {product.category}
        </p>
        <PriceDisplay price={product.price} size="sm" className="mt-1.5 justify-center" />
      </div>

      <div className="mt-auto px-2 pb-2 sm:px-2.5 sm:pb-2.5">
        {!product.available ? (
          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-lg border border-primary px-2 py-1 text-center font-display text-xs font-semibold text-primary opacity-40"
          >
            Unavailable
          </button>
        ) : cartQty > 0 ? (
          <div className="flex w-full items-center rounded-lg border border-primary bg-primary text-on-primary">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() =>
                dispatch(updateQty({ cartKey, quantity: cartQty - 1 }))
              }
              className="flex flex-1 items-center justify-center py-1 hover:opacity-80"
            >
              <FiMinus size={14} />
            </button>
            <span className="min-w-7 px-1.5 text-center font-display text-base font-semibold leading-none">
              {cartQty}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={handleAdd}
              className="flex flex-1 items-center justify-center py-1 hover:opacity-80"
            >
              <FiPlus size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            className="w-full rounded-lg border border-primary px-2 py-1 text-center font-display text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-on-primary"
          >
            Add to cart
          </button>
        )}
      </div>
    </div>
  );
};

export default ExtraCard;
