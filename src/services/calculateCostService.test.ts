import { calculateBill, calculateCostBeforeDiscount, shouldDiscountApply, calculateDiscount } from './calculateCostService';
import { CouponConfig, ConditionParam, ConditionType } from '../schemas/coupon.schema';
import { RateConfig } from '../schemas/rate.schema';
import { DeliveryBatch, Package } from '../schemas/package.schema';

// Mock process.exit to prevent tests from exiting
jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

describe('CalculateCostService', () => {
  // Test data
  const mockCouponConfig: CouponConfig = {
    coupons: [
      {
        code: 'OFR001',
        pattern: '^OFR[0-9]{3}$',
        discount: 10,
        conditions: [
          {
            param: ConditionParam.WEIGHT,
            type: ConditionType.LESS_THAN,
            max: 10,
            unit: 'kg',
            min: undefined
          },
          {
            param: ConditionParam.DISTANCE,
            type: ConditionType.BETWEEN,
            min: 0,
            max: 20,
            unit: 'km'
          }
        ]
      }
    ],
    validationRules: {
      combinedCoupons: false
    }
  };

  const mockRateConfig: RateConfig = {
    weight: 10,
    distance: 5
  };

  const mockDeliveryBatch: DeliveryBatch = {
    baseDeliveryCost: 100,
    numberOfPackages: 1,
    packages: [
      {
        packageId: 'PKG1',
        weight: 5,
        distance: 5,
        offerCode: 'OFR001'
      }
    ]
  };

  describe('constructor', () => {
    it('should calculate bill with valid configurations', () => {
      const result = calculateBill(mockCouponConfig, mockRateConfig, mockDeliveryBatch);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should throw error for invalid coupon configuration', () => {
      const invalidCouponConfig = { ...mockCouponConfig, coupons: [] };
      expect(() => calculateBill(invalidCouponConfig, mockRateConfig, mockDeliveryBatch))
        .toThrow('Invalid coupon or rate configuration');
    });

    it('should throw error for invalid rate configuration', () => {
      const invalidRateConfig = { ...mockRateConfig, weight: -5 };
      expect(() => calculateBill(mockCouponConfig, invalidRateConfig, mockDeliveryBatch))
        .toThrow('Invalid coupon or rate configuration');
    });

    it('should throw error for invalid delivery batch', () => {
      const invalidDeliveryBatch = { ...mockDeliveryBatch, packages: [{ ...mockDeliveryBatch.packages[0], weight: -5 }] };
      expect(() => calculateBill(mockCouponConfig, mockRateConfig, invalidDeliveryBatch))
        .toThrow('Invalid delivery cost input');
    });
  });

  describe('calculateBill', () => {
    it('should calculate discount correctly for valid package with matching coupon', () => {
      const result = calculateBill(mockCouponConfig, mockRateConfig, mockDeliveryBatch);
      const costBeforeDiscount = 100 + (10 * 5) + (5 * 5);
      const discountAmount = costBeforeDiscount * 10 / 100;
      const expectedTotalCost = costBeforeDiscount - discountAmount;
      const expectedBill: Package = {
        packageId: 'PKG1',
        weight: 5,
        distance: 5,
        offerCode: 'OFR001',
        discount: discountAmount,
        totalCost: expectedTotalCost
      };
      
      expect(result).toEqual([expectedBill]);
    });

    it('should not apply discount for package without matching coupon', () => {
      const batchWithoutCoupon: DeliveryBatch = {
        baseDeliveryCost: 100,
        numberOfPackages: 1,
        packages: [
          {
            packageId: 'PKG2',
            weight: 5,
            distance: 5
          }
        ]
      };
      
      const result = calculateBill(mockCouponConfig, mockRateConfig, batchWithoutCoupon);
      const costBeforeDiscount = 100 + (10 * 5) + (5 * 5);
      const expectedBill: Package = {
        packageId: 'PKG2',
        weight: 5,
        distance: 5,
        discount: 0, // No discount applied
        totalCost: costBeforeDiscount
      };
      
      expect(result).toEqual([expectedBill]);
    });
  });

  describe('calculateCostBeforeDiscount', () => {
    it('should calculate cost correctly', () => {
      const mockPackage: Package = {
        packageId: 'PKG1',
        weight: 5,
        distance: 10
      };
      
      const result = calculateCostBeforeDiscount(mockPackage, mockRateConfig, 100);
      // Expected: 100 + (10 * 5) + (5 * 10) = 100 + 50 + 50 = 200
      expect(result).toBe(200);
    });
  });

  describe('shouldDiscountApply', () => {
    it('should return true when all conditions are met', () => {
      const mockPackage: Package = {
        packageId: 'PKG1',
        weight: 5,
        distance: 10, // between 0 and 20
        offerCode: 'OFR001'
      };
      
      const result = shouldDiscountApply(mockPackage, mockCouponConfig.coupons);
      expect(result).toBe(true);
    });

    it('should return false when coupon code does not match', () => {
      const mockPackage: Package = {
        packageId: 'PKG1',
        weight: 5,
        distance: 10,
        offerCode: 'INVALID'
      };
      
      const result = shouldDiscountApply(mockPackage, mockCouponConfig.coupons);
      expect(result).toBe(false);
    });

    it('should return false when conditions are not met', () => {
      const mockPackage: Package = {
        packageId: 'PKG1',
        weight: 15, // not less than 10
        distance: 10,
        offerCode: 'OFR001'
      };
      
      const result = shouldDiscountApply(mockPackage, mockCouponConfig.coupons);
      expect(result).toBe(false);
    });

    it('should return false when no offer code is provided', () => {
      const mockPackage: Package = {
        packageId: 'PKG1',
        weight: 5,
        distance: 10
      };
      
      const result = shouldDiscountApply(mockPackage, mockCouponConfig.coupons);
      expect(result).toBe(false);
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate discount correctly', () => {
      const mockCoupon = mockCouponConfig.coupons[0];
      const result = calculateDiscount(200, mockCoupon);
      // Expected: (200 * 10 / 100) = 20 (the discount amount, not the final cost)
      expect(result).toBe(20);
    });
  });
});
