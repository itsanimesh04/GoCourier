import { z } from 'zod';
import { decimalString } from '../utils/decimal';

export const uuidParam = z.string().uuid();

export const idParamsSchema = z.object({
  params: z.object({
    id: uuidParam
  })
});

export const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Must be HH:mm or HH:mm:ss');

export { decimalString };
