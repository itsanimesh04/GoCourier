export type OrderStatus =
  | 'cart'
  | 'placed'
  | 'locked'
  | 'procuring'
  | 'confirmed'
  | 'out_for_delivery'
  | 'delivered'
  | 'closed'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'late' | 'refunded' | 'partially_refunded';
export type ItemStatus = 'pending' | 'confirmed' | 'unavailable' | 'refunded';

export interface Campus {
  id: string;
  name: string;
  city: string;
  state: string | null;
  cutoffTime: string;
  deliveryTime: string;
}

export interface Restaurant {
  id: string;
  campusId: string | null;
  name: string;
  cuisine: string;
  rating: number;
  address: string;
  distanceKm: number;
  etaMinutes: number;
  tags: string[];
  imageUrl: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  isVeg: boolean;
  imageUrl: string;
  isAvailable: boolean;
  category?: string;
  addons?: FoodAddon[];
  addonGroups?: AddonGroup[];
  optionSet?: FoodOptionSet | null;
}

export interface FoodOptionChoice {
  id: string;
  name: string;
  price: number;
}

export interface FoodOptionSet {
  id: string;
  name: string;
  choices: FoodOptionChoice[];
}

export interface FoodAddon {
  id: string;
  name: string;
  price: number;
  isVeg?: boolean;
  imageUrl?: string | null;
}

export interface AddonSubGroup {
  id: string;
  name: string;
  addons: FoodAddon[];
}

export interface AddonGroup {
  id: string;
  name: string;
  subgroups: AddonSubGroup[];
}

export interface SelectedAddon {
  id: string;
  name: string;
  price: number;
}

export interface SelectedOption {
  id: string;
  name: string;
  price: number;
}

export interface CartLineItem {
  cartKey: string;
  kind: 'food' | 'extra';
  itemKind?: 'food' | 'extra' | 'custom_request' | 'parcel';
  menuItemId?: string;
  extrasProductId?: string;
  restaurantId?: string;
  name: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  selectedAddons: SelectedAddon[];
  selectedOption?: SelectedOption;
  note?: string;
  pickupPoint?: string;
  dropPoint?: string;
  size?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  itemStatus: ItemStatus;
  refundAmount: number;
}

export interface Order {
  id: string;
  displayId: string;
  restaurantId: string;
  restaurantName: string;
  campusId: string;
  dropPoint: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  fee: number;
  totalAmount: number;
  eta: string;
  placedAt: string;
  items: OrderItem[];
}

export interface User {
  id: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  role: 'student';
  campus_id: string | null;
  drop_point?: string | null;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface FoodCategory {
  id: string;
  name: string;
  imageUrl: string;
}

export interface FoodFilters {
  availability: 'all' | 'in_stock' | 'out_of_stock';
  priceFrom: number;
  priceTo: number;
  diet: 'all' | 'veg' | 'non_veg';
  categories: string[];
  minRating: number | null;
  cuisine: string | null;
  query: string;
}

export interface ExtraProduct {
  id: string;
  campusId: string | null;
  name: string;
  unit: string;
  price: number;
  category: string;
  storeName: string;
  imageUrl: string | null;
  available: boolean;
  featured: boolean;
}

export interface AppConfig {
  deliveryFee: number;
  customRequestFee: number;
  parcelFee: number;
  faq: { question: string; answer: string }[];
  appDownloadTitle: string;
  appDownloadSubtitle: string;
  playStoreHref: string;
  appStoreHref: string;
  marqueeStrings: string[];
}

export const DEFAULT_FOOD_FILTERS: FoodFilters = {
  availability: 'all',
  priceFrom: 0,
  priceTo: 750,
  diet: 'all',
  categories: [],
  minRating: null,
  cuisine: null,
  query: '',
};
