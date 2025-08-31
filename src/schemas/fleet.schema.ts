import { z } from 'zod';

export const FleetCapacitySchema = z.object({
  numberOfVehicles: z.number().int().positive('Number of vehicles must be a positive integer'),
  maxSpeed: z.number().positive('Maximum speed must be a positive number'),
  maxCarriableWeight: z.number().positive('Maximum carriable weight must be a positive number'),
});

export type FleetCapacity = z.infer<typeof FleetCapacitySchema>;
