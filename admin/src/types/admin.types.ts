export type UserRole = "student" | "ops" | "admin" | "delivery_agent";

export interface Campus {
  id: string;
  name: string;
  city: string;
  state: string | null;
  cutoff_time: string;
  delivery_time: string;
  is_active: boolean;
}

export interface Restaurant {
  id: string;
  campus_id: string;
  name: string;
  cuisine: string;
  rating: number;
  distance_km: number;
  eta_minutes: number;
  tags: string[];
  image_url: string | null;
  image_key: string | null;
  open_time: string | null;
  close_time: string | null;
  is_open: boolean;
  is_active: boolean;
  commission_rate: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description: string;
  price: string;
  original_price: string | null;
  is_veg: boolean | null;
  image_url: string | null;
  image_key: string | null;
  is_available: boolean;
  sort_order: number;
  addon_ids: string[];
}

export interface Category {
  id: string;
  name: string;
  image_url: string | null;
  image_key: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string | null;
  image_key: string | null;
  cta_label: string;
  cta_href: string;
  sort_order: number;
  is_active: boolean;
}

export interface AdminUser {
  id: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  role: UserRole;
  campus_id: string | null;
  drop_point: string | null;
  is_active: boolean;
  created_at: string;
}

export interface OrderRow {
  id: string;
  student_id: string;
  campus_id: string;
  restaurant_id: string;
  restaurant_name?: string | null;
  order_status: string;
  payment_status: string;
  total_amount: string;
  placed_at: string | null;
  student?: { name: string | null; email: string | null; phone: string | null } | null;
}

export interface PaymentRow {
  id: string;
  order_id: string;
  gateway: string;
  amount: string;
  status: string;
  created_at: string;
}

export interface AppConfig {
  id: string;
  delivery_fee: string;
  custom_request_fee: string;
  parcel_fee: string;
  faq: { question: string; answer: string }[];
  app_download_title: string;
  app_download_subtitle: string;
  play_store_href: string;
  app_store_href: string;
  marquee_strings: string[];
}

export interface DashboardStats {
  orders_today: number;
  gmv_today: string;
  active_users: number;
  open_batches: number;
  active_restaurants: number;
  available_menu_items: number;
  recent_orders: {
    id: string;
    restaurant_name: string | null;
    order_status: string;
    payment_status: string;
    total_amount: string;
    placed_at: string | null;
  }[];
  orders_by_status: { status: string; count: number }[];
  orders_last_14_days: { date: string; order_count: number; gmv: string }[];
}

export interface RevenueSummary {
  gmv: string;
  fees: string;
  subtotal: string;
  refunds: string;
  net_revenue: string;
  order_count: number;
  refund_count: number;
  by_day: { date: string; gmv: string; order_count: number }[];
  by_campus: { campus_id: string | null; gmv: string; order_count: number }[];
}

export interface UploadResult {
  key: string;
  url: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
