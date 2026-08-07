import { LuBike } from 'react-icons/lu';
import { appDownload } from '../../../data/homepageData';
import appDownloadImage from '../../../assets/images/phone-mockup.png';

const AppDownloadSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-primary py-12 text-white">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-red-500/20 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          
          {/* Left Column: Text & CTA Content */}
          <div className="flex flex-col items-start">
            {/* Tag Badge */}
            <div className="font-bebas inline-flex items-center gap-2 border border-white/30 bg-black/20 px-3.5 py-1.5 text-base text-white backdrop-blur-sm rounded-none">
              <LuBike size={16} />
              <span>Mobile App</span>
            </div>

            {/* Main Title */}
            <h2 className="font-bebas mt-6  text-white text-4xl leading-tight">
              {appDownload.title}
            </h2>

            {/* Subtitle */}
            <p className="mt-4 max-w-xl text-sm text-white/90 leading-relaxed">
              {appDownload.subtitle}
            </p>

            {/* Download Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={appDownload.playStoreHref}
                className="font-bebas inline-flex items-center justify-center bg-black px-6 py-2.5 text-lg text-white hover:bg-white hover:text-black transition-all rounded-none"
              >
                Get it on Google Play
              </a>
              <a
                href={appDownload.appStoreHref}
                className="font-bebas inline-flex items-center justify-center border-2 border-white bg-white px-6 py-2.5 text-lg text-black hover:bg-black hover:text-white hover:border-black transition-all rounded-none shadow-lg"
              >
                Download on App Store
              </a>
            </div>

            {/* Feature Highlights List */}
            <div className="font-bebas mt-10 grid grid-cols-2 gap-4 border-t border-white/20 pt-6 w-full max-w-lg text-lg">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white" />
                <span>Order Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white" />
                <span>Exclusive App Deals</span>
              </div>
            </div>
          </div>

          {/* Right Column: Phone Mockup Showcase */}
          <div className="relative flex justify-center lg:justify-end">

                <img src={appDownloadImage} alt="App Download" className='w-full h-100 object-cover contrast-150' />

          </div>

        </div>
      </div>
    </section>
  );
};

export default AppDownloadSection;