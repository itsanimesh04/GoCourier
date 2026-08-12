import { campuses } from '../../../data/mockData';

interface CheckoutFormProps {
  campusId: string;
  paymentMethod: string;
  onCampusChange: (id: string) => void;
  onPaymentChange: (value: string) => void;
}

const paymentOptions = [
  { id: 'upi', label: 'UPI' },
  { id: 'card', label: 'Debit / Credit Card' },
];

const CheckoutForm = ({
  campusId,
  paymentMethod,
  onCampusChange,
  onPaymentChange,
}: CheckoutFormProps) => {
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
        <p className="mt-3 font-sans text-xs text-muted">
          Orders are delivered with tonight&apos;s hostel batch at your campus gate.
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-4 font-display text-lg font-bold uppercase text-fg sm:text-xl">Payment</h2>
        <ul className="space-y-2">
          {paymentOptions.map((opt) => (
            <li key={opt.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-3 py-3 hover:border-muted">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border border-fg ${
                    paymentMethod === opt.id ? 'bg-fg' : ''
                  }`}
                >
                  {paymentMethod === opt.id && (
                    <span className="h-1.5 w-1.5 rounded-full bg-bg" />
                  )}
                </span>
                <span className="font-display text-sm font-semibold uppercase text-fg">{opt.label}</span>
                <input
                  type="radio"
                  name="payment"
                  className="sr-only"
                  checked={paymentMethod === opt.id}
                  onChange={() => onPaymentChange(opt.id)}
                />
              </label>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default CheckoutForm;
