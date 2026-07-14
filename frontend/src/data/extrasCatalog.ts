export type ExtrasCategory = 'All' | 'Stationery' | 'Snacks' | 'Drinks' | 'Personal Care' | 'Accessories';

export interface ExtrasStore {
  id: string;
  name: string;
  category: string;
  accent: string;
}

export interface ExtrasProduct {
  id: string;
  storeId: string;
  name: string;
  unit: string;
  price: number;
  category: Exclude<ExtrasCategory, 'All'>;
  imageIndex: number;
  available: boolean;
  featured: boolean;
}

export const extrasCategories: ExtrasCategory[] = ['All', 'Stationery', 'Snacks', 'Drinks', 'Personal Care', 'Accessories'];

export const extrasStores: ExtrasStore[] = [
  { id: 'campus-cart', name: 'Campus Cart', category: 'Stationery · Snacks · More', accent: '#60A5FA' },
  { id: 'goodies', name: 'Goodies', category: 'Snacks · Drinks · More', accent: '#D4FF4F' },
  { id: 'care-more', name: 'Care & More', category: 'Personal Care · More', accent: '#C084FC' },
  { id: 'tech-stop', name: 'TechStop', category: 'Accessories · More', accent: '#FB923C' }
];

export const extrasProducts: ExtrasProduct[] = [
  { id: 'gel-pen', storeId: 'campus-cart', name: 'Octane Gel Pen', unit: '1 pc', price: 15, category: 'Stationery', imageIndex: 0, available: true, featured: true },
  { id: 'classic-chips', storeId: 'goodies', name: 'Classic Salted Chips', unit: '52 g', price: 20, category: 'Snacks', imageIndex: 1, available: true, featured: true },
  { id: 'mineral-water', storeId: 'goodies', name: 'Mineral Water', unit: '1 L', price: 20, category: 'Drinks', imageIndex: 2, available: true, featured: true },
  { id: 'roll-on', storeId: 'care-more', name: 'Fresh Roll On', unit: '50 ml', price: 120, category: 'Personal Care', imageIndex: 3, available: true, featured: true },
  { id: 'notebook', storeId: 'campus-cart', name: 'Softbound Notebook', unit: '160 pages', price: 65, category: 'Stationery', imageIndex: 4, available: true, featured: false },
  { id: 'charging-cable', storeId: 'tech-stop', name: 'USB-C Cable', unit: '1 m', price: 199, category: 'Accessories', imageIndex: 5, available: true, featured: false },
  { id: 'cold-coffee', storeId: 'goodies', name: 'Cold Coffee', unit: '200 ml', price: 45, category: 'Drinks', imageIndex: 6, available: false, featured: false },
  { id: 'face-wash', storeId: 'care-more', name: 'Gentle Face Wash', unit: '100 ml', price: 149, category: 'Personal Care', imageIndex: 7, available: true, featured: false }
];
