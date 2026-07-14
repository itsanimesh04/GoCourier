import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell, Bike, Phone, PrimaryButton, ScreenHeader } from '../components/ui';
import { useAppState } from '../state/AppState';

export function LoginScreen() {
  const navigate = useNavigate();
  const { phone, setPhone, requestOtp } = useAppState();
  const [phoneInput, setPhoneInput] = useState(phone || '9876543210');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phoneInput.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      setPhone(cleanPhone);
      await requestOtp();
      navigate('/auth/otp?mode=login');
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
          <ScreenHeader title="Log In" />
          <div className="mt-4">
            <div className="flex items-center gap-2 text-brand">
              <Bike size={24} />
              <span className="font-display text-sm font-bold tracking-wider uppercase">Go Courier Service</span>
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold text-text">Welcome back! ⚡</h1>
            <p className="mt-1 text-sm text-muted">Enter your registered mobile number to sign in to your campus account.</p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            {/* Mobile Number Input */}
            <div>
              <label className="block font-display text-xs font-bold uppercase tracking-wider text-muted">
                Contact Number
              </label>
              <div className="mt-1.5 flex items-center gap-3 rounded-input border border-border bg-card px-4 py-3.5 focus-within:border-brand">
                <div className="flex items-center gap-1.5 border-r border-border pr-3 font-display text-base font-bold text-text">
                  <Phone size={16} className="text-brand" />
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 43210"
                  className="w-full bg-transparent font-display text-base font-bold tracking-wide text-text placeholder:text-muted/60 focus:outline-none"
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-button border border-danger/40 bg-danger/10 p-3 text-center text-xs font-bold text-danger">
                {error}
              </div>
            ) : null}

            <div className="pt-3">
              <PrimaryButton type="submit" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send Verification OTP →'}
              </PrimaryButton>
            </div>
          </form>
        </div>

        {/* Switch to Signup */}
        <div className="text-center pt-6">
          <p className="text-xs text-muted">
            New to Go Courier?{' '}
            <button
              type="button"
              onClick={() => navigate('/auth/signup')}
              className="font-bold text-brand hover:underline"
            >
              Sign Up here
            </button>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
