import { menuItems } from './mockData';

const food = (name: string) => `/food/${name}.jpg`;

export const foodCategories = [
  { id: 'south-indian', name: 'South Indian', imageUrl: "https://www.cubesnjuliennes.com/wp-content/uploads/2020/07/Chicken-Biryani-Recipe.jpg" },
  { id: 'chinese', name: 'Chinese', imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpbmVzZSUyMGZvb2R8ZW58MHx8MHx8fDA%3D" },
  { id: 'biryani', name: 'Biryani', imageUrl: "https://www.kannammacooks.com/wp-content/uploads/buhari-hotel-chennai-chicken-biryani-recipe-1-4.jpg" },
  { id: 'pizza', name: 'Pizza', imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIeb0omgCZtSjJGhTCLaR6sCL9jjh9DmLCMg&s" },
  { id: 'burgers', name: 'Burgers', imageUrl: "https://www.foodandwine.com/thmb/DI29Houjc_ccAtFKly0BbVsusHc=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/crispy-comte-cheesburgers-FT-RECIPE0921-6166c6552b7148e8a8561f7765ddf20b.jpg" },
  { id: 'desserts', name: 'Desserts', imageUrl: "https://t3.ftcdn.net/jpg/03/01/97/86/360_F_301978652_O0aPwap1JaEVaAhj3mIlbqNnJGmRyCzC.jpg" },
  { id: 'rolls', name: 'Rolls', imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeHnBkUd4ua0OHfYsLtU8Cc-bYFi2TwT1frQ&s" },
  { id: 'beverages', name: 'Drinks', imageUrl: "https://media.istockphoto.com/id/1253521359/photo/summer-refreshing-drinks-with-ice.jpg?s=612x612&w=0&k=20&c=Od5r0o4xp4qlTUK9z0Oaa_OmGIMwfcRKrqWQudKOUJE=" }
];

const catImage = (id: string) =>
  foodCategories.find((c) => c.id === id)?.imageUrl ?? food('chicken-biryani');

export const banners = [
  {
    id: 'banner-1',
    title: 'Campus dinners, delivered on time',
    subtitle: 'Order before cutoff and get batch delivery at your hostel gate.',
    imageUrl: catImage('biryani'),
    ctaLabel: 'Order food',
    ctaHref: '/food'
  },
  {
    id: 'banner-2',
    title: 'Late-night cravings sorted',
    subtitle: 'Pizzas, shakes, and rolls from campus favourites — one tap away.',
    imageUrl: catImage('pizza'),
    ctaLabel: 'Browse menu',
    ctaHref: '/food'
  },
  {
    id: 'banner-3',
    title: 'Need stationery or snacks?',
    subtitle: 'Extras mode covers parcels, custom requests, and campus stores.',
    imageUrl: catImage('rolls'),
    ctaLabel: 'Open Extras',
    ctaHref: '/extras'
  },
  {
    id: 'banner-4',
    title: 'Student riders. Fair fees.',
    subtitle: 'Built for hostels — transparent pricing and reliable ETAs.',
    imageUrl: catImage('beverages'),
    ctaLabel: 'Get started',
    ctaHref: '/signup'
  }
];

function dishesByCategory(category: string) {
  return menuItems.filter((item) => item.category === category);
}

export const cuisineSectionsTop= [
  { id: 'sec-south', title: 'South Indian favourites', dishes: dishesByCategory('South Indian') },
  { id: 'sec-chinese', title: 'Chinese picks', dishes: dishesByCategory('Chinese') },
  { id: 'sec-biryani', title: 'Biryani & rice bowls', dishes: dishesByCategory('Biryani') }
];

export const cuisineSectionsBottom = [
  { id: 'sec-italian', title: 'Pizza & Italian', dishes: dishesByCategory('Italian') },
  { id: 'sec-fast', title: 'Burgers & wraps', dishes: dishesByCategory('Fast Food') },
  { id: 'sec-rolls', title: 'Rolls & wraps', dishes: dishesByCategory('Rolls') },
  { id: 'sec-desserts', title: 'Sweet treats', dishes: dishesByCategory('Desserts') },
  { id: 'sec-drinks', title: 'Drinks & coolers', dishes: dishesByCategory('Beverages') }
];

export const foodCarouselImages = foodCategories.map((c) => c.imageUrl);

export const reviews = [
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
