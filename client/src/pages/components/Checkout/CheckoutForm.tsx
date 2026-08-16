import { useAppSelector } from '../../../store';
import { selectCampuses } from '../../../store/slices/catalogSlice';

interface CheckoutFormProps {
  campusId: string;
  dropPoint: string;
  onCampusChange: (id: string) => void;
  onDropPointChange: (value: string) => void;
}

const CheckoutForm = ({
  campusId,
  dropPoint,
  onCampusChange,
  onDropPointChange,
}: CheckoutFormProps) => {
  const campuses = useAppSelector(selectCampuses);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-4 font-display text-lg font-bold uppercase text-fg sm:text-xl">Delivery</h2>
        <label className="block">
          <span className="mb-1 block font-sans text-sm uppercase text-muted">Campus</span>
          <select
            value={campusId}
            onChange={(e) => onCampusChange(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 font-sans text-fg outline-none focus:border-primary"
          >
            {campuses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.city}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-4 block">
          <span className="mb-1 block font-sans text-sm uppercase text-muted">Drop point</span>
          <input
            value={dropPoint}
            onChange={(e) => onDropPointChange(e.target.value)}
            placeholder="Hostel Block C lobby"
            className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 font-sans text-fg outline-none focus:border-primary"
          />
        </label>
        <p className="mt-3 font-sans text-xs text-muted">
          Pay securely with Razorpay. Orders deliver with tonight&apos;s hostel batch.
        </p>
      </section>
    </div>
  );
};

export default CheckoutForm;
