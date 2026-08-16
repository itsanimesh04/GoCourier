import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { addExtra } from '../store/slices/cartSlice';
import { selectAppConfig } from '../store/slices/catalogSlice';
import { setCatalogMode } from '../store/slices/uiSlice';
import ExtrasRequestShell from './components/Extras/ExtrasRequestShell';

const SERVICE_IMAGE =
  'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&q=80';

const sizes = ['Small', 'Medium', 'Large'] as const;

const ParcelRequestPage = () => {
  const dispatch = useAppDispatch();
  const config = useAppSelector(selectAppConfig);
  const fee = config?.parcelFee ?? 79;
  const navigate = useNavigate();
  const [pickup, setPickup] = useState('');
  const [dropPoint, setDropPoint] = useState('');
  const [size, setSize] = useState<(typeof sizes)[number]>('Small');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    dispatch(setCatalogMode('extras'));
  }, [dispatch]);

  const valid = pickup.trim() && dropPoint.trim();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const note = [
      `Pickup: ${pickup.trim()}`,
      `Drop: ${dropPoint.trim()}`,
      `Size: ${size}`,
      notes.trim() ? `Notes: ${notes.trim()}` : null,
    ]
      .filter(Boolean)
      .join(' · ');

    dispatch(
      addExtra({
        extrasProductId: 'parcel-pickup',
        name: 'Parcel pickup & drop',
        imageUrl: SERVICE_IMAGE,
        unitPrice: fee,
        note,
        itemKind: 'parcel',
        pickupPoint: pickup.trim(),
        dropPoint: dropPoint.trim(),
        size,
      })
    );
    navigate('/cart');
  };

  const fieldClass =
    'mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 font-sans text-sm text-fg outline-none focus:border-primary';

  return (
    <ExtrasRequestShell
      title="Parcel pickup & drop"
      subtitle="Send or collect parcels on campus — quoted and delivered with the batch."
    >
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="font-sans text-xs uppercase text-muted">Pickup point</span>
          <input
            type="text"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="e.g. Main gate courier desk"
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
            placeholder="Hostel Block C lobby"
            className={fieldClass}
            required
          />
        </label>
        <fieldset>
          <legend className="font-sans text-xs uppercase text-muted">Parcel size</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`rounded-xl px-3 py-1.5 font-sans text-sm font-medium transition-colors ${
                  size === s
                    ? 'bg-primary text-on-primary'
                    : 'border border-border bg-surface-2 text-muted hover:text-fg'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="block">
          <span className="font-sans text-xs uppercase text-muted">Notes (optional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Fragile, timing window…"
            className={`${fieldClass} resize-none`}
          />
        </label>
        <p className="font-sans text-xs text-muted">
          Base service fee ₹79 — final quote confirmed before pickup.
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

export default ParcelRequestPage;
