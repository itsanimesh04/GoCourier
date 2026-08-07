import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppShell, Bike, Lock, MapPin, PrimaryButton, ScreenHeader, User } from '../../components/ui';
import { useAppState } from '../../state/AppState';
import { ApiClientError } from '../../lib/api';

export function SignupScreen() {
  const navigate = useNavigate();
  const { signup, campuses, selectedCampus, selectCampus } = useAppState();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please enter your full name');
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanEmail && !cleanPhone) {
      setError('Provide an email or a 10-digit phone number');
      return;
    }
    if (cleanPhone && cleanPhone.length !== 10) {
      setError('Phone must be a valid 10-digit number');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await signup({
        name: cleanName,
        password,
        email: cleanEmail || undefined,
        phone: cleanPhone || undefined
      });
      await selectCampus(selectedCampus.id);
      navigate('/food');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell className="px-4 sm:px-6" contentClassName="content-rail">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-md flex-col justify-between py-6">
        <div>
          <ScreenHeader title="Create Account" />
          <div className="mt-6">
            <div className="flex items-center gap-2 text-primary">
              <Bike size={24} />
              <span className="font-display text-sm font-bold tracking-wider uppercase">Go Courier</span>
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground">Join campus delivery</h1>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Use email or phone plus a password — no OTP required.
            </p>
          </div>

          <form onSubmit={handleSignup} className="mt-8 space-y-4">
            <div>
              <label className="block font-display text-xs font-bold uppercase tracking-wider text-muted">Full name</label>
              <div className="mt-1.5 flex items-center gap-3 rounded-input border border-border bg-card px-4 py-3.5 focus-within:border-primary">
                <User size={18} className="text-muted" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-transparent text-base text-foreground placeholder:text-muted/60 focus:outline-none"
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <label className="block font-display text-xs font-bold uppercase tracking-wider text-muted">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="mt-1.5 w-full rounded-input border border-border bg-card px-4 py-3.5 text-base text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block font-display text-xs font-bold uppercase tracking-wider text-muted">
                Phone <span className="normal-case font-medium text-muted/70">(optional if email set)</span>
              </label>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                className="mt-1.5 w-full rounded-input border border-border bg-card px-4 py-3.5 text-base text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none"
                autoComplete="tel"
              />
            </div>

            <div>
              <label className="block font-display text-xs font-bold uppercase tracking-wider text-muted">Password</label>
              <div className="mt-1.5 flex items-center gap-3 rounded-input border border-border bg-card px-4 py-3.5 focus-within:border-primary">
                <Lock size={18} className="text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-transparent text-base focus:outline-none"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div>
              <label className="block font-display text-xs font-bold uppercase tracking-wider text-muted">
                Confirm password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
                className="mt-1.5 w-full rounded-input border border-border bg-card px-4 py-3.5 text-base focus:border-primary focus:outline-none"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block font-display text-xs font-bold uppercase tracking-wider text-muted">Campus</label>
              <div className="mt-1.5 flex items-center gap-3 rounded-input border border-border bg-card px-4 py-3.5">
                <MapPin size={18} className="text-primary shrink-0" />
                <select
                  value={selectedCampus.id}
                  onChange={(e) => selectCampus(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-foreground focus:outline-none"
                  aria-label="Select campus"
                >
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-danger/30 bg-danger/10 p-3.5 text-center text-sm font-semibold text-danger">
                {error}
              </div>
            ) : null}

            <PrimaryButton type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </PrimaryButton>
          </form>
        </div>

        <p className="pt-8 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
