import { z } from 'zod';
import { uuidParam } from './common.validators';

const cartItemBody = z
  .object({
    menu_item_id: uuidParam,
    quantity: z.number().int().positive()
  })
  .strict();

const cartBody = z
  .object({
    restaurant_id: uuidParam,
    items: z.array(cartItemBody).min(1)
  })
  .strict()
  .refine(
    (value) => new Set(value.items.map((item) => item.menu_item_id)).size === value.items.length,
    {
      message: 'Duplicate menu items are not allowed',
      path: ['items']
    }
  );

export const setCampusSchema = z.object({
  body: z
    .object({
      campus_id: uuidParam
    })
    .strict()
});

export const listRestaurantsSchema = z.object({
  query: z
    .object({
      campus_id: uuidParam,
      q: z
        .string()
        .trim()
        .optional()
        .transform((value) => (value ? value : undefined))
    })
    .strict()
});

export const restaurantIdSchema = z.object({
  params: z.object({
    id: uuidParam
  })
});

export const createCartSchema = z.object({
  body: cartBody
});

export const createOrderSchema = z.object({
  body: z
    .object({
      drop_point: z.string().trim().min(1)
    })
    .strict()
});

export type CartBody = z.infer<typeof cartBody>;
