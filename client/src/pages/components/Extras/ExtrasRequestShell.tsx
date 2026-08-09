import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface ExtrasRequestShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const ExtrasRequestShell = ({ title, subtitle, children }: ExtrasRequestShellProps) => {
  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 py-6 sm:py-10">
      <Link
        to="/extras"
        className="font-sans text-xs font-medium text-muted hover:text-primary"
      >
        ← Back to extras
      </Link>
      <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide text-fg sm:text-3xl">
        {title}
      </h1>
      <p className="mt-1 font-sans text-sm text-muted">{subtitle}</p>
      <div className="mt-6 rounded-2xl border border-border bg-surface p-4 sm:p-5">
        {children}
      </div>
    </div>
  );
};

export default ExtrasRequestShell;
