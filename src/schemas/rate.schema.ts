import { z } from 'zod';

export const RateConfigSchema = z.object({
  weight: z.number().positive('Weight must be a positive number'),
  distance: z.number().positive('Distance must be a positive number'),
});

export type RateConfig = z.infer<typeof RateConfigSchema>;
