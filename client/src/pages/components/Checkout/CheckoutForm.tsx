import { campuses } from '../../../data/mockData';

interface CheckoutFormProps {
  campusId: string;
  dropPoint: string;
  paymentMethod: string;
  onCampusChange: (id: string) => void;
  onDropPointChange: (value: string) => void;
  onPaymentChange: (value: string) => void;
}

const paymentOptions = [
  { id: 'upi', label: 'UPI' },
  { id: 'card', label: 'Debit / Credit Card' },
  { id: 'cod', label: 'Cash on Delivery' },
];

const CheckoutForm = ({
  campusId,
  dropPoint,
  paymentMethod,
  onCampusChange,
  onDropPointChange,
  onPaymentChange,
}: CheckoutFormProps) => {
  return (
    <div className="space-y-8">
      <section className="border border-gray-200 p-5">
        <h2 className="mb-4 font-bebas text-2xl uppercase text-tertiary">Delivery</h2>
        <label className="mb-4 block">
          <span className="mb-1 block font-bebas text-sm uppercase text-gray-500">Campus</span>
          <select
            value={campusId}
            onChange={(e) => onCampusChange(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2.5 font-sans outline-none focus:border-primary"
          >
            {campuses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.city}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block font-bebas text-sm uppercase text-gray-500">
            Drop point
          </span>
          <input
            type="text"
            value={dropPoint}
            onChange={(e) => onDropPointChange(e.target.value)}
            placeholder="Hostel Block A, Room 204"
            className="w-full border border-gray-300 px-3 py-2.5 font-sans outline-none focus:border-primary"
          />
        </label>
      </section>

      <section className="border border-gray-200 p-5">
        <h2 className="mb-4 font-bebas text-2xl uppercase text-tertiary">Payment</h2>
        <ul className="space-y-2">
          {paymentOptions.map((opt) => (
            <li key={opt.id}>
              <label className="flex cursor-pointer items-center gap-3 border border-gray-200 px-3 py-3 hover:border-gray-400">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border border-tertiary ${
                    paymentMethod === opt.id ? 'bg-tertiary' : ''
                  }`}
                >
                  {paymentMethod === opt.id && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </span>
                <span className="font-bebas text-lg uppercase text-tertiary">{opt.label}</span>
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
