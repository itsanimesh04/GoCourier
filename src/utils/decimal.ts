import { z } from 'zod';

const decimalPattern = /^\d+(\.\d{1,2})?$/;

export const decimalString = z
  .union([
    z.string().trim().regex(decimalPattern, 'Must be a decimal with up to 2 fractional digits'),
    z.number().finite().nonnegative()
  ])
  .transform((value) => String(value));
