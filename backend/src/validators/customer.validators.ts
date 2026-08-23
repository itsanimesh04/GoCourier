import { z } from 'zod';
import { objectIdParam } from './common.validators';

const itemKind = z.enum(['food', 'extra', 'custom_request', 'parcel']);

const cartItemBody = z
  .object({
    item_kind: itemKind.default('food'),
    quantity: z.number().int().positive(),
    menu_item_id: objectIdParam.optional(),
    extras_product_id: objectIdParam.optional(),
    addon_ids: z.array(objectIdParam).optional(),
    note: z.string().trim().max(2000).nullable().optional(),
    image_url: z.string().nullable().optional(),
    pickup_point: z.string().trim().max(200).nullable().optional(),
    drop_point: z.string().trim().max(200).nullable().optional(),
    size: z.string().trim().max(40).nullable().optional()
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.item_kind === 'food' && !value.menu_item_id) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'menu_item_id is required', path: ['menu_item_id'] });
    }
    if (value.item_kind === 'extra' && !value.extras_product_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'extras_product_id is required',
        path: ['extras_product_id']
      });
    }
  });

const cartBody = z
  .object({
    restaurant_id: objectIdParam.optional().nullable(),
    items: z.array(cartItemBody),
    force_replace: z.boolean().optional()
  })
  .strict();

export const setCampusSchema = z.object({
  body: z
    .object({
      campus_id: objectIdParam
    })
    .strict()
});

export const listRestaurantsSchema = z.object({
  query: z
    .object({
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
    id: objectIdParam
  })
});

export const listExtrasSchema = z.object({
  query: z
    .object({
      campus_id: objectIdParam.optional()
    })
    .strict()
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

export const listOrdersSchema = z.object({
  query: z
    .object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(50).default(20)
    })
    .strict()
});

export type CartBody = z.infer<typeof cartBody>;
