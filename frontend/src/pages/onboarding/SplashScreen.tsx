import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bike, PrimaryButton } from '../../components/ui';

export function SplashScreen() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative flex min-h-screen w-full flex-col overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,46,99,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom_left,_rgba(212,255,79,0.18),_transparent_50%)]" />
      <div className="content-rail relative z-10 flex flex-1 flex-col justify-between py-10 sm:py-16">
        <div className="flex items-center gap-2 text-primary">
          <Bike size={28} strokeWidth={2.4} />
          <span className="font-display text-sm font-bold uppercase tracking-wider">Go Courier</span>
        </div>

        <div className="my-auto max-w-2xl">
          <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-foreground sm:text-7xl">
            Go Courier
            <span className="mt-2 block text-primary">Service</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted">Beat the clock. Eat on time. Campus delivery that respects cutoff.</p>
        </div>

        <motion.div
          className="flex max-w-md flex-col gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PrimaryButton onClick={() => navigate('/onboarding')}>Get started</PrimaryButton>
          <button
            type="button"
            onClick={() => navigate('/food')}
            className="inline-flex min-h-[56px] items-center justify-center rounded-button border border-border bg-card px-6 font-display text-sm font-bold text-foreground shadow-subtle premium-scale"
          >
            Browse restaurants
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
