import { z } from 'zod';
import { PackageSchema } from './package.schema';

export const ShipmentSchema = z.object({
  packages: z.array(PackageSchema),
  totalWeight: z.number().min(0, 'Total weight must be a non-negative number'),
  totalDeliveryTime: z.number().min(0, 'Total delivery time must be a non-negative number'),
});

export type Shipment = z.infer<typeof ShipmentSchema>;
