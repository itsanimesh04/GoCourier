import clientApi from '../apis/clientApi';
import type { CartLineItem } from '../utils/types';

export interface CartApiItem {
  item_kind: 'food' | 'extra' | 'custom_request' | 'parcel';
  quantity: number;
  menu_item_id?: string;
  extras_product_id?: string;
  addon_ids?: string[];
  option_choice_id?: string | null;
  note?: string | null;
  image_url?: string | null;
  pickup_point?: string | null;
  drop_point?: string | null;
  size?: string | null;
}

export function lineToCartApiItem(line: CartLineItem): CartApiItem {
  const kind =
    line.itemKind ??
    (line.kind === 'food'
      ? 'food'
      : line.extrasProductId === 'custom-request'
        ? 'custom_request'
        : line.extrasProductId === 'parcel-pickup'
          ? 'parcel'
          : 'extra');

  return {
    item_kind: kind,
    quantity: line.quantity,
    menu_item_id: line.menuItemId,
    extras_product_id: kind === 'extra' ? line.extrasProductId : undefined,
    addon_ids: line.selectedAddons.map((addon) => addon.id),
    option_choice_id: line.selectedOption?.id ?? null,
    note: line.note ?? null,
    image_url: line.imageUrl || null,
    pickup_point: line.pickupPoint ?? null,
    drop_point: line.dropPoint ?? null,
    size: line.size ?? null,
  };
}

class CartApiService {
  get() {
    return clientApi.get('/cart');
  }

  save(body: { restaurant_id?: string | null; items: CartApiItem[]; force_replace?: boolean }) {
    return clientApi.post('/cart', body);
  }
}

export default new CartApiService();
