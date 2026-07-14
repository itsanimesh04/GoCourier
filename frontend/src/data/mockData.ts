import type { Campus, MenuItem, Order, Restaurant } from '../lib/types';

const food = (name: string) => `/food/${name}.jpg`;

export const campuses: Campus[] = [
  { id: 'campus-nims', name: 'Nims University', city: 'Jaipur', state: 'Rajasthan', cutoffTime: '21:30', deliveryTime: '21:45' },
  { id: 'campus-amity', name: 'Amity University', city: 'Noida', state: 'Uttar Pradesh', cutoffTime: '21:30', deliveryTime: '21:45' },
  { id: 'campus-manipal', name: 'Manipal University', city: 'Manipal', state: 'Karnataka', cutoffTime: '21:30', deliveryTime: '21:45' }
];

export const restaurants: Restaurant[] = [
  {
    id: 'rising-cafe',
    campusId: 'campus-nims',
    name: 'The Rising Cafe',
    cuisine: 'North Indian, Chinese',
    rating: 4.2,
    distanceKm: 2.1,
    etaMinutes: 25,
    tags: ['Hot'],
    imageUrl: food('chicken-biryani')
  },
  {
    id: 'lapinoz-pizza',
    campusId: 'campus-nims',
    name: "La Pino'z Pizza",
    cuisine: 'Pizza, Italian, Garlic Bread',
    rating: 4.4,
    distanceKm: 1.5,
    etaMinutes: 20,
    tags: ['Hot'],
    imageUrl: food('paneer-pizza')
  },
  {
    id: 'behrouz-biryani',
    campusId: 'campus-amity',
    name: 'Behrouz Biryani',
    cuisine: 'Biryani, Mughlai, Kebab',
    rating: 4.6,
    distanceKm: 2.8,
    etaMinutes: 25,
    tags: ['Hot'],
    imageUrl: food('chicken-biryani')
  },
  {
    id: 'burger-singh',
    campusId: 'campus-amity',
    name: 'Burger Singh',
    cuisine: 'Burger, Fast Food, Fries',
    rating: 4.3,
    distanceKm: 1.8,
    etaMinutes: 18,
    tags: ['Hot'],
    imageUrl: food('flavor-town')
  },
  {
    id: 'wow-momo',
    campusId: 'campus-manipal',
    name: 'Wow Momo',
    cuisine: 'Momo, Tibetan, Chinese',
    rating: 4.4,
    distanceKm: 1.9,
    etaMinutes: 20,
    tags: [],
    imageUrl: food('chocolate-shake')
  },
  {
    id: 'theobroma',
    campusId: 'campus-manipal',
    name: 'Theobroma',
    cuisine: 'Cakes, Desserts, Bakery',
    rating: 4.7,
    distanceKm: 2.2,
    etaMinutes: 22,
    tags: ['Hot'],
    imageUrl: food('chocolate-shake')
  },
  {
    id: 'faasos-rolls',
    campusId: 'campus-manipal',
    name: 'Faasos Rolls & Wraps',
    cuisine: 'Rolls, Wraps, Fast Food',
    rating: 4.2,
    distanceKm: 2.0,
    etaMinutes: 20,
    tags: [],
    imageUrl: food('garlic-bread')
  },
  {
    id: 'flavor-town',
    campusId: 'campus-manipal',
    name: 'Flavor Town',
    cuisine: 'Snacks, Fast Food',
    rating: 4.5,
    distanceKm: 1.6,
    etaMinutes: 18,
    tags: [],
    imageUrl: food('garlic-bread')
  },
  {
    id: 'guru-kripa',
    campusId: 'campus-manipal',
    name: 'Guru Kripa Hotel',
    cuisine: 'South Indian',
    rating: 4.1,
    distanceKm: 1.8,
    etaMinutes: 22,
    tags: [],
    imageUrl: food('paneer-pizza')
  },
  {
    id: 'spicecraft',
    campusId: 'campus-manipal',
    name: 'SpiceCraft',
    cuisine: 'Biryani, Mughlai',
    rating: 4.3,
    distanceKm: 2.4,
    etaMinutes: 28,
    tags: ['Hot'],
    imageUrl: food('chicken-biryani')
  }
];

export const menuItems: MenuItem[] = [
  {
    id: 'paneer-pizza',
    restaurantId: 'rising-cafe',
    name: 'Paneer Pizza (8 in)',
    description: 'Cheesy paneer, capsicum, onion and classic herbs',
    price: 215,
    isVeg: true,
    imageUrl: food('paneer-pizza'),
    isAvailable: true
  },
  {
    id: 'garlic-bread',
    restaurantId: 'rising-cafe',
    name: 'Garlic Bread',
    description: 'Toasted with garlic butter and herbs',
    price: 79,
    isVeg: true,
    imageUrl: food('garlic-bread'),
    isAvailable: true
  },
  {
    id: 'chicken-biryani',
    restaurantId: 'rising-cafe',
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice with spicy chicken',
    price: 189,
    isVeg: false,
    imageUrl: food('chicken-biryani'),
    isAvailable: true
  },
  {
    id: 'chocolate-shake',
    restaurantId: 'rising-cafe',
    name: 'Chocolate Shake',
    description: 'Rich and creamy chocolate milkshake',
    price: 99,
    isVeg: true,
    imageUrl: food('chocolate-shake'),
    isAvailable: true
  },
  {
    id: 'lapinoz-7cheesy',
    restaurantId: 'lapinoz-pizza',
    name: '7 Cheesy Pizza',
    description: 'Loaded with 7 exotic cheeses and Italian spices',
    price: 289,
    isVeg: true,
    imageUrl: food('paneer-pizza'),
    isAvailable: true
  },
  {
    id: 'lapinoz-garlic',
    restaurantId: 'lapinoz-pizza',
    name: 'Cheesy Garlic Breadsticks',
    description: 'Freshly baked sticks stuffed with melted cheese',
    price: 129,
    isVeg: true,
    imageUrl: food('garlic-bread'),
    isAvailable: true
  },
  {
    id: 'behrouz-dum',
    restaurantId: 'behrouz-biryani',
    name: 'Subz-e-Falafel Dum Biryani',
    description: 'Royal vegetable biryani layered with spices and nuts',
    price: 299,
    isVeg: true,
    imageUrl: food('chicken-biryani'),
    isAvailable: true
  },
  {
    id: 'burger-singh-maharaja',
    restaurantId: 'burger-singh',
    name: 'Maharaja Paneer Burger',
    description: 'Crispy spiced paneer patty with tandoori mayo',
    price: 149,
    isVeg: true,
    imageUrl: food('flavor-town'),
    isAvailable: true
  },
  {
    id: 'wow-momo-panfried',
    restaurantId: 'wow-momo',
    name: 'Pan-Fried Schezwan Momos (6 pcs)',
    description: 'Crispy momos tossed in fiery schezwan sauce',
    price: 139,
    isVeg: true,
    imageUrl: food('chocolate-shake'),
    isAvailable: true
  },
  {
    id: 'theobroma-brownie',
    restaurantId: 'theobroma',
    name: 'Overload Brownie Box',
    description: 'Rich gooey chocolate walnut brownie slice',
    price: 115,
    isVeg: true,
    imageUrl: food('chocolate-shake'),
    isAvailable: true
  },
  {
    id: 'faasos-paneer-roll',
    restaurantId: 'faasos-rolls',
    name: 'Jumbo Paneer Tikka Wrap',
    description: 'Spiced grilled paneer wrapped in lachha paratha',
    price: 159,
    isVeg: true,
    imageUrl: food('garlic-bread'),
    isAvailable: true
  },
  {
    id: 'loaded-burger',
    restaurantId: 'flavor-town',
    name: 'Loaded Burger',
    description: 'Crispy patty, cheese and house sauce',
    price: 169,
    isVeg: false,
    imageUrl: food('flavor-town'),
    isAvailable: true
  }
];

export const initialOrder: Order = {
  id: 'order-demo',
  displayId: 'GC-20247',
  restaurantId: 'rising-cafe',
  restaurantName: 'The Rising Cafe',
  campusId: 'campus-manipal',
  dropPoint: 'Hostel Block A, Room 204',
  orderStatus: 'procuring',
  paymentStatus: 'partially_refunded',
  subtotal: 672,
  fee: 20,
  totalAmount: 692,
  eta: '9:45 PM',
  placedAt: '9:12 PM',
  items: [
    {
      id: 'order-item-paneer',
      menuItemId: 'paneer-pizza',
      name: 'Paneer Pizza',
      quantity: 1,
      unitPrice: 215,
      lineTotal: 215,
      itemStatus: 'confirmed',
      refundAmount: 0
    },
    {
      id: 'order-item-biryani',
      menuItemId: 'chicken-biryani',
      name: 'Chicken Biryani',
      quantity: 2,
      unitPrice: 189,
      lineTotal: 378,
      itemStatus: 'confirmed',
      refundAmount: 0
    }
  ]
};
