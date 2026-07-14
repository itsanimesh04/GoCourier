import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell, Bike, PrimaryButton, ScreenHeader, User, Phone, MapPin } from '../components/ui';
import { useAppState } from '../state/AppState';

export function SignupScreen() {
  const navigate = useNavigate();
  const { userName, setUserName, phone, setPhone, requestOtp, campuses, selectedCampus, selectCampus } = useAppState();
  const [nameInput, setNameInput] = useState(userName || 'Animesh Sharma');
  const [phoneInput, setPhoneInput] = useState(phone || '9876543210');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanName = nameInput.trim();
    if (!cleanName) {
      setError('Please enter your full name');
      return;
    }
    const cleanPhone = phoneInput.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      setUserName(cleanName);
      setPhone(cleanPhone);
      await requestOtp();
      navigate('/auth/otp?mode=signup');
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-md mx-auto w-full flex flex-col flex-1 justify-between py-6">
        <div>
          <ScreenHeader title="Create Account" />
          <div className="mt-4">
            <div className="flex items-center gap-2 text-brand">
              <Bike size={24} />
              <span className="font-display text-sm font-bold tracking-wider uppercase">Go Courier Service</span>
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold text-text">Welcome aboard! 👋</h1>
            <p className="mt-1 text-sm text-muted">Enter your details to get started with zero-fee campus delivery.</p>
          </div>

          <form onSubmit={handleSignup} className="mt-8 space-y-5">
            {/* Full Name Input */}
            <div>
              <label className="block font-display text-xs font-bold uppercase tracking-wider text-muted">
                Full Name
              </label>
              <div className="mt-1.5 flex items-center gap-3 rounded-input border border-border bg-card px-4 py-3.5 focus-within:border-urgent">
                <User size={18} className="text-muted" />
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Animesh Sharma"
                  className="w-full bg-transparent font-display text-base font-medium text-text placeholder:text-muted/60 focus:outline-none focus:ring-0 focus-visible:outline-none"
                />
              </div>
            </div>

            {/* Mobile Number Input */}
            <div>
              <label className="block font-display text-xs font-bold uppercase tracking-wider text-muted">
                Contact Number
              </label>
              <div className="mt-1.5 flex items-center gap-3 rounded-input border border-border bg-card px-4 py-3.5 focus-within:border-urgent">
                <Phone size={18} className="text-muted" />
                <span className="font-display text-base font-bold text-muted">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="98765 43210"
                  className="w-full bg-transparent font-display text-base font-medium text-text placeholder:text-muted/60 focus:outline-none focus:ring-0 focus-visible:outline-none"
                />
              </div>
            </div>

            {/* Selected Campus Display */}
            <div>
              <label className="block font-display text-xs font-bold uppercase tracking-wider text-muted">
                Selected University
              </label>
              <div className="mt-1.5 flex items-center justify-between rounded-input border border-border bg-card px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-brand" />
                  <div>
                    <span className="block font-display text-sm font-bold text-text">{selectedCampus.name}</span>
                    <span className="text-xs text-muted">{selectedCampus.city}, {selectedCampus.state}</span>
                  </div>
                </div>
                <select
                  value={selectedCampus.id}
                  onChange={(e) => selectCampus(e.target.value)}
                  aria-label="Select Campus"
                  className="bg-surface2 rounded px-2 py-1 text-xs font-bold text-brand focus:outline-none"
                >
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id} className="bg-card text-text">
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error ? (
              <div className="rounded-button border border-danger/40 bg-danger/10 p-3 text-center text-xs font-bold text-danger">
                {error}
              </div>
            ) : null}

            <div className="pt-3">
              <PrimaryButton type="submit" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Continue & Send OTP →'}
              </PrimaryButton>
            </div>
          </form>
        </div>

        {/* Switch to Login */}
        <div className="text-center pt-6">
          <p className="text-xs text-muted">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/auth/login')}
              className="font-bold text-brand hover:underline"
            >
              Log In here
            </button>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
