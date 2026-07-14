import { Check, Clock, Package, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppShell, BottomNav, ScreenHeader, StatusPill } from '../components/ui';
import { useAppState } from '../state/AppState';
import { useExtrasRequests } from '../state/ExtrasRequestContext';
import { formatINR } from '../lib/utils';

function TypeBadge({ type }: { type: 'food' | 'extras' }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${type === 'food' ? 'border-[#FF2E63]/40 bg-[#FF2E63]/10 text-[#FF2E63]' : 'border-[#D4FF4F]/40 bg-[#D4FF4F]/10 text-[#D4FF4F]'}`}>{type === 'food' ? <Utensils size={12}/> : <Package size={12}/>} {type === 'food' ? 'Food' : 'Extras'}</span>;
}

export function OrdersScreen() {
  const navigate = useNavigate(); const { order, cartItems } = useAppState(); const { requests } = useExtrasRequests();
  return <AppShell bottomNav={<BottomNav cartCount={cartItems.length} />}><ScreenHeader title="My Orders"/><div className="mx-auto max-w-2xl"><h1 className="font-display text-[28px] font-bold">Active orders</h1>
    <div className="mt-4 space-y-3">
      <article className="card-gradient rounded-card border border-border p-4"><div className="flex items-start justify-between gap-3"><div><TypeBadge type="food"/><h2 className="mt-3 font-display text-lg font-bold">{order.restaurantName}</h2><p className="mt-1 text-sm text-muted">{order.items.map((item) => `${item.name} ×${item.quantity}`).join(', ')}</p></div><StatusPill tone="urgent" icon={<Clock size={14}/>}>In progress</StatusPill></div><div className="mt-4 flex items-center justify-between border-t border-border pt-3"><strong>{formatINR(order.totalAmount)}</strong><button type="button" onClick={() => navigate(`/orders/${order.id}/tracking`)} className="min-h-tap rounded-button border border-[#FF2E63]/50 px-4 text-sm font-bold text-[#FF2E63]">Track status</button></div></article>
      {requests.map((request) => <article key={request.id} className="card-gradient rounded-card border border-border p-4"><div className="flex items-start justify-between gap-3"><div><TypeBadge type="extras"/><h2 className="mt-3 font-display text-lg font-bold">{request.title}</h2><p className="mt-1 text-sm text-muted">{request.kind === 'parcel' ? 'Parcel pickup & drop' : `Custom request ×${request.quantity}`}</p></div><StatusPill tone={request.status === 'quote_accepted' ? 'success' : 'urgent'}>{request.status === 'quote_ready' ? 'Quote ready' : request.status === 'quote_accepted' ? 'Quote accepted' : 'Under review'}</StatusPill></div><div className="mt-4 flex items-center justify-between border-t border-border pt-3"><span className="text-sm text-muted">Drop: {request.dropPoint}</span><button type="button" onClick={() => navigate(`/extras/requests/${request.id}`)} className="min-h-tap rounded-button border border-[#D4FF4F]/50 px-4 text-sm font-bold text-[#D4FF4F]">View request</button></div></article>)}
    </div>
    <h2 className="mt-8 font-display text-xl font-bold">Past orders</h2><article className="card-gradient mt-3 rounded-card border border-border p-4 opacity-85"><div className="flex items-center justify-between"><div><TypeBadge type="food"/><h3 className="mt-3 font-display font-bold">The Rising Cafe</h3><p className="text-xs text-muted">July 8, 2026 · Delivered at 9:43 PM</p></div><StatusPill tone="success" icon={<Check size={13}/>}>Delivered</StatusPill></div><p className="mt-3 text-xs text-muted">Paneer Pizza ×1, Garlic Bread ×1</p><strong className="mt-3 block text-sm">₹294</strong></article>
  </div></AppShell>;
}
