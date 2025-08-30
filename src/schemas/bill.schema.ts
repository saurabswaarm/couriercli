import { z } from 'zod';

export const BillSchema = z.object({
  packageId: z.string().min(1, 'Package ID is required'),
  discount: z.number().min(0, 'Discount must be a non-negative number'),
  totalCost: z.number().min(0, 'Total cost must be a non-negative number'),
});

export type Bill = z.infer<typeof BillSchema>;
