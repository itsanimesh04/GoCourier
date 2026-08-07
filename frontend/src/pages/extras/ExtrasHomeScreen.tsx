import { Box, MapPin, Package, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell, BottomNav, CampusLocation, CountdownCard, Logo, TextInput } from '../../components/ui';
import { ServiceModeSwitch } from '../../components/common/ServiceModeSwitch';
import { ExtrasProductCard } from '../../components/extras/ExtrasProductCard';
import { extrasCategories, type ExtrasCategory } from '../../data/extrasCatalog';
import { useAppState } from '../../state/AppState';
import { useExtrasCatalog } from '../../state/ExtrasCatalogContext';
import { useCountdown } from '../../lib/useCountdown';

const categoryIcon: Record<ExtrasCategory, string> = {
  All: '▦', Stationery: '✎', Snacks: '◇', Drinks: '◉', 'Personal Care': '✦', Accessories: '⌁'
};

export function ExtrasHomeScreen() {
  const navigate = useNavigate();
  const { selectedCampus } = useAppState();
  const { products, stores, cartCount, add, remove, quantity } = useExtrasCatalog();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ExtrasCategory>('All');
  const secondsLeft = useCountdown(5055);
  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = category === 'All' || product.category === category;
    const store = stores.find((entry) => entry.id === product.storeId);
    return matchesCategory && `${product.name} ${product.category} ${store?.name ?? ''}`.toLowerCase().includes(query.trim().toLowerCase());
  }), [category, products, query, stores]);

  return (
    <AppShell bottomNav={<BottomNav cartCount={cartCount} />} className="px-0" contentClassName="content-rail py-4">
      <div className="mb-5 flex min-h-tap items-center justify-between gap-3">
        <Logo compact />
        <CampusLocation label={selectedCampus?.name || 'Nims University'} onClick={() => navigate('/campus')} />
      </div>
      <ServiceModeSwitch />
      <section className="mt-7">
        <h1 className="max-w-2xl font-display text-3xl font-extrabold tracking-tight md:text-4xl">Everything else, on your campus.</h1>
        <div className="mt-5 max-w-xl"><CountdownCard label="Batch cutoff" secondsLeft={secondsLeft} totalSeconds={5055} note="Products ordered now join tonight's campus batch" /></div>
      </section>
      <div className="mt-5">
        <TextInput value={query} onChange={setQuery} placeholder="Search products and stores" icon={<Search size={19} />} />
      </div>
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        {extrasCategories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`flex min-h-tap shrink-0 items-center gap-2 rounded-button border px-3.5 text-xs font-bold transition ${category === item ? 'border-brand bg-brand text-brandContrast' : 'border-border bg-card text-muted hover:text-text'}`}><span aria-hidden>{categoryIcon[item]}</span>{item}</button>)}
      </div>
      <section className="mt-6 grid gap-3 md:grid-cols-2">
        <button type="button" onClick={() => navigate('/extras/request/new')} className="surface-gradient flex min-h-tap items-center gap-4 rounded-card border border-border p-5 text-left" aria-label="Start a custom request"><Box className="shrink-0 text-secondary" size={34} /><div><h2 className="font-display text-lg font-bold">Custom request</h2><p className="mt-1 text-sm text-muted">Can't find what you need? Request a quote.</p></div></button>
        <button type="button" onClick={() => navigate('/extras/parcel/new')} className="surface-gradient flex min-h-tap items-center gap-4 rounded-card border border-border p-5 text-left" aria-label="Start a parcel pickup and drop request"><Package className="shrink-0 text-secondary" size={34} /><div><h2 className="font-display text-lg font-bold">Parcel pickup & drop</h2><p className="mt-1 text-sm text-muted">Send or collect on campus with a quote.</p></div></button>
      </section>
      <section className="mt-8">
        <div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold">{query || category !== 'All' ? 'Products' : 'Featured products'}</h2><Sparkles className="text-brand" size={20} /></div>
        {visibleProducts.length ? <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{visibleProducts.map((product) => <ExtrasProductCard key={product.id} product={product} quantity={quantity(product.id)} onAdd={() => add(product.id)} onRemove={() => remove(product.id)} />)}</div> : <div className="mt-4 rounded-card border border-border bg-card p-8 text-center"><Search className="mx-auto text-muted" size={34} /><h3 className="mt-3 font-display font-bold">No products found</h3><p className="mt-1 text-sm text-muted">Try another search or category.</p></div>}
      </section>
      <section className="mt-9">
        <div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold">Popular stores</h2><MapPin className="text-secondary" size={20} /></div>
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-2">{stores.map((store) => <article key={store.id} className="min-w-[190px] rounded-card border border-border bg-card p-4"><div className="grid h-11 w-11 place-items-center rounded-button bg-surface2 font-display text-xl font-extrabold" style={{ color: store.accent }}>{store.name.slice(0, 1)}</div><h3 className="mt-4 font-display font-bold">{store.name}</h3><p className="mt-1 text-xs leading-5 text-muted">{store.category}</p></article>)}</div>
      </section>
    </AppShell>
  );
}
