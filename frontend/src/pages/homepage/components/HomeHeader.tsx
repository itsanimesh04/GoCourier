import { Bike } from '../../../components/icons';
import { useAppState } from '../../../state/AppState';
import { cn } from '../../../lib/utils';
import { Link } from 'react-router-dom';

export function HomeHeader() {
  const { isAuthenticated, userName } = useAppState();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="content-rail flex h-16 items-center justify-between gap-4 sm:h-[72px]">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-cta">
            <Bike size={22} strokeWidth={2.4} />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
            Go Courier
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/food" className="text-sm font-semibold text-muted hover:text-foreground premium-transition">
            Food
          </Link>
          <Link to="/extras" className="text-sm font-semibold text-muted hover:text-foreground premium-transition">
            Extras
          </Link>
          <a href="#reviews" className="text-sm font-semibold text-muted hover:text-foreground premium-transition">
            Reviews
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <Link
              to="/profile"
              className={cn(
                'rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground',
                'hover:border-primary/40 premium-transition'
              )}
            >
              {userName.split(' ')[0] || 'Profile'}
            </Link>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="rounded-full px-3 py-2 text-sm font-semibold text-foreground hover:text-primary premium-transition sm:px-4"
              >
                Log in
              </Link>
              <Link
                to="/auth/signup"
                className="rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-cta hover:brightness-105 premium-transition"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
