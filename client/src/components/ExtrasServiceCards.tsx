import { HiOutlineCube } from 'react-icons/hi2';
import { Link } from 'react-router-dom';

const services = [
  {
    id: 'custom',
    to: '/extras/custom-request',
    title: 'Custom request',
    subtitle: "Can't find what you need? Request a quote.",
  },
  {
    id: 'parcel',
    to: '/extras/parcel',
    title: 'Parcel pickup & drop',
    subtitle: 'Send or collect on campus with a quote.',
  },
] as const;

const ExtrasServiceCards = () => {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {services.map((s) => (
        <Link
          key={s.id}
          to={s.to}
          className="group flex items-center gap-3 rounded-2xl border border-border bg-surface-2 px-4 py-4 transition-colors hover:border-primary sm:px-5 sm:py-5"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface text-primary sm:h-12 sm:w-12">
            <HiOutlineCube className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.5} />
          </span>
          <span className="min-w-0 text-left">
            <span className="block font-display text-base font-semibold text-fg sm:text-lg">
              {s.title}
            </span>
            <span className="mt-0.5 block font-sans text-xs text-muted sm:text-sm">
              {s.subtitle}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
};

export default ExtrasServiceCards;
