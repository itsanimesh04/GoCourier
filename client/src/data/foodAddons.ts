import type { FoodAddon } from '../utils/types';

const cheese: FoodAddon = { id: 'extra-cheese', name: 'Extra Cheese', price: 40, isVeg: true };
const sauce: FoodAddon = { id: 'extra-sauce', name: 'Extra Sauce', price: 20, isVeg: true };
const raita: FoodAddon = { id: 'raita', name: 'Raita', price: 30, isVeg: true };
const coke: FoodAddon = { id: 'coke', name: 'Coke (250ml)', price: 40, isVeg: true };
const fries: FoodAddon = { id: 'fries', name: 'Side Fries', price: 60, isVeg: true };
const mayo: FoodAddon = { id: 'mayo', name: 'Extra Mayo', price: 15, isVeg: true };
const chutney: FoodAddon = { id: 'chutney', name: 'Extra Chutney', price: 15, isVeg: true };
const egg: FoodAddon = { id: 'egg', name: 'Add Egg', price: 25, isVeg: false };

/** Per-menu-item food add-ons */
export const menuItemAddons: Record<string, FoodAddon[]> = {
  'paneer-pizza': [cheese, sauce, coke],
  'garlic-bread': [cheese, sauce],
  'chicken-biryani': [raita, coke],
  'chocolate-shake': [],
  'lapinoz-7cheesy': [cheese, sauce, coke],
  'lapinoz-garlic': [cheese, sauce],
  'behrouz-dum': [raita, coke],
  'burger-singh-maharaja': [fries, mayo, coke],
  'wow-momo-panfried': [sauce, coke],
  'theobroma-brownie': [],
  'faasos-paneer-roll': [mayo, coke],
  'loaded-burger': [fries, mayo, cheese, coke, egg],
  'masala-dosa': [chutney, coke],
  'idli-sambar': [chutney],
  'hakka-noodles': [sauce, coke],
  'chilli-paneer': [sauce, coke],
};

export function getAddonsForMenuItem(menuItemId: string): FoodAddon[] {
  return menuItemAddons[menuItemId] ?? [cheese, sauce, coke];
}
