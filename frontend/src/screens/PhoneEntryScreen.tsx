import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, AppShell, Bike, Logo, PrimaryButton } from '../components/ui';
import { useAppState } from '../state/AppState';
import { formatTime } from '../lib/utils';

export function PhoneEntryScreen() {
  const navigate = useNavigate();
  const { phone, setPhone, requestOtp, otpCooldownSeconds } = useAppState();
  const [cooldown, setCooldown] = useState(otpCooldownSeconds);

  useEffect(() => {
    if (cooldown <= 0) {
      return undefined;
    }
    const id = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  async function sendOtp() {
    const result = await requestOtp();
    if (result === 'limited') {
      setCooldown(522);
      return;
    }
    navigate('/auth/otp');
  }

  return (
    <AppShell>
      <div className="flex flex-col max-w-md mx-auto w-full">
        <div className="mb-12">
          <Logo compact />
        </div>
        <div className="mb-10 flex justify-center text-brand/50">
          <Bike size={58} strokeWidth={1.4} />
        </div>
        <h1 className="font-display text-[34px] font-bold leading-tight text-text">What's your number?</h1>
        <p className="mt-3 max-w-[290px] text-base leading-6 text-muted">We'll shoot you a code. No spam, pinky promise.</p>
        <label className="surface-gradient mt-7 flex min-h-[70px] items-center gap-4 rounded-input border border-border px-4">
          <span className="text-xl" aria-hidden>
            IN
          </span>
          <span className="font-display text-lg font-bold text-text">+91</span>
          <span className="h-8 w-px bg-border" />
          <input
            type="tel"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            placeholder="98765 43210"
            aria-label="10-digit mobile phone number"
            className="min-w-0 flex-1 bg-transparent font-display text-xl font-medium tracking-normal text-text outline-none placeholder:text-muted"
          />
        </label>
        {cooldown > 0 ? (
          <div className="mt-4 rounded-card border border-danger/40 bg-danger/10 p-4">
            <div className="flex items-center gap-2 font-display text-base font-bold text-danger">
              <AlertTriangle size={18} />
              Too many codes
            </div>
            <p className="mt-2 text-sm text-muted">
              Try again in <span className="font-display font-bold text-urgent">{formatTime(cooldown)}</span>.
            </p>
            <p className="mt-1 text-xs text-muted">You can request 3 codes every 10 minutes.</p>
          </div>
        ) : null}
        <div className="mt-5">
          <PrimaryButton disabled={cooldown > 0 || phone.length < 10} onClick={sendOtp}>
            Send OTP
          </PrimaryButton>
        </div>
        <p className="mt-auto pb-6 text-center text-xs leading-5 text-muted">
          By continuing, you're cool with our
          <span className="text-brand"> Terms & Privacy</span>
        </p>
      </div>
    </AppShell>
  );
}
