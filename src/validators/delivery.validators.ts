import { z } from 'zod';
import { idParamsSchema, uuidParam } from './common.validators';

export const getMyBatchesSchema = z.object({
  query: z.object({
    date: z.string().optional()
  }).optional()
});

export const getDeliveryBatchByIdSchema = idParamsSchema;

export const startBatchSchema = idParamsSchema;

export const deliverOrderSchema = z.object({
  params: z.object({ id: uuidParam }),
  body: z.object({
    proof_type: z.enum(['otp', 'agent_confirmation', 'photo']),
    proof_value: z.string().optional()
  })
});

export const markNotDeliveredSchema = z.object({
  params: z.object({ id: uuidParam }),
  body: z.object({
    reason: z.string().trim().min(1)
  })
});
