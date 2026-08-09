import InfiniteTextBanner from '../components/InfiniteTextBanner';
import { useAppSelector } from '../store';
import { selectCatalogMode } from '../store/slices/uiSlice';
import AppDownloadSection from './components/Home/AppDownloadSection';
import ExtrasSections from './components/Home/ExtrasSections';
import FAQSection from './components/Home/FAQSection';
import Hero from './components/Home/Hero';
import HomeFoodGrid from './components/Home/HomeFoodGrid';

const foodBannerItems = [
  'Order before cutoff — hostel drop tonight',
  'Campus dinners, delivered on time',
  'Student riders. Fair fees.',
];

const extrasBannerItems = [
  'Stationery, snacks & essentials',
  'Extras ride with your food batch',
  'Campus stores, one checkout',
];

const Home = () => {
  const catalogMode = useAppSelector(selectCatalogMode);
  const isExtras = catalogMode === 'extras';

  return (
    <>
      <Hero />
      <InfiniteTextBanner
        items={isExtras ? extrasBannerItems : foodBannerItems}
        bgColor="bg-surface"
        textColor="text-fg"
      />

      {isExtras ? <ExtrasSections /> : <HomeFoodGrid />}

      <div className="my-8">
        <InfiniteTextBanner
          items={isExtras ? extrasBannerItems : foodBannerItems}
          bgColor="bg-primary"
          textColor="text-on-primary"
        />
        <AppDownloadSection />
      </div>

      <FAQSection />
    </>
  );
};

export default Home;
