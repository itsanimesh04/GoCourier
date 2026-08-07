import { HomeHeader } from './components/HomeHeader';
import { HeroBannerCarousel } from './components/HeroBannerCarousel';
import { SearchAndCategories } from './components/SearchAndCategories';
import { RestaurantSection } from './components/RestaurantSection';
import { CategoryDishSection } from './components/CategoryDishSection';
import { FoodImageCarousel } from './components/FoodImageCarousel';
import { AppDownloadSection } from './components/AppDownloadSection';
import { ReviewsSection } from './components/ReviewsSection';
import { HomeFooter } from './components/HomeFooter';
import { cuisineSectionsBottom, cuisineSectionsTop } from '../../data/homepageData';

export function HomePage() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <HomeHeader />
      <HeroBannerCarousel />
      <SearchAndCategories />
      <RestaurantSection />
      <div className="w-full bg-background">
        {cuisineSectionsTop.map((section) => (
          <CategoryDishSection key={section.id} section={section} />
        ))}
      </div>
      <FoodImageCarousel />
      <div className="w-full bg-card">
        {cuisineSectionsBottom.map((section) => (
          <CategoryDishSection key={section.id} section={section} />
        ))}
      </div>
      <AppDownloadSection />
      <ReviewsSection />
      <HomeFooter />
    </div>
  );
}
