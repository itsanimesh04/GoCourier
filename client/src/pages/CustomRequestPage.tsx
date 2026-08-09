import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { addExtra } from '../store/slices/cartSlice';
import { setCatalogMode } from '../store/slices/uiSlice';
import ExtrasRequestShell from './components/Extras/ExtrasRequestShell';

const SERVICE_IMAGE =
  'https://images.unsplash.com/photo-1583485088034-697b5bc36b00?w=400&q=80';

const CustomRequestPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [need, setNeed] = useState('');
  const [quantity, setQuantity] = useState('');
  const [dropPoint, setDropPoint] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    dispatch(setCatalogMode('extras'));
  }, [dispatch]);

  const valid = need.trim() && quantity.trim() && dropPoint.trim();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const note = [
      `Need: ${need.trim()}`,
      `Qty: ${quantity.trim()}`,
      `Drop: ${dropPoint.trim()}`,
      notes.trim() ? `Notes: ${notes.trim()}` : null,
    ]
      .filter(Boolean)
      .join(' · ');

    dispatch(
      addExtra({
        extrasProductId: 'custom-request',
        name: 'Custom request',
        imageUrl: SERVICE_IMAGE,
        unitPrice: 49,
        note,
      })
    );
    navigate('/cart');
  };

  const fieldClass =
    'mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 font-sans text-sm text-fg outline-none focus:border-primary';

  return (
    <ExtrasRequestShell
      title="Custom request"
      subtitle="Tell us what you need — we'll quote and deliver with tonight's batch."
    >
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="font-sans text-xs uppercase text-muted">What do you need?</span>
          <input
            type="text"
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            placeholder="e.g. A4 sheets, phone charger"
            className={fieldClass}
            required
          />
        </label>
        <label className="block">
          <span className="font-sans text-xs uppercase text-muted">Quantity / approx</span>
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g. 2 packs"
            className={fieldClass}
            required
          />
        </label>
        <label className="block">
          <span className="font-sans text-xs uppercase text-muted">Drop point</span>
          <input
            type="text"
            value={dropPoint}
            onChange={(e) => setDropPoint(e.target.value)}
            placeholder="Hostel Block A, Room 204"
            className={fieldClass}
            required
          />
        </label>
        <label className="block">
          <span className="font-sans text-xs uppercase text-muted">Notes (optional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Brand preference, budget, timing…"
            className={`${fieldClass} resize-none`}
          />
        </label>
        <p className="font-sans text-xs text-muted">
          Base service fee ₹49 — final quote confirmed before procurement.
        </p>
        <button
          type="submit"
          disabled={!valid}
          className="w-full rounded-xl bg-primary py-2.5 font-sans text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add to cart
        </button>
      </form>
    </ExtrasRequestShell>
  );
};

export default CustomRequestPage;
