import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppShell, BottomNav, EmptyStateBlock, PrimaryButton, ScreenHeader } from '../../components/ui';
import { useExtrasCatalog } from '../../state/ExtrasCatalogContext';
import { formatINR } from '../../lib/utils';

function ProductThumb({ index, name }: { index: number; name: string }) {
  const column = index % 4; const row = Math.floor(index / 4);
  return <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[14px] bg-surface2"><img src="/extras/product-sprite.png" alt={name} className="absolute h-[200%] w-[400%] max-w-none" style={{ left: `${-column * 100}%`, top: `${-row * 100}%` }} /></div>;
}

export function ExtrasCartScreen() {
  const navigate = useNavigate();
  const { cart, products, cartCount, subtotal, add, remove, clear } = useExtrasCatalog();
  const selected = cart.map((line) => ({ line, product: products.find((product) => product.id === line.productId) })).filter((entry) => entry.product);
  return <AppShell bottomNav={<BottomNav cartCount={cartCount} />} className="px-0" contentClassName="content-rail py-4"><ScreenHeader title="Your Cart" />
    {selected.length ? <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12"><div className="space-y-3 md:col-span-7">
      <section className="card-gradient flex min-h-[72px] items-center justify-between rounded-card border border-border p-4"><div><span className="text-xs font-bold text-brand">EXTRAS</span><h1 className="mt-1 font-display text-base font-bold">Everyday delivery</h1><p className="text-xs text-muted">{cartCount} {cartCount === 1 ? 'item' : 'items'} in this cart</p></div><button type="button" onClick={clear} className="grid min-h-tap min-w-tap place-items-center text-danger" aria-label="Clear cart"><Trash2 size={19}/></button></section>
      {selected.map(({ line, product }) => product ? <article key={product.id} className="card-gradient flex min-h-[76px] items-center gap-3 rounded-card border border-border p-3"><ProductThumb index={product.imageIndex} name={product.name}/><div className="min-w-0 flex-1"><h2 className="truncate font-display text-sm font-bold">{product.name}</h2><p className="text-xs text-muted">{product.unit}</p><p className="mt-1 font-display text-sm font-bold">{formatINR(product.price * line.quantity)}</p></div><div className="grid h-9 w-[108px] grid-cols-3 overflow-hidden rounded-button border border-brand bg-brand/10 font-bold text-brand"><button type="button" onClick={() => remove(product.id)} aria-label={`Remove one ${product.name}`} className="grid place-items-center"><Minus size={14}/></button><span className="grid place-items-center text-text">{line.quantity}</span><button type="button" onClick={() => add(product.id)} aria-label={`Add another ${product.name}`} className="grid place-items-center"><Plus size={14}/></button></div></article> : null)}
    </div><div className="space-y-4 md:col-span-5"><section className="card-gradient rounded-card border border-border p-4"><h2 className="font-display text-base font-bold">Bill summary</h2><div className="mt-4 flex justify-between text-sm"><span className="text-muted">Subtotal</span><strong>{formatINR(subtotal)}</strong></div><div className="mt-3 flex justify-between text-sm"><span className="text-muted">Delivery & service fee</span><span>At checkout</span></div><div className="mt-4 border-t border-border pt-4"><PrimaryButton disabled>Continue to checkout</PrimaryButton><p className="mt-3 text-center text-xs text-muted">Checkout connects after the Extras backend is ready.</p></div></section></div></div>
    : <EmptyStateBlock icon={<ShoppingBag size={54}/>} heading="Cart's feeling lonely" subtext="Add an everyday essential to get started" action="Browse Extras" onAction={() => navigate('/extras')}/>}</AppShell>;
}
