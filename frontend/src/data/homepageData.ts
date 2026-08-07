import type { Banner, CuisineSection, FoodCategory, Review } from '../lib/types';
import { menuItems } from './mockData';

const food = (name: string) => `/food/${name}.jpg`;

export const banners: Banner[] = [
  {
    id: 'banner-1',
    title: 'Campus dinners, delivered on time',
    subtitle: 'Order before cutoff and get batch delivery at your hostel gate.',
    imageUrl: food('chicken-biryani'),
    ctaLabel: 'Order food',
    ctaHref: '/food'
  },
  {
    id: 'banner-2',
    title: 'Late-night cravings sorted',
    subtitle: 'Pizzas, shakes, and rolls from campus favourites — one tap away.',
    imageUrl: food('paneer-pizza'),
    ctaLabel: 'Browse menu',
    ctaHref: '/food'
  },
  {
    id: 'banner-3',
    title: 'Need stationery or snacks?',
    subtitle: 'Extras mode covers parcels, custom requests, and campus stores.',
    imageUrl: food('garlic-bread'),
    ctaLabel: 'Open Extras',
    ctaHref: '/extras'
  },
  {
    id: 'banner-4',
    title: 'Student riders. Fair fees.',
    subtitle: 'Built for hostels — transparent pricing and reliable ETAs.',
    imageUrl: food('chocolate-shake'),
    ctaLabel: 'Get started',
    ctaHref: '/auth/signup'
  }
];

export const foodCategories: FoodCategory[] = [
  { id: 'south-indian', name: 'South Indian', imageUrl: food('paneer-pizza') },
  { id: 'chinese', name: 'Chinese', imageUrl: food('chicken-biryani') },
  { id: 'biryani', name: 'Biryani', imageUrl: food('chicken-biryani') },
  { id: 'pizza', name: 'Pizza', imageUrl: food('paneer-pizza') },
  { id: 'burgers', name: 'Burgers', imageUrl: food('garlic-bread') },
  { id: 'desserts', name: 'Desserts', imageUrl: food('chocolate-shake') },
  { id: 'rolls', name: 'Rolls', imageUrl: food('garlic-bread') },
  { id: 'beverages', name: 'Drinks', imageUrl: food('chocolate-shake') }
];

function dishesByCategory(category: string) {
  return menuItems.filter((item) => item.category === category);
}

export const cuisineSectionsTop: CuisineSection[] = [
  { id: 'sec-south', title: 'South Indian favourites', dishes: dishesByCategory('South Indian') },
  { id: 'sec-chinese', title: 'Chinese picks', dishes: dishesByCategory('Chinese') },
  { id: 'sec-biryani', title: 'Biryani & rice bowls', dishes: dishesByCategory('Biryani') }
];

export const cuisineSectionsBottom: CuisineSection[] = [
  { id: 'sec-italian', title: 'Pizza & Italian', dishes: dishesByCategory('Italian') },
  { id: 'sec-fast', title: 'Burgers & wraps', dishes: dishesByCategory('Fast Food') },
  { id: 'sec-desserts', title: 'Sweet treats', dishes: dishesByCategory('Desserts') }
];

export const foodCarouselImages = [
  food('chicken-biryani'),
  food('paneer-pizza'),
  food('garlic-bread'),
  food('chocolate-shake'),
  food('chicken-biryani'),
  food('paneer-pizza'),
  food('garlic-bread'),
  food('chocolate-shake')
];

export const reviews: Review[] = [
  {
    id: 'rev-1',
    name: 'Ananya S.',
    campus: 'Manipal University',
    rating: 5,
    comment: 'Cutoff reminders are a lifesaver. Food always shows up warm at the hostel gate.',
    avatarColor: '#FF2E63'
  },
  {
    id: 'rev-2',
    name: 'Rohit M.',
    campus: 'Amity University',
    rating: 5,
    comment: 'Clean UI, fair fees, and the batch delivery actually works. Best campus food app.',
    avatarColor: '#0A0A0B'
  },
  {
    id: 'rev-3',
    name: 'Priya K.',
    campus: 'Nims University',
    rating: 4,
    comment: 'Love the restaurant variety. Extras mode helped me get notes printed same evening.',
    avatarColor: '#10B981'
  },
  {
    id: 'rev-4',
    name: 'Devansh P.',
    campus: 'Manipal University',
    rating: 5,
    comment: 'Student riders who know the campus — ETAs are honest and tracking is clear.',
    avatarColor: '#D4FF4F'
  }
];

export const appDownload = {
  title: 'Get Go Courier on your phone',
  subtitle: 'Faster ordering, push alerts for cutoff, and live tracking — built for hostel life.',
  playStoreHref: '#',
  appStoreHref: '#'
};
