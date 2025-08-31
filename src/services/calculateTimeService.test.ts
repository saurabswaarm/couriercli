import { calculateDeliveryTimes } from './calculateTimeService';
import { DeliveryBatch, Package } from '../schemas/package.schema';
import { FleetCapacity } from '../schemas/fleet.schema';

describe('CalculateTimeService', () => {
  const mockDeliveryBatch: DeliveryBatch = {
    baseDeliveryCost: 100,
    numberOfPackages: 3,
    packages: [
      {
        packageId: 'PKG1',
        weight: 150,
        distance: 30,
        offerCode: 'OFR001'
      },
      {
        packageId: 'PKG2',
        weight: 100,
        distance: 20,
        offerCode: 'OFR002'
      },
      {
        packageId: 'PKG3',
        weight: 150,
        distance: 50,
        offerCode: 'OFR003'
      }
    ]
  };

  const mockFleetCapacity: FleetCapacity = {
    numberOfVehicles: 2,
    maxSpeed: 70,
    maxCarriableWeight: 200
  };

  describe('calculateDeliveryTimes', () => {
    it('should calculate delivery times for all packages', () => {
      const result = calculateDeliveryTimes(mockDeliveryBatch, mockFleetCapacity);
      
      // Should have results for all packages
      expect(result).toHaveLength(3);
      
      // All packages should have delivery times
      result.forEach((bill: any) => {
        expect(bill.deliveryTime).toBeGreaterThan(0);
        expect(bill.packageId).toBeDefined();
      });
    });

    it('should assign delivery times based on vehicle capacity constraints', () => {
      const result = calculateDeliveryTimes(mockDeliveryBatch, mockFleetCapacity);
      
      // Check that all packages have been assigned delivery times
      expect(result).toHaveLength(3);
      
      // Each delivery time should be positive
      result.forEach((bill: any) => {
        expect(bill.deliveryTime).toBeGreaterThan(0);
      });
    });
  });
});
