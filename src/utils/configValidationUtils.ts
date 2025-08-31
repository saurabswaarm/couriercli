import { CouponConfig, CouponConfigSchema } from '../schemas/coupon.schema';
import { RateConfig, RateConfigSchema } from '../schemas/rate.schema';
import { DeliveryBatch, DeliveryBatchSchema } from '../schemas/package.schema';

/**
 * Validates coupon and rate configurations
 * @param couponConfig - The coupon configuration to validate
 * @param rateConfig - The rate configuration to validate
 * @throws Error if either configuration is invalid
 */
export function validateConfigurations(
  couponConfig: CouponConfig,
  rateConfig: RateConfig
): void {
  const couponValidation = CouponConfigSchema.safeParse(couponConfig);
  const rateValidation = RateConfigSchema.safeParse(rateConfig);

  if (!couponValidation.success || !rateValidation.success) {
    throw new Error('Invalid coupon or rate configuration');
  }
}