import { Minus, Plus } from 'lucide-react';
import type { ExtrasProduct } from '../../data/extrasCatalog';
import { formatINR } from '../../lib/utils';

export function ExtrasProductCard({ product, quantity, onAdd, onRemove }: { product: ExtrasProduct; quantity: number; onAdd: () => void; onRemove: () => void }) {
  const column = product.imageIndex % 4;
  const row = Math.floor(product.imageIndex / 4);
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-card border border-border bg-card">
      <div className="relative aspect-square overflow-hidden bg-surface2">
        <img
          src="/extras/product-sprite.png"
          alt={product.name}
          className="absolute h-[200%] w-[400%] max-w-none object-fill"
          style={{ left: `${-column * 100}%`, top: `${-row * 100}%` }}
        />
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5">{product.name}</h3>
        <p className="mt-1 text-xs text-muted">{product.unit}</p>
        <p className="mt-3 font-display text-lg font-bold">{formatINR(product.price)}</p>
        <p className={`mt-1 text-xs ${product.available ? 'text-success' : 'text-danger'}`}>{product.available ? 'In stock' : 'Unavailable'}</p>
        {quantity > 0 ? (
          <div className="mt-3 grid min-h-tap grid-cols-3 items-center rounded-button border border-brand text-brand">
            <button type="button" aria-label={`Remove one ${product.name}`} onClick={onRemove} className="grid min-h-tap place-items-center"><Minus size={17} /></button>
            <span className="text-center font-bold" aria-label={`${quantity} in cart`}>{quantity}</span>
            <button type="button" aria-label={`Add another ${product.name}`} onClick={onAdd} className="grid min-h-tap place-items-center"><Plus size={17} /></button>
          </div>
        ) : (
          <button type="button" disabled={!product.available} onClick={onAdd} className="mt-3 min-h-tap rounded-button border border-brand font-bold text-brand disabled:cursor-not-allowed disabled:border-border disabled:text-muted">Add</button>
        )}
      </div>
    </article>
  );
}
