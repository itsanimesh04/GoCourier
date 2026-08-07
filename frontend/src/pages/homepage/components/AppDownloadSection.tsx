import { Bike } from '../../../components/icons';
import { appDownload } from '../../../data/homepageData';

export function AppDownloadSection() {
  return (
    <section className="w-full bg-primary py-16 sm:py-20">
      <div className="content-rail grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
            <Bike size={14} /> Mobile app
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {appDownload.title}
          </h2>
          <p className="mt-4 max-w-lg text-base text-white/85 sm:text-lg">{appDownload.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={appDownload.playStoreHref}
              className="rounded-xl bg-foreground px-5 py-3 text-sm font-semibold text-white hover:bg-foreground/90 premium-transition"
            >
              Get it on Google Play
            </a>
            <a
              href={appDownload.appStoreHref}
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-foreground hover:bg-white/90 premium-transition"
            >
              Download on the App Store
            </a>
          </div>
        </div>
        <div className="relative mx-auto flex h-64 w-full max-w-sm items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 backdrop-blur-sm sm:h-72">
          <div className="text-center">
            <p className="font-display text-6xl font-bold text-secondary">GC</p>
            <p className="mt-2 text-sm font-medium text-white/80">Coming soon to stores</p>
          </div>
        </div>
      </div>
    </section>
  );
}
