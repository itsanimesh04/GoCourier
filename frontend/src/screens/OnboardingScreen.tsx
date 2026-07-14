import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell, Bike, Clock, ShieldCheck, Utensils, PrimaryButton, SecondaryButton } from '../components/ui';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ReactNode;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    badge: 'BATCH DELIVERY',
    title: 'Zero Delivery Fees on Campus Batches',
    subtitle: 'Order during our 9:00 PM or 9:45 PM campus runs. We group hostel deliveries so you never pay delivery charges.',
    icon: <Clock size={48} className="text-brand" />
  },
  {
    id: 2,
    badge: 'STUDENT EXCLUSIVE',
    title: 'Curated Campus Favorites',
    subtitle: 'From late night Maggi & Biryani to fresh pizza and shakes, delivered right to your hostel gate.',
    icon: <Utensils size={48} className="text-urgent" />
  },
  {
    id: 3,
    badge: 'FAST & VERIFIED',
    title: 'Student Rider Network',
    subtitle: 'Fast campus delivery by verified student partners who know every hostel block and gate.',
    icon: <ShieldCheck size={48} className="text-success" />
  }
];

export function OnboardingScreen() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = SLIDES[currentSlide];

  return (
    <AppShell>
      <div className="max-w-md mx-auto w-full flex flex-col flex-1 justify-between py-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-brand/20 text-brand">
              <Bike size={18} />
            </div>
            <span className="font-display text-base font-bold tracking-tight text-text">Go Courier</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            className="rounded-full bg-surface2 px-3.5 py-1.5 font-display text-xs font-bold text-muted hover:text-text"
          >
            Skip
          </button>
        </div>

        {/* Main Slide Card */}
        <div className="my-auto py-8">
          <div className="card-gradient relative mx-auto flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border border-border p-6 text-center shadow-cta">
            <div className="mb-6 grid h-24 w-24 place-items-center rounded-full border border-border bg-surface2 shadow-inner">
              {slide.icon}
            </div>

            <span className="mb-3 rounded-full bg-brand/15 px-3 py-1 font-display text-[10px] font-bold tracking-widest text-brand uppercase">
              {slide.badge}
            </span>

            <h1 className="font-display text-2xl font-bold leading-tight text-text">{slide.title}</h1>
            <p className="mt-3 text-sm leading-6 text-muted">{slide.subtitle}</p>
          </div>
        </div>

        {/* Bottom Actions & Pagination Dots */}
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-2">
            {SLIDES.map((s, idx) => (
              <span
                key={s.id}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'w-8 bg-brand' : 'w-2 bg-surface2'
                }`}
              />
            ))}
          </div>

          <div className="space-y-3">
            <PrimaryButton
              onClick={() => {
                if (currentSlide < SLIDES.length - 1) {
                  setCurrentSlide((prev) => prev + 1);
                } else {
                  navigate('/auth/signup');
                }
              }}
            >
              {currentSlide === SLIDES.length - 1 ? 'Get Started →' : 'Next →'}
            </PrimaryButton>

            <SecondaryButton onClick={() => navigate('/auth/login')}>
              I already have an account
            </SecondaryButton>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
