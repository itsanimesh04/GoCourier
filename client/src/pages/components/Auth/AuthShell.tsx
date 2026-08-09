import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

const AuthShell = ({ title, subtitle, children, footer }: AuthShellProps) => {
  return (
    <div className="flex min-h-dvh w-full flex-col lg:flex-row">
      <div className="relative flex min-h-[36vh] w-full items-end overflow-hidden bg-primary lg:min-h-dvh lg:w-1/2">
        <img
          src="/food/chicken-biryani.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-linear-to-t from-primary via-primary/70 to-primary/40" />
        <div className="relative z-10 w-full p-6 sm:p-10 lg:p-14">
          <Link
            to="/"
            className="font-display text-2xl font-bold tracking-wider text-on-primary sm:text-3xl"
          >
            GoCourier
          </Link>
          <p className="mt-3 max-w-md font-display text-2xl font-bold uppercase leading-none tracking-wide text-on-primary sm:text-3xl">
            Campus food, delivered fast
          </p>
          <p className="mt-3 max-w-sm font-sans text-sm text-on-primary/85">
            Order from your favourite campus restaurants and extras in one place.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-1 items-center justify-center bg-bg px-5 py-10 sm:px-10 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-md">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-fg sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 font-sans text-sm text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 font-sans text-sm uppercase tracking-wide text-muted">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
