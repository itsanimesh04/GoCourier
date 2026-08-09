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
      {/* Left visual panel */}
      <div className="relative flex min-h-[36vh] w-full items-end overflow-hidden bg-primary lg:min-h-dvh lg:w-1/2">
        <img
          src="/food/chicken-biryani.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/40" />
        <div className="relative z-10 w-full p-6 sm:p-10 lg:p-14">
          <Link
            to="/"
            className="font-bebas text-2xl tracking-wider text-white sm:text-3xl"
          >
            GoCourierService
          </Link>
          <p className="mt-3 max-w-md font-bebas text-3xl uppercase leading-none tracking-wide text-white sm:text-4xl lg:text-5xl">
            Campus food, delivered fast
          </p>
          <p className="mt-3 max-w-sm font-sans text-sm text-white/85 sm:text-base">
            Order from your favourite campus restaurants and extras in one place.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-1 items-center justify-center bg-white px-5 py-10 sm:px-10 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-md">
          <h1 className="font-bebas text-4xl uppercase tracking-wide text-tertiary sm:text-5xl">
            {title}
          </h1>
          <p className="mt-2 font-sans text-sm text-gray-600 sm:text-base">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 font-bebas text-base uppercase tracking-wide text-gray-600">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
