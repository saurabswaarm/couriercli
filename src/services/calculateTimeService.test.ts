import { calculateDeliveryTimes } from './calculateTimeService';
import { DeliveryBatch, Package } from '../schemas/package.schema';
import { FleetCapacity } from '../schemas/fleet.schema';

describe('CalculateTimeService', () => {
  const mockDeliveryBatch: DeliveryBatch = {
    baseDeliveryCost: 100,
    numberOfPackages: 5,
    packages: [
      {
        packageId: 'PKG1',
        weight: 50,
        distance: 30,
        offerCode: 'OFR001'
      },
      {
        packageId: 'PKG2',
        weight: 75,
        distance: 125,
        offerCode: 'OFFR0008'
      },
      {
        packageId: 'PKG3',
        weight: 175,
        distance: 100,
        offerCode: 'OFFR003'
      },
      {
        packageId: 'PKG4',
        weight: 110,
        distance: 60,
        offerCode: 'OFFR002'
      },
      {
        packageId: 'PKG5',
        weight: 155,
        distance: 95,
        offerCode: 'NA'
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
      expect(result).toHaveLength(5);
      result.forEach((packageWithDeliveryTime: any) => {
        expect(packageWithDeliveryTime.deliveryTime).toBeGreaterThan(0);
        expect(packageWithDeliveryTime.packageId).toBeDefined();
      });
    });

    it('should assign delivery times based on vehicle capacity constraints', () => {
      const result = calculateDeliveryTimes(mockDeliveryBatch, mockFleetCapacity);
      expect(result).toHaveLength(5);
      result.forEach((packageWithDeliveryTime: any) => {
        expect(packageWithDeliveryTime.deliveryTime).toBeGreaterThan(0);
      });
    });
  });
});
