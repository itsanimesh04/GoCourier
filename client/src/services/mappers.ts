import type {
  AppConfig,
  Banner,
  Campus,
  ExtraProduct,
  FoodAddon,
  MenuItem,
  Restaurant,
  User,
} from '../utils/types';

export function mapCampus(row: {
  id: string;
  name: string;
  city: string;
  state?: string | null;
  cutoff_time: string;
  delivery_time: string;
}): Campus {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    state: row.state ?? null,
    cutoffTime: row.cutoff_time?.slice(0, 5) ?? '21:30',
    deliveryTime: row.delivery_time?.slice(0, 5) ?? '21:45',
  };
}

export function mapRestaurant(row: {
  id: string;
  campus_id?: string | null;
  name: string;
  cuisine?: string;
  rating?: number;
  address?: string;
  distance_km?: number;
  eta_minutes?: number;
  tags?: string[];
  image_url?: string | null;
  open_time?: string | null;
  close_time?: string | null;
  is_open?: boolean;
}): Restaurant {
  return {
    id: row.id,
    campusId: row.campus_id ?? null,
    name: row.name,
    cuisine: row.cuisine ?? '',
    rating: row.rating ?? 0,
    address: row.address ?? '',
    distanceKm: row.distance_km ?? 0,
    etaMinutes: row.eta_minutes ?? 0,
    tags: row.tags ?? [],
    imageUrl: row.image_url ?? '',
    openTime: row.open_time ?? '10:00 AM',
    closeTime: row.close_time ?? '10:30 PM',
    isOpen: row.is_open ?? true,
  };
}

export function mapMenuItem(row: {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  price: number | string;
  original_price?: number | string | null;
  rating?: number;
  is_veg?: boolean | null;
  image_url?: string | null;
  is_available?: boolean;
  category?: string | null;
  addons?: {
    id: string;
    name: string;
    price: number | string;
    is_veg?: boolean | null;
    image_url?: string | null;
  }[];
  addon_groups?: {
    id: string;
    name: string;
    subgroups: {
      id: string;
      name: string;
      addons: {
        id: string;
        name: string;
        price: number | string;
        is_veg?: boolean | null;
        image_url?: string | null;
      }[];
    }[];
  }[];
}): MenuItem {
  const addonGroups = (row.addon_groups ?? []).map((group) => ({
    id: group.id,
    name: group.name,
    subgroups: (group.subgroups ?? []).map((sub) => ({
      id: sub.id,
      name: sub.name,
      addons: (sub.addons ?? []).map(
        (addon): FoodAddon => ({
          id: addon.id,
          name: addon.name,
          price: Number(addon.price),
          isVeg: addon.is_veg ?? undefined,
          imageUrl: addon.image_url ?? null,
        })
      ),
    })),
  }));

  const flatFromGroups = addonGroups.flatMap((g) => g.subgroups.flatMap((s) => s.addons));
  const addons =
    flatFromGroups.length > 0
      ? flatFromGroups
      : (row.addons ?? []).map(
          (addon): FoodAddon => ({
            id: addon.id,
            name: addon.name,
            price: Number(addon.price),
            isVeg: addon.is_veg ?? undefined,
            imageUrl: addon.image_url ?? null,
          })
        );

  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    name: row.name,
    description: row.description ?? '',
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    rating: row.rating ?? 0,
    isVeg: Boolean(row.is_veg),
    imageUrl: row.image_url ?? '',
    isAvailable: row.is_available ?? true,
    category: row.category ?? undefined,
    addons,
    addonGroups,
  };
}

export function mapBanner(row: {
  id: string;
  title: string;
  subtitle?: string;
  image_url?: string | null;
  cta_label?: string;
  cta_href?: string;
}): Banner {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? '',
    imageUrl: row.image_url ?? '',
    ctaLabel: row.cta_label ?? '',
    ctaHref: row.cta_href ?? '/food',
  };
}

export function mapExtra(row: {
  id: string;
  campus_id?: string | null;
  name: string;
  unit?: string;
  price: string;
  category?: string;
  store_name?: string;
  image_url?: string | null;
  available?: boolean;
  featured?: boolean;
}): ExtraProduct {
  return {
    id: row.id,
    campusId: row.campus_id ?? null,
    name: row.name,
    unit: row.unit ?? '1 pc',
    price: Number(row.price),
    category: row.category ?? 'Snacks',
    storeName: row.store_name ?? 'Campus Cart',
    imageUrl: row.image_url ?? null,
    available: row.available ?? true,
    featured: row.featured ?? false,
  };
}

export function mapConfig(row: {
  delivery_fee: string;
  custom_request_fee: string;
  parcel_fee: string;
  faq?: { question: string; answer: string }[];
  app_download_title?: string;
  app_download_subtitle?: string;
  play_store_href?: string;
  app_store_href?: string;
  marquee_strings?: string[];
}): AppConfig {
  return {
    deliveryFee: Number(row.delivery_fee),
    customRequestFee: Number(row.custom_request_fee),
    parcelFee: Number(row.parcel_fee),
    faq: row.faq ?? [],
    appDownloadTitle: row.app_download_title ?? 'Get the GoCourier app',
    appDownloadSubtitle: row.app_download_subtitle ?? '',
    playStoreHref: row.play_store_href ?? '#',
    appStoreHref: row.app_store_href ?? '#',
    marqueeStrings: row.marquee_strings ?? [],
  };
}

export function mapUser(row: User): User {
  return row;
}

export function digitsOnly(phone: string) {
  return phone.replace(/\D/g, '');
}
