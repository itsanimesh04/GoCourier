import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

const LAST_UPDATED = '4 September 2026';

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="font-sans text-xs uppercase tracking-wide text-muted">GoCourier Private Limited</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 font-sans text-sm text-muted">Last updated: {LAST_UPDATED}</p>
      <div className="prose-legal mt-8 space-y-5 font-sans text-sm leading-relaxed text-fg/90 sm:text-[15px]">
        {children}
      </div>
      <nav className="mt-10 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-6 text-sm">
        <Link to="/privacy" className="text-primary hover:underline">
          Privacy
        </Link>
        <Link to="/terms" className="text-primary hover:underline">
          Terms
        </Link>
        <Link to="/refund-policy" className="text-primary hover:underline">
          Refunds
        </Link>
        <Link to="/shipping-policy" className="text-primary hover:underline">
          Delivery
        </Link>
        <Link to="/contact" className="text-primary hover:underline">
          Contact
        </Link>
      </nav>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-display text-lg font-semibold text-fg">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
