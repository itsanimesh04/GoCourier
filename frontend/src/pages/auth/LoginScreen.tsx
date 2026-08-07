import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppShell, Bike, Lock, PrimaryButton, ScreenHeader } from '../../components/ui';
import { useAppState } from '../../state/AppState';
import { ApiClientError } from '../../lib/api';

export function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useAppState();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const id = identifier.trim();
    if (!id) {
      setError('Enter your email or phone number');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await login(id, password);
      navigate('/food');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell className="px-4 sm:px-6" contentClassName="content-rail">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-md flex-col justify-between py-6">
        <div>
          <ScreenHeader title="Log In" />
          <div className="mt-6">
            <div className="flex items-center gap-2 text-primary">
              <Bike size={24} />
              <span className="font-display text-sm font-bold tracking-wider uppercase">Go Courier</span>
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Sign in with your email or phone and password.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="block font-display text-xs font-bold uppercase tracking-wider text-muted">
                Email or phone
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@college.edu or 9876543210"
                className="mt-1.5 w-full rounded-input border border-border bg-card px-4 py-3.5 font-body text-base text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block font-display text-xs font-bold uppercase tracking-wider text-muted">
                Password
              </label>
              <div className="mt-1.5 flex items-center gap-3 rounded-input border border-border bg-card px-4 py-3.5 focus-within:border-primary">
                <Lock size={18} className="text-muted shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-transparent font-body text-base text-foreground placeholder:text-muted/60 focus:outline-none"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-danger/30 bg-danger/10 p-3.5 text-center text-sm font-semibold text-danger">
                {error}
              </div>
            ) : null}

            <PrimaryButton type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </PrimaryButton>
          </form>
        </div>

        <p className="pt-8 text-center text-sm text-muted">
          New to Go Courier?{' '}
          <Link to="/auth/signup" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
