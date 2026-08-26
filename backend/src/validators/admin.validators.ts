import { z } from 'zod';
import { decimalString, objectIdParam, timeString } from './common.validators';

const optionalObjectId = objectIdParam.nullable().optional();

const campusCreateBody = z
  .object({
    name: z.string().trim().min(1),
    city: z.string().trim().min(1),
    state: z.string().trim().nullable().optional(),
    cutoff_time: timeString,
    delivery_time: timeString,
    is_active: z.boolean().optional()
  })
  .strict();

const campusUpdateBody = campusCreateBody.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field is required'
});

const restaurantCreateBody = z
  .object({
    name: z.string().trim().min(1),
    cuisine: z.string().optional(),
    rating: z.number().min(0).max(5).optional(),
    address: z.string().optional(),
    distance_km: z.number().min(0).optional(),
    eta_minutes: z.number().int().min(0).optional(),
    tags: z.array(z.string()).optional(),
    image_url: z.union([z.string().url(), z.literal(''), z.null()]).optional(),
    image_key: z.string().nullable().optional(),
    open_time: timeString.nullable().optional(),
    close_time: timeString.nullable().optional(),
    is_open: z.boolean().optional(),
    is_active: z.boolean().optional(),
    commission_rate: decimalString.optional(),
    manual_priority: z.number().int().optional(),
    refund_risk_penalty: decimalString.optional()
  })
  .strict();

const restaurantUpdateBody = restaurantCreateBody
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: 'At least one field is required' });

const menuItemCreateBody = z
  .object({
    name: z.string().trim().min(1),
    price: decimalString,
    description: z.string().optional(),
    original_price: decimalString.nullable().optional(),
    rating: z.number().min(0).max(5).optional(),
    is_veg: z.boolean().nullable().optional(),
    is_available: z.boolean().optional(),
    category_id: optionalObjectId,
    image_url: z.union([z.string().url(), z.literal(''), z.null()]).optional(),
    image_key: z.string().nullable().optional(),
    sort_order: z.number().int().optional(),
    addon_ids: z.array(objectIdParam).optional(),
    addon_group_ids: z.array(objectIdParam).optional()
  })
  .strict();

const menuItemUpdateBody = menuItemCreateBody
  .extend({ restaurant_id: objectIdParam.optional() })
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: 'At least one field is required' });

const imageUrlField = z.union([z.string().url(), z.literal(''), z.null()]).optional();

const categoryBody = z
  .object({
    name: z.string().trim().min(1),
    image_url: imageUrlField,
    image_key: z.string().nullable().optional(),
    sort_order: z.number().int().optional(),
    is_active: z.boolean().optional()
  })
  .strict();

const bannerBody = z
  .object({
    title: z.string().trim().min(1),
    subtitle: z.string().optional(),
    image_url: imageUrlField,
    image_key: z.string().nullable().optional(),
    cta_label: z.string().optional(),
    cta_href: z.string().optional(),
    sort_order: z.number().int().optional(),
    is_active: z.boolean().optional()
  })
  .strict();

const addonBody = z
  .object({
    name: z.string().trim().min(1),
    price: decimalString,
    is_veg: z.boolean().nullable().optional(),
    is_active: z.boolean().optional()
  })
  .strict();

const nestedAddonBody = z
  .object({
    id: objectIdParam.optional(),
    name: z.string().trim().min(1),
    price: decimalString,
    is_veg: z.boolean().nullable().optional(),
    image_url: imageUrlField,
    image_key: z.string().nullable().optional(),
    sort_order: z.number().int().optional(),
    is_active: z.boolean().optional()
  })
  .strict();

const nestedSubGroupBody = z
  .object({
    id: objectIdParam.optional(),
    name: z.string().optional(),
    sort_order: z.number().int().optional(),
    addons: z.array(nestedAddonBody).optional()
  })
  .strict();

const addonGroupBody = z
  .object({
    name: z.string().trim().min(1),
    is_active: z.boolean().optional(),
    sort_order: z.number().int().optional(),
    subgroups: z.array(nestedSubGroupBody).optional()
  })
  .strict();

const faqItem = z.object({
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1)
});

export const adminLoginSchema = z.object({
  body: z
    .object({
      email: z.string().trim().min(1),
      password: z.string().min(1)
    })
    .strict()
});

export const createCampusSchema = z.object({ body: campusCreateBody });
export const updateCampusSchema = z.object({
  params: z.object({ id: objectIdParam }),
  body: campusUpdateBody
});
export const campusIdSchema = z.object({ params: z.object({ id: objectIdParam }) });

export const createRestaurantSchema = z.object({ body: restaurantCreateBody });
export const updateRestaurantSchema = z.object({
  params: z.object({ id: objectIdParam }),
  body: restaurantUpdateBody
});
export const restaurantIdSchema = z.object({ params: z.object({ id: objectIdParam }) });

export const createMenuItemSchema = z.object({
  params: z.object({ id: objectIdParam }),
  body: menuItemCreateBody
});
export const updateMenuItemSchema = z.object({
  params: z.object({ id: objectIdParam }),
  body: menuItemUpdateBody
});
export const menuItemIdSchema = z.object({ params: z.object({ id: objectIdParam }) });

export const createCategorySchema = z.object({ body: categoryBody });
export const updateCategorySchema = z.object({
  params: z.object({ id: objectIdParam }),
  body: categoryBody.partial().refine((v) => Object.keys(v).length > 0, {
    message: 'At least one field is required'
  })
});
export const categoryIdSchema = z.object({ params: z.object({ id: objectIdParam }) });

export const createBannerSchema = z.object({ body: bannerBody });
export const updateBannerSchema = z.object({
  params: z.object({ id: objectIdParam }),
  body: bannerBody.partial().refine((v) => Object.keys(v).length > 0, {
    message: 'At least one field is required'
  })
});
export const bannerIdSchema = z.object({ params: z.object({ id: objectIdParam }) });

export const createAddonSchema = z.object({ body: addonBody });
export const updateAddonSchema = z.object({
  params: z.object({ id: objectIdParam }),
  body: addonBody.partial().refine((v) => Object.keys(v).length > 0, {
    message: 'At least one field is required'
  })
});

export const createAddonGroupSchema = z.object({ body: addonGroupBody });
export const updateAddonGroupSchema = z.object({
  params: z.object({ id: objectIdParam }),
  body: addonGroupBody.partial().refine((v) => Object.keys(v).length > 0, {
    message: 'At least one field is required'
  })
});
export const addonGroupIdSchema = z.object({ params: z.object({ id: objectIdParam }) });

export const updateUserSchema = z.object({
  params: z.object({ id: objectIdParam }),
  body: z
    .object({
      name: z.string().trim().nullable().optional(),
      is_active: z.boolean().optional(),
      role: z.enum(['student', 'ops', 'admin', 'delivery_agent']).optional(),
      campus_id: objectIdParam.nullable().optional(),
      drop_point: z.string().nullable().optional()
    })
    .strict()
    .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required' })
});
export const userIdSchema = z.object({ params: z.object({ id: objectIdParam }) });

export const updateOrderStatusSchema = z.object({
  params: z.object({ id: objectIdParam }),
  body: z
    .object({
      order_status: z.enum([
        'placed',
        'locked',
        'procuring',
        'confirmed',
        'out_for_delivery',
        'delivered',
        'closed',
        'cancelled'
      ])
    })
    .strict()
});
export const orderIdSchema = z.object({ params: z.object({ id: objectIdParam }) });
export const paymentIdSchema = z.object({ params: z.object({ id: objectIdParam }) });

export const updateConfigSchema = z.object({
  body: z
    .object({
      delivery_fee: decimalString.optional(),
      custom_request_fee: decimalString.optional(),
      parcel_fee: decimalString.optional(),
      faq: z.array(faqItem).optional(),
      app_download_title: z.string().optional(),
      app_download_subtitle: z.string().optional(),
      play_store_href: z.string().optional(),
      app_store_href: z.string().optional(),
      marquee_strings: z.array(z.string()).optional()
    })
    .strict()
    .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required' })
});

const extraProductBody = z
  .object({
    campus_id: objectIdParam.nullable().optional(),
    name: z.string().trim().min(1),
    unit: z.string().optional(),
    price: decimalString,
    category: z.string().optional(),
    store_name: z.string().optional(),
    image_url: imageUrlField,
    image_key: z.string().nullable().optional(),
    available: z.boolean().optional(),
    featured: z.boolean().optional(),
    sort_order: z.number().int().optional()
  })
  .strict();

export const createExtraProductSchema = z.object({ body: extraProductBody });
export const updateExtraProductSchema = z.object({
  params: z.object({ id: objectIdParam }),
  body: extraProductBody.partial().refine((v) => Object.keys(v).length > 0, {
    message: 'At least one field is required'
  })
});
export const extraProductIdSchema = z.object({ params: z.object({ id: objectIdParam }) });

export const deleteUploadSchema = z.object({
  body: z.object({ key: z.string().trim().min(1) }).strict()
});
