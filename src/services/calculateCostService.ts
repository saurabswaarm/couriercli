import { ConditionType, CouponConfig, CouponConfigSchema, isLessThanCondition, isGreaterThanCondition, isBetweenCondition } from '../schemas/coupon.schema';
import { RateConfig, RateConfigSchema } from '../schemas/rate.schema';
import { DeliveryCostInput, DeliveryCostInputSchema, Package } from '../schemas/package.schema';

export class CalculateCostService {
  private couponConfig: CouponConfig;
  private rateConfig: RateConfig;
  private deliveryCostInput: DeliveryCostInput;

  constructor(
    couponConfig: CouponConfig,
    rateConfig: RateConfig,
    deliveryCostInput: DeliveryCostInput
  ) {
    const couponValidation = CouponConfigSchema.safeParse(couponConfig);
    const rateValidation = RateConfigSchema.safeParse(rateConfig);

    if (!couponValidation.success || !rateValidation.success) {
      throw new Error('Invalid coupon or rate configuration');
    }

    const deliveryValidation = DeliveryCostInputSchema.safeParse(deliveryCostInput);

    if (!deliveryValidation.success) {
      throw new Error('Invalid delivery cost input');
    }

    this.couponConfig = couponConfig;
    this.rateConfig = rateConfig;
    this.deliveryCostInput = deliveryCostInput;
  }

  // pure function
  private calculateCostBeforeDiscount(singlePackage: Package, rateConfig: RateConfig, baseDeliveryCost: number): number {
    return baseDeliveryCost + rateConfig.weight * singlePackage.weight + rateConfig.distance * singlePackage.distance;
  }

  private shouldDiscountApply(singlePackage: Package, offerCode: string): boolean {
    const coupon = this.couponConfig.coupons.find((coupon) => coupon.code === offerCode);

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
    
  



  public calculateDiscount(costBeforeDiscount: number, offerCode: string): number {
    const coupon = this.couponConfig.coupons.find((coupon) => coupon.code === offerCode);
    if (!coupon) {
      return costBeforeDiscount;
    }

    // TODO: Implement discount calculation logic
    return costBeforeDiscount;
  }

}