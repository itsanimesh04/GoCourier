import type { MenuItem, Order, Restaurant, User } from '../utils/types';

const food = (name: string) => `/food/${name}.jpg`;

const hours = { openTime: '10:00 AM', closeTime: '10:30 PM', isOpen: true };

export const campuses = [
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
    imageUrl: "https://www.cookwithkushi.com/wp-content/uploads/2015/11/spicy_Indian_chicken_biryani_recipe.jpg",
    ...hours
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
    imageUrl: "https://www.vegrecipesofindia.com/wp-content/uploads/2018/05/paneer-pizza-recipe-1.jpg",
    ...hours
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
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAmZyCXIlSNAnNoQOtziFqp_e8pAeQcatRfA&s",
    ...hours
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
    imageUrl: "https://www.kuchpakrahahai.in/wp-content/uploads/2025/09/Dominos-style-cheesy-garlic-bread-recipe.webp",
    openTime: '11:00 AM',
    closeTime: '11:00 PM',
    isOpen: true
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
    imageUrl: "https://noblepig.com/site/wp-content/uploads/2025/07/ultimate-chocolate-freakshake.jpg",
    ...hours
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
    imageUrl: "https://plus.unsplash.com/premium_photo-1713447395823-2e0b40b75a89?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y2FrZXN8ZW58MHx8MHx8fDA%3D",
    openTime: '09:00 AM',
    closeTime: '09:00 PM',
    isOpen: true
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
    imageUrl:  "https://www.kuchpakrahahai.in/wp-content/uploads/2025/09/Dominos-style-cheesy-garlic-bread-recipe.webp",
    ...hours
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
    imageUrl: food('garlic-bread'),
    openTime: '12:00 PM',
    closeTime: '11:30 PM',
    isOpen: false
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
    imageUrl: food('paneer-pizza'),
    ...hours
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
    imageUrl: food('chicken-biryani'),
    ...hours
  }
];

export const menuItems: MenuItem[] = [
  {
    id: 'paneer-pizza',
    restaurantId: 'rising-cafe',
    name: 'Paneer Pizza (8 in)',
    description: 'Cheesy paneer, capsicum, onion and classic herbs',
    price: 215,
    originalPrice: 269,
    isVeg: true,
    imageUrl: 'https://www.cookingcarnival.com/wp-content/uploads/2019/11/Paneer-Pizza-7.jpg',
    isAvailable: true,
    category: 'Italian'
  },
  {
    id: 'garlic-bread',
    restaurantId: 'rising-cafe',
    name: 'Garlic Bread',
    description: 'Toasted with garlic butter and herbs',
    price: 79,
    originalPrice: 99,
    isVeg: true,
    imageUrl: food('garlic-bread'),
    isAvailable: true,
    category: 'Italian'
  },
  {
    id: 'chicken-biryani',
    restaurantId: 'rising-cafe',
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice with spicy chicken',
    price: 189,
    originalPrice: 229,
    isVeg: false,
    imageUrl: food('chicken-biryani'),
    isAvailable: true,
    category: 'Biryani'
  },
  {
    id: 'chocolate-shake',
    restaurantId: 'rising-cafe',
    name: 'Chocolate Shake',
    description: 'Rich and creamy chocolate milkshake',
    price: 99,
    isVeg: true,
    imageUrl: food('chocolate-shake'),
    isAvailable: true,
    category: 'Desserts'
  },
  {
    id: 'lapinoz-7cheesy',
    restaurantId: 'lapinoz-pizza',
    name: '7 Cheesy Pizza',
    description: 'Loaded with 7 exotic cheeses and Italian spices',
    price: 289,
    originalPrice: 349,
    isVeg: true,
    imageUrl: 'https://cdn.uengage.io/uploads/5/image-998314-1715587934.png',
    isAvailable: true,
    category: 'Italian'
  },
  {
    id: 'lapinoz-garlic',
    restaurantId: 'lapinoz-pizza',
    name: 'Cheesy Garlic Breadsticks',
    description: 'Freshly baked sticks stuffed with melted cheese',
    price: 129,
    originalPrice: 159,
    isVeg: true,
    imageUrl: 'https://cdn.uengage.io/uploads/5/image-998314-1715587934.png',
    isAvailable: true,
    category: 'Italian'
  },
  {
    id: 'behrouz-dum',
    restaurantId: 'behrouz-biryani',
    name: 'Subz-e-Falafel Dum Biryani',
    description: 'Royal vegetable biryani layered with spices and nuts',
    price: 299,
    originalPrice: 349,
    isVeg: true,
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYEMWjAxibPovxPrmUJLfmADrRheYfNwopkA&s',
    isAvailable: true,
    category: 'Biryani'
  },
  {
    id: 'burger-singh-maharaja',
    restaurantId: 'burger-singh',
    name: 'Maharaja Paneer Burger',
    description: 'Crispy spiced paneer patty with tandoori mayo',
    price: 149,
    originalPrice: 179,
    isVeg: true,
    imageUrl: 'https://b.zmtcdn.com/data/pictures/6/20660136/24dbd155326efee7c706c215594734cb.jpg?fit=around|750:500&crop=750:500;*,*',
    isAvailable: true,
    category: 'Fast Food'
  },
  {
    id: 'wow-momo-panfried',
    restaurantId: 'wow-momo',
    name: 'Pan-Fried Schezwan Momos (6 pcs)',
    description: 'Crispy momos tossed in fiery schezwan sauce',
    price: 139,
    isVeg: true,
    imageUrl: 'https://cdn4.singleinterface.com/files/banner_images/261129/5187_1729578360_9.png',
    isAvailable: true,
    category: 'Chinese'
  },
  {
    id: 'theobroma-brownie',
    restaurantId: 'theobroma',
    name: 'Overload Brownie Box',
    description: 'Rich gooey chocolate walnut brownie slice',
    price: 115,
    originalPrice: 145,
    isVeg: true,
    imageUrl: 'https://theobroma.in/cdn/shop/files/WalnutBrownie_d7d6e2d8-ba46-4cc2-8d8b-67063988e11a.jpg?v=1711183767',
    isAvailable: true,
    category: 'Desserts'
  },
  {
    id: 'faasos-paneer-roll',
    restaurantId: 'faasos-rolls',
    name: 'Jumbo Paneer Tikka Wrap',
    description: 'Spiced grilled paneer wrapped in lachha paratha',
    price: 159,
    isVeg: true,
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4UHgmhPWh-WkCrTZVU7vzkw5Bw2RWxLkBag&s',
    isAvailable: true,
    category: 'Fast Food'
  },
  {
    id: 'loaded-burger',
    restaurantId: 'flavor-town',
    name: 'Loaded Burger',
    description: 'Crispy patty, cheese and house sauce',
    price: 169,
    originalPrice: 199,
    isVeg: false,
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS409J-BiS1ywS-TTu07JBHsDQS--sOz4nykw&s',
    isAvailable: true,
    category: 'Fast Food'
  },
  {
    id: 'masala-dosa',
    restaurantId: 'guru-kripa',
    name: 'Masala Dosa',
    description: 'Crispy dosa stuffed with spiced potato masala',
    price: 89,
    originalPrice: 110,
    isVeg: true,
    imageUrl: 'https://www.cookwithmanali.com/wp-content/uploads/2020/05/Masala-Dosa.jpg',
    isAvailable: true,
    category: 'South Indian'
  },
  {
    id: 'idli-sambar',
    restaurantId: 'guru-kripa',
    name: 'Idli Sambar (3 pcs)',
    description: 'Soft steamed idlis with hot sambar and chutney',
    price: 69,
    isVeg: true,
    imageUrl: "https://shwetainthekitchen.com/wp-content/uploads/2022/01/Idli-Sambar.jpg",
    isAvailable: true,
    category: 'South Indian'
  },
  {
    id: 'hakka-noodles',
    restaurantId: 'wow-momo',
    name: 'Veg Hakka Noodles',
    description: 'Wok-tossed noodles with crisp veggies',
    price: 129,
    originalPrice: 149,
    isVeg: true,
    imageUrl: 'https://www.cubesnjuliennes.com/wp-content/uploads/2020/06/Spicy-Chicken-Hakka-Noodles-Recipe.jpg',
    isAvailable: true,
    category: 'Chinese'
  },
  {
    id: 'chilli-paneer',
    restaurantId: 'rising-cafe',
    name: 'Chilli Paneer Dry',
    description: 'Indo-Chinese paneer tossed in chilli garlic sauce',
    price: 179,
    originalPrice: 210,
    isVeg: true,
    imageUrl: 'https://www.cookwithmanali.com/wp-content/uploads/2016/01/Chilli-Paneer-Restaurant-Style.jpg',
    isAvailable: false,
    category: 'Chinese'
  },
  {
    id: 'vada-sambar',
    restaurantId: 'guru-kripa',
    name: 'Medu Vada (2 pcs)',
    description: 'Crispy lentil doughnuts with sambar and coconut chutney',
    price: 75,
    isVeg: true,
    imageUrl: 'https://www.cookwithmanali.com/wp-content/uploads/2019/09/Medu-Vada.jpg',
    isAvailable: true,
    category: 'South Indian'
  },
  {
    id: 'uttapam',
    restaurantId: 'guru-kripa',
    name: 'Onion Uttapam',
    description: 'Thick dosa pancake topped with onions and chillies',
    price: 95,
    originalPrice: 110,
    isVeg: true,
    imageUrl: 'https://www.vegrecipesofindia.com/wp-content/uploads/2013/11/onion-uttapam-recipe-1.jpg',
    isAvailable: true,
    category: 'South Indian'
  },
  {
    id: 'veg-manchurian',
    restaurantId: 'wow-momo',
    name: 'Veg Manchurian',
    description: 'Crispy veggie balls in tangy Indo-Chinese gravy',
    price: 149,
    isVeg: true,
    imageUrl: 'https://www.cookwithmanali.com/wp-content/uploads/2014/09/Veg-Manchurian.jpg',
    isAvailable: true,
    category: 'Chinese'
  },
  {
    id: 'chicken-fried-rice',
    restaurantId: 'rising-cafe',
    name: 'Chicken Fried Rice',
    description: 'Wok-tossed rice with egg, chicken and spring onion',
    price: 159,
    originalPrice: 179,
    isVeg: false,
    imageUrl: 'https://www.cubesnjuliennes.com/wp-content/uploads/2020/02/Best-Chicken-Fried-Rice-Recipe.jpg',
    isAvailable: true,
    category: 'Chinese'
  },
  {
    id: 'veg-biryani',
    restaurantId: 'behrouz-biryani',
    name: 'Veg Dum Biryani',
    description: 'Fragrant basmati with mixed veggies and house spices',
    price: 169,
    originalPrice: 199,
    isVeg: true,
    imageUrl: 'https://www.indianhealthyrecipes.com/wp-content/uploads/2019/02/veg-biryani-recipe.jpg',
    isAvailable: true,
    category: 'Biryani'
  },
  {
    id: 'egg-biryani',
    restaurantId: 'behrouz-biryani',
    name: 'Egg Biryani Bowl',
    description: 'Spiced rice layered with boiled eggs and raita',
    price: 149,
    isVeg: false,
    imageUrl: 'https://www.indianhealthyrecipes.com/wp-content/uploads/2021/07/egg-biryani-recipe.jpg',
    isAvailable: true,
    category: 'Biryani'
  },
  {
    id: 'peri-peri-fries',
    restaurantId: 'burger-singh',
    name: 'Peri Peri Fries',
    description: 'Crispy fries dusted with peri peri seasoning',
    price: 89,
    isVeg: true,
    imageUrl: 'https://www.cookwithmanali.com/wp-content/uploads/2021/09/Peri-Peri-Fries.jpg',
    isAvailable: true,
    category: 'Fast Food'
  },
  {
    id: 'chicken-wrap',
    restaurantId: 'burger-singh',
    name: 'Grilled Chicken Wrap',
    description: 'Soft tortilla with grilled chicken, lettuce and mayo',
    price: 139,
    originalPrice: 159,
    isVeg: false,
    imageUrl: 'https://www.cookwithmanali.com/wp-content/uploads/2021/07/Chicken-Wrap.jpg',
    isAvailable: true,
    category: 'Fast Food'
  },
  {
    id: 'margherita-pizza',
    restaurantId: 'lapinoz-pizza',
    name: 'Margherita Pizza',
    description: 'Classic tomato, mozzarella and fresh basil',
    price: 199,
    originalPrice: 249,
    isVeg: true,
    imageUrl: 'https://www.simplyrecipes.com/thmb/ke1hQWzNqXYr8GZx8lKZ1q0q0qI=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Simply-Recipes-Homemade-Pizza-Dough-LEAD-3-8aa0b19e1044452c9d77a3f05db42b5d.jpg',
    isAvailable: true,
    category: 'Italian'
  },
  {
    id: 'pasta-alfredo',
    restaurantId: 'lapinoz-pizza',
    name: 'White Sauce Pasta',
    description: 'Creamy alfredo penne with herbs',
    price: 169,
    isVeg: true,
    imageUrl: 'https://www.cookwithmanali.com/wp-content/uploads/2021/06/White-Sauce-Pasta.jpg',
    isAvailable: true,
    category: 'Italian'
  },
  {
    id: 'gulab-jamun',
    restaurantId: 'theobroma',
    name: 'Gulab Jamun (2 pcs)',
    description: 'Warm soft dumplings soaked in sugar syrup',
    price: 69,
    isVeg: true,
    imageUrl: 'https://www.vegrecipesofindia.com/wp-content/uploads/2022/10/gulab-jamun-recipe-1.jpg',
    isAvailable: true,
    category: 'Desserts'
  },
  {
    id: 'ice-cream-sundae',
    restaurantId: 'theobroma',
    name: 'Chocolate Sundae',
    description: 'Scoops of chocolate ice cream with fudge drizzle',
    price: 119,
    originalPrice: 139,
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80',
    isAvailable: true,
    category: 'Desserts'
  },
  {
    id: 'chicken-kathi-roll',
    restaurantId: 'faasos-rolls',
    name: 'Chicken Kathi Roll',
    description: 'Paratha wrapped with spiced chicken and onions',
    price: 129,
    originalPrice: 149,
    isVeg: false,
    imageUrl: 'https://www.cookwithmanali.com/wp-content/uploads/2021/04/Chicken-Kathal-Roll.jpg',
    isAvailable: true,
    category: 'Rolls'
  },
  {
    id: 'egg-roll',
    restaurantId: 'faasos-rolls',
    name: 'Egg Roll',
    description: 'Classic Kolkata-style egg roll with chilli sauce',
    price: 99,
    isVeg: false,
    imageUrl: 'https://www.indianhealthyrecipes.com/wp-content/uploads/2022/03/egg-roll-recipe.jpg',
    isAvailable: true,
    category: 'Rolls'
  },
  {
    id: 'cold-coffee',
    restaurantId: 'flavor-town',
    name: 'Cold Coffee',
    description: 'Iced blended coffee with a creamy foam top',
    price: 89,
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80',
    isAvailable: true,
    category: 'Beverages'
  },
  {
    id: 'fresh-lime-soda',
    restaurantId: 'flavor-town',
    name: 'Fresh Lime Soda',
    description: 'Sweet and salty lime soda, ice-cold',
    price: 59,
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80',
    isAvailable: true,
    category: 'Beverages'
  },
  {
    id: 'mango-smoothie',
    restaurantId: 'theobroma',
    name: 'Mango Smoothie',
    description: 'Thick mango pulp blended with yogurt',
    price: 109,
    originalPrice: 129,
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1623065429232-9b7e2e1e0b0f?w=800&q=80',
    isAvailable: true,
    category: 'Beverages'
  }
];

export const currentUser: User = {
  id: 'user-1',
  name: 'Rohan Sharma',
  email: 'rohan.sharma@campus.edu',
  phone: '+91 98765 43210',
  role: 'student',
  campus_id: 'campus-nims',
};

export const seedOrders: Order[] = [
  {
    id: 'order-seed-1',
    displayId: 'GC-19812',
    restaurantId: 'lapinoz-pizza',
    restaurantName: "La Pino'z Pizza",
    campusId: 'campus-nims',
    dropPoint: 'Hostel Block B, Room 118',
    orderStatus: 'delivered',
    paymentStatus: 'success',
    subtotal: 418,
    fee: 20,
    totalAmount: 438,
    eta: '8:40 PM',
    placedAt: 'Jul 28, 8:05 PM',
    items: [
      {
        id: 'oi-1',
        menuItemId: 'lapinoz-7cheesy',
        name: '7 Cheesy Pizza',
        quantity: 1,
        unitPrice: 289,
        lineTotal: 289,
        itemStatus: 'confirmed',
        refundAmount: 0,
      },
      {
        id: 'oi-2',
        menuItemId: 'lapinoz-garlic',
        name: 'Cheesy Garlic Breadsticks',
        quantity: 1,
        unitPrice: 129,
        lineTotal: 129,
        itemStatus: 'confirmed',
        refundAmount: 0,
      },
    ],
  },
];

export const initialOrder = {
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
