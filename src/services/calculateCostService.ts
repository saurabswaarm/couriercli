import { CouponConfig, CouponConfigSchema, isLessThanCondition, isGreaterThanCondition, isBetweenCondition, Coupon } from '../schemas/coupon.schema';
import { RateConfig, RateConfigSchema } from '../schemas/rate.schema';
import { DeliveryBatch, DeliveryBatchSchema, Package, PackageSchema, PackageWithCost } from '../schemas/package.schema';

export function calculateBill(
  couponConfig: CouponConfig,
  rateConfig: RateConfig,
  deliveryBatch: DeliveryBatch
): PackageWithCost[] {
  const couponValidation = CouponConfigSchema.safeParse(couponConfig);
  const rateValidation = RateConfigSchema.safeParse(rateConfig);

  if (!couponValidation.success || !rateValidation.success) {
    throw new Error('Invalid coupon or rate configuration');
  }

  const deliveryValidation = DeliveryBatchSchema.safeParse(deliveryBatch);

  if (!deliveryValidation.success) {
    throw new Error('Invalid delivery cost input');
  }

  const discountedList = deliveryBatch.packages.map((singlePackage) => 
    calculateSingleBill(singlePackage, couponConfig, rateConfig, deliveryBatch.baseDeliveryCost)
  );
  
  return discountedList;
}

export function calculateSingleBill(
  singlePackage: Package,
  couponConfig: CouponConfig,
  rateConfig: RateConfig,
  baseDeliveryCost: number
): Package {
  const costBeforeDiscount = calculateCostBeforeDiscount(singlePackage, rateConfig, baseDeliveryCost);
  const discount = shouldDiscountApply(singlePackage, couponConfig.coupons) ? calculateDiscount(costBeforeDiscount, couponConfig.coupons.find(coupon => coupon.code === singlePackage.offerCode)) : 0;
  const costAfterDiscount = costBeforeDiscount - discount;
  
  const packageWithCost: Package = {
    packageId: singlePackage.packageId,
    weight: singlePackage.weight,
    distance: singlePackage.distance,
    offerCode: singlePackage.offerCode,
    discount: discount,
    totalCost: costAfterDiscount,
  };
  
  const packageValidation = PackageSchema.safeParse(packageWithCost);
  if (!packageValidation.success) {
    throw new Error('Invalid package with cost generated');
  }
  
  return packageWithCost;
}

export function calculateCostBeforeDiscount(singlePackage: Package, rateConfig: RateConfig, baseDeliveryCost: number): number {
    return baseDeliveryCost + rateConfig.weight * singlePackage.weight + rateConfig.distance * singlePackage.distance;
}

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

export function calculateDiscount(costBeforeDiscount: number, coupon?: Coupon): number {
    if (!coupon) {
      return 0;
    }
    return (costBeforeDiscount * coupon.discount / 100);
}
