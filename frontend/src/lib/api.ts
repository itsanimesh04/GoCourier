import type { Campus, CartItem, MenuItem, Order, PaymentStatus, Restaurant, User, OrderStatus, ItemStatus } from './types';
import { campuses as campusFallback, initialOrder, menuItems as menuFallback, restaurants as restaurantFallback } from '../data/mockData';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const apiEnabled = Boolean(apiBaseUrl);

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

interface BackendUser {
  id: string;
  phone: string;
  name: string | null;
  role: 'student';
  campus_id: string | null;
}

interface BackendCampus {
  id: string;
  name: string;
  city: string;
  state?: string;
  cutoff_time: string;
  delivery_time: string;
}

interface BackendRestaurant {
  id: string;
  campus_id: string;
  name: string;
  offer_badges?: string[];
  availability_confidence?: number | null;
  is_promoted?: boolean;
}

interface BackendMenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  price: string;
  is_veg: boolean | null;
  is_available: boolean;
}

interface BackendCart {
  id: string;
  order_status: string;
  payment_status: string;
  drop_point: string | null;
  restaurant: { id: string; name: string };
  campus: { id: string; name: string; city: string; cutoff_time: string; delivery_time: string };
  items: Array<{
    id: string;
    menu_item_id: string;
    name: string;
    price: string;
    quantity: number;
    line_total: string;
    is_veg: boolean | null;
    is_available: boolean;
  }>;
  subtotal: string;
  fee: string;
  total_amount: string;
}

interface BackendOrderDetail {
  id: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  drop_point: string | null;
  subtotal: string;
  fee: string;
  total_amount: string;
  placed_at: string | null;
  restaurant: { id: string; name: string };
  campus: { id: string; name: string; city: string; delivery_time?: string };
  items: Array<{
    id: string;
    menu_item_id: string;
    name: string;
    price: string;
    quantity: number;
    line_total: string;
    item_status: ItemStatus;
    refund_amount: string;
  }>;
}

function apiUrl(path: string) {
  if (!apiBaseUrl) {
    throw new ApiClientError(0, 'API_DISABLED', 'API base URL is not configured');
  }
  return `${apiBaseUrl.replace(/\/$/, '')}${path}`;
}

async function request<T>(path: string, options: RequestInit & { token?: string | null } = {}) {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(apiUrl(path), {
    ...options,
    headers
  });
  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !payload.success) {
    const error = payload.success
      ? { code: 'HTTP_ERROR', message: response.statusText }
      : payload.error;
    throw new ApiClientError(response.status, error.code, error.message, error.details);
  }

  return payload.data;
}

function money(value: string | number) {
  return typeof value === 'number' ? value : Number(value);
}

function presentationForRestaurant(name: string, index = 0) {
  const exact = restaurantFallback.find((restaurant) => restaurant.name.toLowerCase() === name.toLowerCase());
  return exact ?? restaurantFallback[index % restaurantFallback.length];
}

function presentationForMenuItem(name: string, index = 0) {
  const exact = menuFallback.find((item) => item.name.toLowerCase() === name.toLowerCase());
  return exact ?? menuFallback[index % menuFallback.length];
}

function mapCampus(campus: BackendCampus): Campus {
  const fallback = campusFallback.find((entry) => entry.name.toLowerCase() === campus.name.toLowerCase());
  return {
    id: campus.id,
    name: campus.name,
    city: campus.city,
    state: campus.state ?? fallback?.state ?? '',
    cutoffTime: campus.cutoff_time,
    deliveryTime: campus.delivery_time
  };
}

function mapRestaurant(restaurant: BackendRestaurant, index: number): Restaurant {
  const presentation = presentationForRestaurant(restaurant.name, index);
  return {
    id: restaurant.id,
    campusId: restaurant.campus_id,
    name: restaurant.name,
    cuisine: presentation.cuisine,
    rating: presentation.rating,
    distanceKm: presentation.distanceKm,
    etaMinutes: presentation.etaMinutes,
    tags: restaurant.is_promoted ? ['Hot'] : presentation.tags,
    imageUrl: presentation.imageUrl
  };
}

function mapMenuItem(item: BackendMenuItem, index: number): MenuItem {
  const presentation = presentationForMenuItem(item.name, index);
  return {
    id: item.id,
    restaurantId: item.restaurant_id,
    name: item.name,
    description: presentation.description,
    price: money(item.price),
    isVeg: item.is_veg ?? presentation.isVeg,
    imageUrl: presentation.imageUrl,
    isAvailable: item.is_available
  };
}

function displayOrderId(id: string) {
  return `GC-${id.slice(0, 5).toUpperCase()}`;
}

function mapOrderDetail(order: BackendOrderDetail): Order {
  return {
    id: order.id,
    displayId: displayOrderId(order.id),
    restaurantId: order.restaurant.id,
    restaurantName: order.restaurant.name,
    campusId: order.campus.id,
    dropPoint: order.drop_point ?? '',
    orderStatus: order.order_status,
    paymentStatus: order.payment_status,
    subtotal: money(order.subtotal),
    fee: money(order.fee),
    totalAmount: money(order.total_amount),
    eta: order.campus.delivery_time?.slice(0, 5) ?? initialOrder.eta,
    placedAt: order.placed_at ?? '',
    items: order.items.map((item) => ({
      id: item.id,
      menuItemId: item.menu_item_id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: money(item.price),
      lineTotal: money(item.line_total),
      itemStatus: item.item_status,
      refundAmount: money(item.refund_amount)
    }))
  };
}

export const apiClient = {
  requestOtp(phone: string) {
    return request<{ message: string }>('/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  },

  verifyOtp(phone: string, otp: string) {
    return request<{ token: string; user: BackendUser }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, otp_code: otp })
    });
  },

  async listCampuses(token: string): Promise<Campus[]> {
    const campuses = await request<BackendCampus[]>('/campuses', { token });
    return campuses.map(mapCampus);
  },

  async setCampus(token: string, campusId: string): Promise<User> {
    return request<User>('/me/campus', {
      method: 'POST',
      token,
      body: JSON.stringify({ campus_id: campusId })
    });
  },

  async listRestaurants(token: string, campusId: string, query = ''): Promise<Restaurant[]> {
    const params = new URLSearchParams({ campus_id: campusId });
    if (query.trim()) {
      params.set('q', query.trim());
    }
    const restaurants = await request<BackendRestaurant[]>(`/restaurants?${params.toString()}`, { token });
    return restaurants.map(mapRestaurant);
  },

  async getMenu(token: string, restaurantId: string): Promise<{ restaurant: Restaurant; items: MenuItem[] }> {
    const data = await request<{ restaurant: BackendRestaurant; items: BackendMenuItem[] }>(`/restaurants/${restaurantId}/menu`, {
      token
    });
    return {
      restaurant: mapRestaurant(data.restaurant, 0),
      items: data.items.map(mapMenuItem)
    };
  },

  async saveCart(token: string, restaurantId: string, cartItems: CartItem[], forceReplace = false) {
    const cart = await request<BackendCart>('/cart', {
      method: 'POST',
      token,
      body: JSON.stringify({
        restaurant_id: restaurantId,
        items: cartItems.map((item) => ({ menu_item_id: item.menuItemId, quantity: item.quantity })),
        force_replace: forceReplace
      })
    });
    return cart;
  },

  async getCart(token: string) {
    return request<BackendCart | null>('/cart', { token });
  },

  createOrder(token: string, dropPoint: string) {
    return request<{ order_id: string; total_amount: string }>('/orders', {
      method: 'POST',
      token,
      body: JSON.stringify({ drop_point: dropPoint })
    });
  },

  pay(token: string, orderId: string) {
    return request<unknown>(`/orders/${orderId}/pay`, {
      method: 'POST',
      token
    });
  },

  async getOrder(token: string, orderId: string): Promise<Order> {
    const detail = await request<BackendOrderDetail>(`/orders/${orderId}`, { token });
    return mapOrderDetail(detail);
  },

  async listOrders(token: string) {
    const data = await request<{ orders: BackendOrderDetail[]; pagination: unknown }>('/orders', { token });
    return data.orders.map(mapOrderDetail);
  }
};
