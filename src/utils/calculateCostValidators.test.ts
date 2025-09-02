import { validateInitialDetails, validatePackageDetails, validateFleetDetails } from '../utils/validationUtils';
import { processInitialDetails, processPackageDetails, processFleetDetails } from '../utils/processingUtils';
import { DeliveryBatchSchema, PackageSchema } from '../schemas/package.schema';

// Mock process.exit to prevent tests from exiting
jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

describe('calculatecost.command validators', () => {
  describe('validateInitialDetails', () => {
    it('should return true for valid input', () => {
      const result = validateInitialDetails('100 3');
      expect(result).toBe(true);
    });

    it('should return error message for input with wrong number of parts', () => {
      const result = validateInitialDetails('100');
      expect(result).toBe('Please provide both base delivery cost and number of packages separated by a space.');
    });

    it('should throw error for negative base delivery cost', () => {
      expect(() => validateInitialDetails('-100 3')).toThrow('Base delivery cost must be a positive number');
    });

    it('should throw error for negative number of packages', () => {
      expect(() => validateInitialDetails('100 -3')).toThrow('Number of packages must be a positive integer');
    });

    it('should throw error for non-integer number of packages', () => {
      expect(() => validateInitialDetails('100 3.5')).toThrow('Invalid input: expected int, received number');
    });

    it('should throw error for zero packages', () => {
      expect(() => validateInitialDetails('100 0')).toThrow('Number of packages must be a positive integer');
    });
    it('should not throw error for zero base delivery cost', () => {
      expect(() => validateInitialDetails('0 3')).not.toThrow();
    });
  });

  describe('validatePackageDetails', () => {
    it('should return true for valid input with offer code', () => {
      const result = validatePackageDetails('PKG1 5 5 OFR001');
      expect(result).toBe(true);
    });

    it('should return true for valid input without offer code', () => {
      const result = validatePackageDetails('PKG1 5 5');
      expect(result).toBe(true);
    });

    it('should return error message for input with too few parts', () => {
      const result = validatePackageDetails('PKG1 5');
      expect(result).toBe('Please provide package ID, weight, distance, and optional offer code.');
    });

    it('should return error message for input with too many parts', () => {
      const result = validatePackageDetails('PKG1 5 5 OFR001 EXTRA');
      expect(result).toBe('Please provide package ID, weight, distance, and optional offer code.');
    });

    it('should throw error for negative weight', () => {
      expect(() => validatePackageDetails('PKG1 -5 5 OFR001')).toThrow('Weight must be a positive number');
    });

    it('should throw error for negative distance', () => {
      expect(() => validatePackageDetails('PKG1 5 -5 OFR001')).toThrow('Distance must be a positive number');
    });

    it('should throw error for zero values', () => {
      expect(() => validatePackageDetails('PKG1 0 0 OFR001')).toThrow('Weight must be a positive number');
    });

    it('should throw error for empty package ID', () => {
      expect(() => validatePackageDetails(' 5 5 OFR001')).toThrow('Invalid input: expected number, received NaN');
    });
  });

  describe('processInitialDetails', () => {
    it('should correctly parse valid input', () => {
      const result = processInitialDetails('100 3');
      expect(result).toEqual({
        baseDeliveryCost: 100,
        numberOfPackages: 3
      });
    });

    it('should correctly parse input with extra whitespace', () => {
      const result = processInitialDetails(' 100   3 ');
      expect(result).toEqual({
        baseDeliveryCost: 100,
        numberOfPackages: 3
      });
    });
  });

  describe('processPackageDetails', () => {
    it('should correctly parse valid input with offer code', () => {
      const result = processPackageDetails('PKG1 5 5 OFR001');
      expect(result).toEqual({
        packageId: 'PKG1',
        weight: 5,
        distance: 5,
        offerCode: 'OFR001'
      });
    });

    it('should correctly parse valid input without offer code', () => {
      const result = processPackageDetails('PKG1 5 5');
      expect(result).toEqual({
        packageId: 'PKG1',
        weight: 5,
        distance: 5
      });
    });

    it('should correctly parse input with extra whitespace', () => {
      const result = processPackageDetails(' PKG1  5  5  OFR001 ');
      expect(result).toEqual({
        packageId: 'PKG1',
        weight: 5,
        distance: 5,
        offerCode: 'OFR001'
      });
    });
  });

  describe('processFleetDetails', () => {
    it('should correctly parse valid input', () => {
      const result = processFleetDetails('2 70 200');
      expect(result).toEqual({
        numberOfVehicles: 2,
        maxSpeed: 70,
        maxCarriableWeight: 200
      });
    });

    it('should correctly parse input with extra whitespace', () => {
      const result = processFleetDetails(' 2  70  200 ');
      expect(result).toEqual({
        numberOfVehicles: 2,
        maxSpeed: 70,
        maxCarriableWeight: 200
      });
    });

    it('should throw error for empty input', () => {
      expect(() => processFleetDetails('')).toThrow('Input is required');
    });
  });

  describe('validateFleetDetails', () => {
    it('should return true for valid input', () => {
      const result = validateFleetDetails('2 70 200');
      expect(result).toBe(true);
    });

    it('should return error message for input with wrong number of parts', () => {
      const result = validateFleetDetails('2 70');
      expect(result).toBe('Please provide number of vehicles, max speed, and max carriable weight separated by spaces.');
    });

    it('should throw error for negative number of vehicles', () => {
      expect(() => validateFleetDetails('-2 70 200')).toThrow('Number of vehicles must be a positive integer');
    });

    it('should throw error for negative max speed', () => {
      expect(() => validateFleetDetails('2 -70 200')).toThrow('Maximum speed must be a positive number');
    });

    it('should throw error for negative max carriable weight', () => {
      expect(() => validateFleetDetails('2 70 -200')).toThrow('Maximum carriable weight must be a positive number');
    });

    it('should throw error for zero values', () => {
      expect(() => validateFleetDetails('0 70 200')).toThrow('Number of vehicles must be a positive integer');
      expect(() => validateFleetDetails('2 0 200')).toThrow('Maximum speed must be a positive number');
      expect(() => validateFleetDetails('2 70 0')).toThrow('Maximum carriable weight must be a positive number');
    });

    it('should throw error for non-integer number of vehicles', () => {
      expect(() => validateFleetDetails('2.5 70 200')).toThrow('Invalid input: expected int, received number');
    });
  });
});
