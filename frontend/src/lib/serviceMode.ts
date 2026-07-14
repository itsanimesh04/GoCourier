export type ServiceMode = 'food' | 'extras';
export type ServiceType = 'food' | 'catalog' | 'custom_request' | 'parcel';
export type VendorType = 'restaurant' | 'store';
export type OrderKind = 'food' | 'extras_catalog' | 'custom_request' | 'parcel';

export interface ServiceModeConfig {
  id: ServiceMode;
  label: string;
  homeRoute: '/food' | '/extras';
  description: string;
}

export const SERVICE_MODES: Record<ServiceMode, ServiceModeConfig> = {
  food: {
    id: 'food',
    label: 'Food',
    homeRoute: '/food',
    description: 'Browse restaurants and order food'
  },
  extras: {
    id: 'extras',
    label: 'Extras',
    homeRoute: '/extras',
    description: 'Everyday products, custom requests, and parcel delivery'
  }
};

export const SERVICE_MODE_STORAGE_KEY = 'go-courier:service-mode:v1';

export function isServiceMode(value: unknown): value is ServiceMode {
  return value === 'food' || value === 'extras';
}

export function modeFromPath(pathname: string): ServiceMode | null {
  if (pathname === '/food' || pathname.startsWith('/food/')) return 'food';
  if (pathname === '/extras' || pathname.startsWith('/extras/')) return 'extras';
  return null;
}

export const routes = {
  foodHome: '/food',
  extrasHome: '/extras',
  foodRestaurant: (id: string) => `/food/restaurants/${id}`,
  orders: '/orders',
  orderTracking: (id: string) => `/orders/${id}/tracking`,
  profile: '/profile',
  campus: '/campus'
} as const;
