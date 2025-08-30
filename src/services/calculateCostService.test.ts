import { CalculateCostService, calculateCostBeforeDiscount, shouldDiscountApply, calculateDiscount } from './calculateCostService';
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
    it('should create an instance with valid configurations', () => {
      const service = new CalculateCostService(mockCouponConfig, mockRateConfig, mockDeliveryBatch);
      expect(service).toBeInstanceOf(CalculateCostService);
    });

    it('should throw error for invalid coupon configuration', () => {
      const invalidCouponConfig = { ...mockCouponConfig, coupons: [] };
      expect(() => new CalculateCostService(invalidCouponConfig, mockRateConfig, mockDeliveryBatch))
        .toThrow('Invalid coupon or rate configuration');
    });

    it('should throw error for invalid rate configuration', () => {
      const invalidRateConfig = { ...mockRateConfig, weight: -5 };
      expect(() => new CalculateCostService(mockCouponConfig, invalidRateConfig, mockDeliveryBatch))
        .toThrow('Invalid coupon or rate configuration');
    });

    it('should throw error for invalid delivery batch', () => {
      const invalidDeliveryBatch = { ...mockDeliveryBatch, packages: [{ ...mockDeliveryBatch.packages[0], weight: -5 }] };
      expect(() => new CalculateCostService(mockCouponConfig, mockRateConfig, invalidDeliveryBatch))
        .toThrow('Invalid delivery cost input');
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate discount correctly for valid package with matching coupon', () => {
      const service = new CalculateCostService(mockCouponConfig, mockRateConfig, mockDeliveryBatch);
      const result = service.calculateDiscount();
      
      // Calculate expected cost manually
      const costBeforeDiscount = 100 + (10 * 5) + (5 * 5); // base + weight*rate + distance*rate = 100 + 50 + 25 = 175
      const expectedDiscount = costBeforeDiscount - (costBeforeDiscount * 10 / 100); // 175 - 17.5 = 157.5
      
      expect(result).toEqual([`PKG1 5 5 ${expectedDiscount}`]);
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
      
      const service = new CalculateCostService(mockCouponConfig, mockRateConfig, batchWithoutCoupon);
      const result = service.calculateDiscount();
      
      // Calculate expected cost manually
      const costBeforeDiscount = 100 + (10 * 5) + (5 * 5); // base + weight*rate + distance*rate = 100 + 50 + 25 = 175
      
      expect(result).toEqual([`PKG2 5 5 ${costBeforeDiscount}`]);
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
        weight: 5, // less than 10
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
      // Expected: 200 - (200 * 10 / 100) = 200 - 20 = 180
      expect(result).toBe(180);
    });
  });
});
