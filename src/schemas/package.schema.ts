import { z } from 'zod';

export const PackageSchema = z.object({
  packageId: z.string().min(1, 'Package ID is required'),
  weight: z.number().positive('Weight must be a positive number'),
  distance: z.number().positive('Distance must be a positive number'),
  offerCode: z.string().optional(),
});


export const BaseCostNumPackagesSchema = z.object({
  baseDeliveryCost: z.number().min(0, 'Base delivery cost must be a positive number'),
  numberOfPackages: z.number().int().positive('Number of packages must be a positive integer'),
});


export const DeliveryBatchSchema = z.object({
  baseDeliveryCost: BaseCostNumPackagesSchema.shape.baseDeliveryCost,
  numberOfPackages: BaseCostNumPackagesSchema.shape.numberOfPackages,
  packages: z.array(PackageSchema),
});

export type DeliveryBatch = z.infer<typeof DeliveryBatchSchema>;
export type BaseCostNumPackages = z.infer<typeof BaseCostNumPackagesSchema>;
export type Package = z.infer<typeof PackageSchema>;
