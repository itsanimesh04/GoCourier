import { LuBike } from 'react-icons/lu';
import { useAppSelector } from '../../../store';
import { selectAppConfig } from '../../../store/slices/catalogSlice';
import appDownloadImage from '../../../assets/images/phone-mockup.png';

const AppDownloadSection = () => {
  const config = useAppSelector(selectAppConfig);
  const appDownload = {
    title: config?.appDownloadTitle || 'Get the GoCourier app',
    subtitle: config?.appDownloadSubtitle || '',
    playStoreHref: config?.playStoreHref || '#',
    appStoreHref: config?.appStoreHref || '#',
  };
  return (
    <section className="relative w-full overflow-hidden bg-primary py-12 text-on-primary">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-on-primary/10 via-transparent to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-2 rounded-xl border border-on-primary/30 bg-black/20 px-3.5 py-1.5 font-display text-sm font-semibold text-on-primary backdrop-blur-sm">
              <LuBike size={16} />
              <span>Mobile App</span>
            </div>

            <h2 className="mt-6 font-display text-lg font-bold leading-tight text-on-primary sm:text-xl">
              {appDownload.title}
            </h2>

            <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-on-primary/90">
              {appDownload.subtitle}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={appDownload.playStoreHref}
                className="inline-flex items-center justify-center rounded-xl bg-bg px-6 py-2.5 font-display text-sm font-semibold text-fg transition-all hover:bg-on-primary hover:text-bg"
              >
                Get it on Google Play
              </a>
              <a
                href={appDownload.appStoreHref}
                className="inline-flex items-center justify-center rounded-xl border-2 border-on-primary bg-on-primary px-6 py-2.5 font-display text-sm font-semibold text-primary transition-all hover:bg-transparent hover:text-on-primary"
              >
                Download on App Store
              </a>
            </div>

            <div className="mt-10 grid w-full max-w-lg grid-cols-2 gap-4 border-t border-on-primary/20 pt-6 font-display text-sm font-semibold">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-on-primary" />
                <span>Order Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-on-primary" />
                <span>Exclusive App Deals</span>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <img src={appDownloadImage} alt="App Download" className="h-100 w-full object-cover contrast-150" />
          </div>

        </div>
      </div>
    </section>
  );
};

export default AppDownloadSection;
