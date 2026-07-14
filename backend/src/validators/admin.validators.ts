import { z } from 'zod';
import { decimalString, timeString, uuidParam } from './common.validators';

const campusCreateBody = z
  .object({
    name: z.string().trim().min(1),
    city: z.string().trim().min(1),
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
    campus_id: uuidParam,
    name: z.string().trim().min(1),
    is_active: z.boolean().optional(),
    commission_rate: decimalString.optional(),
    manual_priority: z.number().int().optional(),
    refund_risk_penalty: decimalString.optional()
  })
  .strict();

const restaurantUpdateBody = restaurantCreateBody.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field is required'
});

const menuItemCreateBody = z
  .object({
    name: z.string().trim().min(1),
    price: decimalString,
    is_veg: z.boolean().optional(),
    is_available: z.boolean().optional()
  })
  .strict();

const menuItemUpdateBody = menuItemCreateBody.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field is required'
});

export const createCampusSchema = z.object({
  body: campusCreateBody
});

export const updateCampusSchema = z.object({
  params: z.object({ id: uuidParam }),
  body: campusUpdateBody
});

export const createRestaurantSchema = z.object({
  body: restaurantCreateBody
});

export const updateRestaurantSchema = z.object({
  params: z.object({ id: uuidParam }),
  body: restaurantUpdateBody
});

export const createMenuItemSchema = z.object({
  params: z.object({ id: uuidParam }),
  body: menuItemCreateBody
});

export const updateMenuItemSchema = z.object({
  params: z.object({ id: uuidParam }),
  body: menuItemUpdateBody
});
