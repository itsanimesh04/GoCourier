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
  state: string;
  cutoffTime: string;
  deliveryTime: string;
}

export interface Restaurant {
  id: string;
  campusId: string;
  name: string;
  cuisine: string;
  rating: number;
  distanceKm: number;
  etaMinutes: number;
  tags: string[];
  imageUrl: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
  imageUrl: string;
  isAvailable: boolean;
}

export interface CartItem {
  menuItemId: string;
  restaurantId: string;
  quantity: number;
  unitPrice: number;
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
  phone: string;
  name: string | null;
  role: 'student';
  campus_id: string | null;
}
