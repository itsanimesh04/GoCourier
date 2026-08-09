import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { banners } from '../data/homepageData';
import { useAppDispatch } from '../store';
import { setCatalogMode } from '../store/slices/uiSlice';

const INTERVAL_MS = 4500;

const HeroBannerRotator = () => {
  const [index, setIndex] = useState(0);
  const dispatch = useAppDispatch();
  const banner = banners[index % banners.length];

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  const onCta = () => {
    if (banner.ctaHref.startsWith('/extras')) {
      dispatch(setCatalogMode('extras'));
    } else if (banner.ctaHref.startsWith('/food')) {
      dispatch(setCatalogMode('food'));
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
      <div
        key={banner.id}
        className="animate-banner-fade relative flex min-h-64 flex-col justify-end p-4 sm:min-h-80 sm:p-5"
      >
        <img
          src={banner.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/55 to-bg/10" />
        <div className="relative z-10 max-w-md">
          <p className="font-display text-base font-semibold leading-tight text-fg sm:text-lg">
            {banner.title}
          </p>
          <p className="mt-1 font-sans text-xs text-muted line-clamp-2 sm:text-sm">
            {banner.subtitle}
          </p>
          <Link
            to={banner.ctaHref}
            onClick={onCta}
            className="mt-3 inline-flex rounded-lg bg-primary px-3 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-wide text-on-primary transition-opacity hover:opacity-90"
          >
            {banner.ctaLabel}
          </Link>
        </div>
      </div>
      <div className="absolute bottom-3 right-3 z-10 flex gap-1.5">
        {banners.map((b, i) => (
          <button
            key={b.id}
            type="button"
            aria-label={`Show banner ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index % banners.length
                ? 'w-5 bg-primary'
                : 'w-1.5 bg-fg/40 hover:bg-fg/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBannerRotator;
