import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, AppShell, PhoneKeypad, PrimaryButton, ScreenHeader } from '../components/ui';
import { useAppState } from '../state/AppState';
import { cn, formatTime } from '../lib/utils';
import { useCountdown } from '../lib/useCountdown';
import { apiEnabled } from '../lib/api';

export function OtpScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSignup = location.search.includes('signup');
  const { phone, userName, verifyOtp, requestOtp } = useAppState();
  const [otp, setOtp] = useState('');
  const [invalid, setInvalid] = useState(false);
  const resendSeconds = useCountdown(invalid ? 0 : 28);

  function pressDigit(digit: string) {
    setInvalid(false);
    setOtp((value) => (value + digit).slice(0, 4));
  }

  async function submit() {
    const ok = await verifyOtp(otp);
    if (!ok) {
      setInvalid(true);
      return;
    }
    navigate('/home');
  }

  return (
    <AppShell>
      <div className="flex flex-col max-w-md mx-auto w-full">
        <ScreenHeader />
        <h1 className="font-display text-[32px] font-bold leading-tight text-text">
          {isSignup ? `Welcome, ${userName.split(' ')[0]}! 🎉` : 'Verify your number'}
        </h1>
        <div className="mt-3 flex items-center justify-between gap-3 text-sm text-muted">
          <span>Code sent to +91 {phone}</span>
          <button
            className="min-h-tap font-bold text-brand"
            type="button"
            onClick={() => navigate(isSignup ? '/auth/signup' : '/auth/login')}
          >
            Edit
          </button>
        </div>
        {!apiEnabled && (
          <div className="mt-4 rounded-button border border-urgent/40 bg-urgent/10 p-3 text-center text-xs font-medium text-urgent">
            Demo Mode: Use verification code <span className="font-display font-bold">1234</span> or <span className="font-display font-bold">4829</span>
          </div>
        )}
        <div className="mt-6 grid grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((index) => {
            const digit = otp[index];
            const focused = index === otp.length && !invalid;
            return (
              <div
                key={index}
                className={cn(
                  'surface-gradient grid h-16 place-items-center rounded-input border font-display text-[32px] font-bold',
                  invalid ? 'border-danger shadow-[0_0_20px_rgba(255,71,71,0.2)]' : focused ? 'border-brand' : 'border-border'
                )}
              >
                {digit ? <span>{digit}</span> : focused ? <span className="animate-cursor h-8 w-0.5 bg-brand" /> : null}
              </div>
            );
          })}
        </div>
        {invalid ? (
          <div className="mt-5 text-center">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-danger">
              <AlertTriangle size={16} /> Wrong code. Try again.
            </p>
            <button
              type="button"
              className="mt-2 block min-h-tap w-full text-sm font-bold text-brand"
              onClick={async () => {
                await requestOtp();
                setOtp('');
                setInvalid(false);
              }}
            >
              Resend code now
            </button>
          </div>
        ) : (
          <p className="mt-7 text-center text-sm text-muted">
            Resend code in <span className="font-display font-bold text-urgent">{formatTime(resendSeconds)}</span>
          </p>
        )}
        <div className="mt-6">
          <PrimaryButton disabled={otp.length < 4 || invalid} onClick={submit}>
            Verify
          </PrimaryButton>
        </div>
        <div className="mt-8 pb-4 pt-8">
          <PhoneKeypad onPress={pressDigit} onBackspace={() => setOtp((value) => value.slice(0, -1))} />
        </div>
      </div>
    </AppShell>
  );
}
