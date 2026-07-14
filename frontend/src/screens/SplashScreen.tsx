import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleHelp, Clock, Logo, PrimaryButton, ShoppingCart, Utensils } from '../components/ui';
import { useAppState } from '../state/AppState';

function DoodleBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden text-muted/10">
      <Utensils className="absolute left-7 top-16 rotate-[-18deg]" size={56} />
      <ShoppingCart className="absolute right-8 top-20 rotate-[12deg]" size={56} />
      <CircleHelp className="absolute bottom-16 left-10 rotate-[16deg]" size={70} />
      <Clock className="absolute bottom-16 right-12 rotate-[-14deg]" size={58} />
    </div>
  );
}

export function SplashScreen() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppState();

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (isAuthenticated) {
        navigate('/home');
      } else {
        navigate('/onboarding');
      }
    }, 2500);
    return () => window.clearTimeout(id);
  }, [isAuthenticated, navigate]);

  return (
    <div className="relative flex min-h-[calc(100vh-40px)] flex-col justify-between overflow-hidden py-8">
      <DoodleBackground />
      <div className="my-auto relative z-10 text-center">
        <div className="animate-scooter-in mb-8 flex justify-center text-brand">
          <Logo />
        </div>
        <h1 className="font-display text-[48px] font-bold leading-[0.95] text-text">
          Go Courier
          <span className="block text-urgent">Service</span>
        </h1>
        <p className="mt-5 text-base font-medium text-muted">Beat the clock. Eat on time.</p>
      </div>
      <div className="relative z-10 mt-auto pt-6">
        <PrimaryButton onClick={() => navigate(isAuthenticated ? '/home' : '/onboarding')}>
          Get Started
        </PrimaryButton>
      </div>
    </div>
  );
}
