import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppShell, Bike, Clock, ShieldCheck, Utensils, PrimaryButton, SecondaryButton } from '../../components/ui';

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
    icon: <Clock size={48} className="text-primary" />
  },
  {
    id: 2,
    badge: 'STUDENT EXCLUSIVE',
    title: 'Curated Campus Favorites',
    subtitle: 'From late night Maggi & Biryani to fresh pizza and shakes, delivered right to your hostel gate.',
    icon: <Utensils size={48} className="text-secondary" />
  },
  {
    id: 3,
    badge: 'FAST & VERIFIED',
    title: 'Student Rider Network',
    subtitle: 'Fast campus delivery by verified student partners who know every hostel block and gate.',
    icon: <ShieldCheck size={48} className="text-success" />
  }
];

const slideVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20
    }
  },
  exit: {
    opacity: 0,
    x: -50,
    transition: {
      duration: 0.2
    }
  }
};

export function OnboardingScreen() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = SLIDES[currentSlide];

  return (
    <AppShell className="px-4" contentClassName="content-rail">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-lg flex-col justify-between py-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary">
              <Bike size={18} />
            </div>
            <span className="font-display text-base font-bold tracking-tight text-foreground">Go Courier</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/food')}
            className="rounded-full bg-muted/10 px-3.5 py-1.5 font-display text-xs font-bold text-muted hover:text-foreground premium-transition"
          >
            Skip
          </button>
        </div>

        {/* Main Slide Card */}
        <div className="my-auto py-8">
          <motion.div
            key={slide.id}
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="card-gradient relative mx-auto flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border border-border p-6 text-center shadow-elevated"
          >
            <div className="mb-6 grid h-24 w-24 place-items-center rounded-full border border-border bg-muted/10 shadow-inner">
              {slide.icon}
            </div>

            <span className="mb-3 rounded-full bg-primary/10 px-3 py-1 font-display text-[10px] font-bold tracking-widest text-primary uppercase">
              {slide.badge}
            </span>

            <h1 className="font-display text-2xl font-bold leading-tight text-foreground">{slide.title}</h1>
            <p className="mt-3 text-sm leading-6 text-muted">{slide.subtitle}</p>
          </motion.div>
        </div>

        {/* Bottom Actions & Pagination Dots */}
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-2">
            {SLIDES.map((s, idx) => (
              <span
                key={s.id}
                className={`h-2 rounded-full premium-transition ${
                  idx === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-muted/20'
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
