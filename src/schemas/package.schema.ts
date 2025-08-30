import { z } from 'zod';

export const PackageSchema = z.object({
  packageId: z.string().min(1, 'Package ID is required'),
  weight: z.number().positive('Weight must be a positive number'),
  distance: z.number().positive('Distance must be a positive number'),
  offerCode: z.string().optional(),
});

export type Package = z.infer<typeof PackageSchema>;

export const InitialInputSchema = z.object({
  baseDeliveryCost: z.number().positive('Base delivery cost must be a positive number'),
  numberOfPackages: z.number().int().positive('Number of packages must be a positive integer'),
});

export type InitialInput = z.infer<typeof InitialInputSchema>;

export const DeliveryCostInputSchema = z.object({
  baseDeliveryCost: z.number().positive('Base delivery cost must be a positive number'),
  numberOfPackages: z.number().int().positive('Number of packages must be a positive integer'),
  packages: z.array(PackageSchema),
});

export type DeliveryCostInput = z.infer<typeof DeliveryCostInputSchema>;

