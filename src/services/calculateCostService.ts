import { ConditionType, CouponConfig, CouponConfigSchema, isLessThanCondition, isGreaterThanCondition, isBetweenCondition, Coupon } from '../schemas/coupon.schema';
import { RateConfig, RateConfigSchema } from '../schemas/rate.schema';
import { DeliveryBatch, DeliveryBatchSchema, Package } from '../schemas/package.schema';

export class CalculateCostService {
  private couponConfig: CouponConfig;
  private rateConfig: RateConfig;
  private deliveryBatch: DeliveryBatch;

  constructor(
    couponConfig: CouponConfig,
    rateConfig: RateConfig,
    deliveryBatch: DeliveryBatch
  ) {
    const couponValidation = CouponConfigSchema.safeParse(couponConfig);
    const rateValidation = RateConfigSchema.safeParse(rateConfig);

    if (!couponValidation.success || !rateValidation.success) {
      throw new Error('Invalid coupon or rate configuration');
    }

    const deliveryValidation = DeliveryBatchSchema.safeParse(deliveryBatch);

    if (!deliveryValidation.success) {
      throw new Error('Invalid delivery cost input');
    }

    this.couponConfig = couponConfig;
    this.rateConfig = rateConfig;
    this.deliveryBatch = deliveryBatch;
  }

  public calculateDiscount(costBeforeDiscount: number, offerCode: string, coupons: Coupon[]): number {
    const coupon = coupons.find((coupon) => coupon.code === offerCode);
    if (!coupon) {
      return costBeforeDiscount;
    }

    // TODO: Implement discount calculation logic
    return costBeforeDiscount;
  }

}

// pure function
function calculateCostBeforeDiscount(singlePackage: Package, rateConfig: RateConfig, baseDeliveryCost: number): number {
    return baseDeliveryCost + rateConfig.weight * singlePackage.weight + rateConfig.distance * singlePackage.distance;
}

// pure function
function shouldDiscountApply(singlePackage: Package, offerCode: string, coupons: Coupon[]): boolean {
    const coupon = coupons.find((coupon) => coupon.code === offerCode);

    if (!coupon) {
      return false;
    }

    const conditions = coupon.conditions;
    const allConditionsMet = conditions.every((condition) => {
      const value = singlePackage[condition.param];
      if (isLessThanCondition(condition)) {
        return value < condition.max;
      }
      if (isGreaterThanCondition(condition)) {
        return value > condition.min;
      }
      if (isBetweenCondition(condition)) {
        return value >= condition.min && value <= condition.max;
      }
      return false;
    });

    return allConditionsMet;
}