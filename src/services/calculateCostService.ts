import { ConditionType, CouponConfig, CouponConfigSchema, isLessThanCondition, isGreaterThanCondition, isBetweenCondition, Coupon } from '../schemas/coupon.schema';
import { RateConfig, RateConfigSchema } from '../schemas/rate.schema';
import { DeliveryBatch, DeliveryBatchSchema, Package, PackageSchema } from '../schemas/package.schema';

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

  public calculateBill(): Package[] {
    const discountedList = this.deliveryBatch.packages.map((singlePackage) => {
      const costBeforeDiscount = calculateCostBeforeDiscount(singlePackage, this.rateConfig, this.deliveryBatch.baseDeliveryCost);
      const discount = shouldDiscountApply(singlePackage, this.couponConfig.coupons) ? calculateDiscount(costBeforeDiscount, this.couponConfig.coupons.find(coupon => coupon.code === singlePackage.offerCode)) : 0;
      const costAfterDiscount = costBeforeDiscount - discount;
      
      const bill: Package = {
        packageId: singlePackage.packageId,
        weight: singlePackage.weight,
        distance: singlePackage.distance,
        offerCode: singlePackage.offerCode,
        discount: discount,
        totalCost: costAfterDiscount,
      };
      
      // Validate the bill object against the schema
      const billValidation = PackageSchema.safeParse(bill);
      if (!billValidation.success) {
        throw new Error('Invalid bill generated');
      }
      
      return bill;
    });
    return discountedList;
  }

}

// pure function
export function calculateCostBeforeDiscount(singlePackage: Package, rateConfig: RateConfig, baseDeliveryCost: number): number {
    return baseDeliveryCost + rateConfig.weight * singlePackage.weight + rateConfig.distance * singlePackage.distance;
}

// pure function
export function shouldDiscountApply(singlePackage: Package, coupons: Coupon[]): boolean {
    const coupon = coupons.find((coupon) => coupon.code === singlePackage.offerCode);

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

// pure function
export function calculateDiscount(costBeforeDiscount: number, coupon?: Coupon): number {
    if (!coupon) {
      return 0;
    }
    return (costBeforeDiscount * coupon.discount / 100);
}
