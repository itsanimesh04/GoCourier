import { z } from 'zod';
import { decimalString, idParamsSchema, uuidParam } from './common.validators';

export const getBatchDetailSchema = idParamsSchema;

export const updateProcurementTaskSchema = z.object({
  params: z.object({ id: uuidParam }),
  body: z.object({
    external_order_ref: z.string().nullable().optional(),
    actual_cost: z.union([decimalString, z.number()]).nullable().optional(),
    platform: z.string().nullable().optional(),
    status: z.string().min(1)
  })
});

export const markOrderItemUnavailableSchema = z.object({
  params: z.object({ id: uuidParam }),
  body: z.object({
    reason: z.string().trim().min(1)
  })
});

export const markOrderItemConfirmedSchema = idParamsSchema;

export const listRefundsSchema = z.object({
  query: z.object({
    status: z.string().optional()
  }).optional()
});

export const initiateRefundSchema = idParamsSchema;
