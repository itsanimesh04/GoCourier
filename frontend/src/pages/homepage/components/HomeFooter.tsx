import { Link } from 'react-router-dom';
import { Bike } from '../../../components/icons';

export function HomeFooter() {
  return (
    <footer className="w-full border-t border-border bg-foreground text-white">
      <div className="content-rail grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary">
              <Bike size={18} />
            </span>
            <span className="font-display text-lg font-bold">Go Courier</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
            Campus food and extras delivery — cutoff-aware, hostel-ready, built for students.
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-secondary">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>
              <Link to="/food" className="hover:text-white">
                Order food
              </Link>
            </li>
            <li>
              <Link to="/extras" className="hover:text-white">
                Extras
              </Link>
            </li>
            <li>
              <Link to="/auth/signup" className="hover:text-white">
                Sign up
              </Link>
            </li>
            <li>
              <Link to="/auth/login" className="hover:text-white">
                Log in
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-secondary">Campuses</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>Manipal</li>
            <li>Noida · Amity</li>
            <li>Jaipur · Nims</li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-secondary">Support</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>
              <a href="mailto:hello@gocourier.campus" className="hover:text-white">
                hello@gocourier.campus
              </a>
            </li>
            <li>Terms of use</li>
            <li>Privacy</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="content-rail flex flex-col gap-2 py-5 text-xs text-white/45 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Go Courier Service</span>
          <span>Made for hostel nights</span>
        </div>
      </div>
    </footer>
  );
}
