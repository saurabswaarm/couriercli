import { z } from 'zod';

export const PackageSchema = z.object({
  packageId: z.string().min(1, 'Package ID is required'),
  weight: z.number().positive('Weight must be a positive number'),
  distance: z.number().positive('Distance must be a positive number'),
  offerCode: z.string().optional(),
  discount: z.number().min(0, 'Discount must be a non-negative number').optional(),
  totalCost: z.number().min(0, 'Total cost must be a non-negative number').optional(),
  deliveryTime: z.number().min(0.01, 'Delivery time must be a non-zero non-negative number').optional(),
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

// Define a refined schema for packages with discount and totalCost
export const PackageWithCostSchema = PackageSchema.refine(
  (data) => data.discount !== undefined && data.totalCost !== undefined,
  {
    message: 'Package must have both discount and totalCost',
    path: ['discount', 'totalCost'], // This will highlight both fields in error messages
  }
);

// Type guard function to check if a package has both discount and totalCost
export function hasDiscountAndTotalCost(pkg: Package): pkg is Package & { discount: number; totalCost: number } {
  return pkg.discount !== undefined && pkg.totalCost !== undefined;
}

// Define a refined schema for packages with deliveryTime
export const PackageWithDeliveryTimeSchema = PackageSchema.refine(
  (data) => data.deliveryTime !== undefined,
  {
    message: 'Package must have deliveryTime',
    path: ['deliveryTime'],
  }
);

// Type guard function to check if a package has deliveryTime
export function hasDeliveryTime(pkg: Package): pkg is Package & { deliveryTime: number } {
  return pkg.deliveryTime !== undefined;
}

export type DeliveryBatch = z.infer<typeof DeliveryBatchSchema>;
export type BaseCostNumPackages = z.infer<typeof BaseCostNumPackagesSchema>;
export type Package = z.infer<typeof PackageSchema>;
export type PackageWithCost = z.infer<typeof PackageWithCostSchema>;
export type PackageWithDeliveryTime = z.infer<typeof PackageWithDeliveryTimeSchema>;
