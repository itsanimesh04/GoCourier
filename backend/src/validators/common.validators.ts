import { z } from 'zod';
import { decimalString } from '../utils/decimal';

export const objectIdParam = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Must be a valid ObjectId');

/** @deprecated Use objectIdParam — Mongo IDs are ObjectIds, not UUIDs */
export const uuidParam = objectIdParam;

export const idParamsSchema = z.object({
  params: z.object({
    id: objectIdParam
  })
});

export const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Must be HH:mm or HH:mm:ss');

export { decimalString };
