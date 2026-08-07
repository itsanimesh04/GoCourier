import { useNavigate } from 'react-router-dom';
import { AppShell, BottomNav, MapPin, ScreenHeader } from '../../components/ui';
import { useAppState } from '../../state/AppState';

export function ProfileScreen() {
  const navigate = useNavigate();
  const { user, phone, userName, selectedCampus, cartItems, logout } = useAppState();

  const initials = userName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const contact = user?.email || (phone ? `+91 ${phone}` : user?.phone ? `+91 ${user.phone}` : '—');

  return (
    <AppShell
      bottomNav={<BottomNav cartCount={cartItems.length} />}
      className="px-0"
      contentClassName="content-rail py-4 sm:py-6"
    >
      <div className="mx-auto w-full max-w-2xl">
        <ScreenHeader title="Profile & Settings" />
        <div className="mt-4 flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-subtle">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-primary font-display text-xl font-bold text-primary-foreground">
            {initials || 'GC'}
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">{userName || 'Student account'}</h1>
            <p className="text-sm text-muted">{contact}</p>
          </div>
        </div>

        <section className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => navigate('/campus')}
            className="flex w-full items-center justify-between rounded-2xl border border-border bg-card p-4 text-left shadow-subtle hover:border-primary/30 premium-transition"
          >
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-primary" />
              <div>
                <h2 className="font-display text-sm font-bold text-foreground">Active campus</h2>
                <p className="text-xs text-muted">{selectedCampus?.name || 'Select campus'}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-primary">Change</span>
          </button>
        </section>

        <div className="mt-8">
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate('/auth/login');
            }}
            className="w-full rounded-button border border-danger/40 bg-danger/10 py-3.5 font-display text-sm font-bold text-danger premium-transition active:scale-[0.98]"
          >
            Sign out
          </button>
        </div>
      </div>
    </AppShell>
  );
}
