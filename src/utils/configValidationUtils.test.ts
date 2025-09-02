import { validateConfigurations } from './configValidationUtils';
import { ConditionParam, ConditionType } from '../schemas/coupon.schema';

describe('configValidationUtils', () => {
  describe('validateConfigurations', () => {
    const validCouponConfig = {
      coupons: [
        {
          code: 'OFR001',
          pattern: '^OFR[0-9]{3}$',
          discount: 10,
          conditions: [
            {
              param: 'distance' as ConditionParam,
              type: ConditionType.LESS_THAN as const,
              max: 200,
              unit: 'km',
              min: undefined
            }
          ]
        }
      ],
      validationRules: {
        combinedCoupons: false
      }
    };

    const validRateConfig = {
      weight: 10,
      distance: 5
    };

    it('should not throw error for valid configurations', () => {
      expect(() => validateConfigurations(validCouponConfig, validRateConfig)).not.toThrow();
    });

    it('should throw error for invalid coupon configuration', () => {
      const invalidCouponConfig = {
        coupons: [
          {
            code: '', // Invalid: empty code
            pattern: '^OFR[0-9]{3}$',
            discount: 10,
            conditions: [
              {
                param: 'distance' as ConditionParam,
                type: ConditionType.LESS_THAN as const,
                max: 200,
                unit: 'km',
                min: undefined
              }
            ]
          }
        ],
        validationRules: {
          combinedCoupons: false
        }
      };

      expect(() => validateConfigurations(invalidCouponConfig, validRateConfig)).toThrow('Invalid coupon or rate configuration');
    });

    it('should throw error for invalid rate configuration', () => {
      const invalidRateConfig = {
        weight: -10, // Invalid: negative weight
        distance: 5
      };

      expect(() => validateConfigurations(validCouponConfig, invalidRateConfig)).toThrow('Invalid coupon or rate configuration');
    });

    it('should throw error for both invalid configurations', () => {
      const invalidCouponConfig = {
        coupons: [
          {
            code: '', // Invalid: empty code
            pattern: '^OFR[0-9]{3}$',
            discount: 10,
            conditions: [
              {
                param: 'distance' as ConditionParam,
                type: ConditionType.LESS_THAN as const,
                max: 200,
                unit: 'km',
                min: undefined
              }
            ]
          }
        ],
        validationRules: {
          combinedCoupons: false
        }
      };

      const invalidRateConfig = {
        weight: -10, // Invalid: negative weight
        distance: 5
      };

      expect(() => validateConfigurations(invalidCouponConfig, invalidRateConfig)).toThrow('Invalid coupon or rate configuration');
    });
  });
});
