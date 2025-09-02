import * as fs from 'fs';
import * as path from 'path';
import { ConfigLoader, loadCouponConfig, loadRateConfig } from './configLoader';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

// Mock path module
jest.mock('path');
const mockPath = path as jest.Mocked<typeof path>;

describe('ConfigLoader', () => {
  const mockCouponConfig = {
    coupons: [
      {
        code: 'OFR001',
        pattern: '^OFR[0-9]{3}$',
        discount: 10,
        conditions: [
          {
            param: 'distance',
            type: 'lessThan',
            max: 200,
            unit: 'km'
          }
        ]
      }
    ],
    validationRules: {
      combinedCoupons: false
    }
  };

  const mockRateConfig = {
    weight: 10,
    distance: 5
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadCouponConfig', () => {
    it('should load and parse coupon config correctly', () => {
      // Mock path.join to return a fixed path
      mockPath.join.mockImplementation((...paths) => paths.join('/'));
      
      // Mock fs.readFileSync to return JSON string
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockCouponConfig));
      
      const result = loadCouponConfig();
      
      expect(mockPath.join).toHaveBeenCalledWith(__dirname, '../../configs/coupon-config.json');
      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        '/Users/saurabsalhotra/couriercli/src/utils/../../configs/coupon-config.json',
        'utf-8'
      );
      expect(result).toEqual(mockCouponConfig);
    });

    it('should throw error when config file is invalid JSON', () => {
      mockPath.join.mockImplementation((...paths) => paths.join('/'));
      mockFs.readFileSync.mockReturnValue('invalid json');
      
      expect(() => loadCouponConfig()).toThrow();
    });
  });

  describe('loadRateConfig', () => {
    it('should load and parse rate config correctly', () => {
      mockPath.join.mockImplementation((...paths) => paths.join('/'));
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockRateConfig));
      
      const result = loadRateConfig();
      
      expect(mockPath.join).toHaveBeenCalledWith(__dirname, '../../configs/rate-config.json');
      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        '/Users/saurabsalhotra/couriercli/src/utils/../../configs/rate-config.json',
        'utf-8'
      );
      expect(result).toEqual(mockRateConfig);
    });

    it('should throw error when config file is invalid JSON', () => {
      mockPath.join.mockImplementation((...paths) => paths.join('/'));
      mockFs.readFileSync.mockReturnValue('invalid json');
      
      expect(() => loadRateConfig()).toThrow();
    });
  });

  describe('ConfigLoader static methods', () => {
    it('should load coupon config through static method', () => {
      mockPath.join.mockImplementation((...paths) => paths.join('/'));
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockCouponConfig));
      
      const result = ConfigLoader.loadCouponConfig();
      expect(result).toEqual(mockCouponConfig);
    });

    it('should load rate config through static method', () => {
      mockPath.join.mockImplementation((...paths) => paths.join('/'));
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockRateConfig));
      
      const result = ConfigLoader.loadRateConfig();
      expect(result).toEqual(mockRateConfig);
    });
  });
});
