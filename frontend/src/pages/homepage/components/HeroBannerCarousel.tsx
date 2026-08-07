import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { banners } from '../../../data/homepageData';
import { cn } from '../../../lib/utils';

export function HeroBannerCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = banners[index];

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <section
      className="relative w-full overflow-hidden bg-foreground"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Promotional banners"
    >
      <div className="relative min-h-[320px] sm:min-h-[420px] lg:min-h-[480px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
          >
            <img
              src={current.imageUrl}
              alt=""
              className="h-full w-full object-cover opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/75 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="content-rail relative z-10 flex min-h-[320px] flex-col justify-end pb-12 pt-20 sm:min-h-[420px] lg:min-h-[480px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id + '-copy'}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="max-w-xl"
            >
              <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                Go Courier
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                {current.title}
              </h1>
              <p className="mt-4 max-w-md text-base text-white/75 sm:text-lg">{current.subtitle}</p>
              <Link
                to={current.ctaHref}
                className="mt-7 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-cta hover:brightness-105 premium-transition"
              >
                {current.ctaLabel}
              </Link>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center gap-2" role="tablist" aria-label="Banner position">
            {banners.map((banner, i) => (
              <button
                key={banner.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Banner ${i + 1} of ${banners.length}`}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-2 rounded-full premium-transition',
                  i === index ? 'w-8 bg-secondary' : 'w-2 bg-white/35 hover:bg-white/55'
                )}
              />
            ))}
            <span className="ml-3 font-display text-xs font-medium text-white/50">
              {index + 1} / {banners.length}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
