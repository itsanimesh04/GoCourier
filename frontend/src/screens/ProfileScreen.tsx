import { useNavigate } from 'react-router-dom';
import {
  AppShell,
  BottomNav,
  MapPin,
  ScreenHeader
} from '../components/ui';
import { useAppState } from '../state/AppState';

export function ProfileScreen() {
  const navigate = useNavigate();
  const { phone, userName, selectedCampus, cartItems, logout } = useAppState();

  const initials = userName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <AppShell bottomNav={<BottomNav cartCount={cartItems.length} />}>
      <div className="max-w-2xl mx-auto w-full">
        <ScreenHeader title="Profile & Settings" />
        <div className="flex items-center gap-4 rounded-card border border-border bg-card p-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-brand font-display text-xl font-bold text-text">
            {initials || 'AS'}
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-text">{userName || 'Student Account'}</h1>
            <p className="text-sm text-muted">+91 {phone || '9876543210'}</p>
          </div>
        </div>

        <section className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => navigate('/campus')}
            className="card-gradient flex w-full items-center justify-between rounded-card border border-border p-4 text-left transition hover:border-border/80"
          >
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-brand" />
              <div>
                <h2 className="font-display text-sm font-bold text-text">Active Campus</h2>
                <p className="text-xs text-muted">{selectedCampus?.name || 'Manipal University'}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-brand">Change</span>
          </button>
        </section>

        <div className="mt-8">
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/onboarding');
            }}
            className="w-full rounded-button border border-danger/40 bg-danger/10 py-3 font-display text-sm font-bold text-danger transition active:scale-95"
          >
            Sign Out / Switch User
          </button>
        </div>
      </div>
    </AppShell>
  );
}
