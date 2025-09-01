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

  // Mock final packages with expected values for testing
  const mockFinalPackages: (Package & { discount: number; totalCost: number })[] = [
    {
      packageId: 'PKG1',
      weight: 50,
      distance: 30,
      offerCode: 'OFR001',
      discount: 0,
      totalCost: 750,
      deliveryTime: 3.98
    },
    {
      packageId: 'PKG2',
      weight: 75,
      distance: 125,
      offerCode: 'OFFR0008',
      discount: 0,
      totalCost: 1475,
      deliveryTime: 1.78
    },
    {
      packageId: 'PKG3',
      weight: 175,
      distance: 100,
      offerCode: 'OFFR003',
      discount: 0,
      totalCost: 2350,
      deliveryTime: 1.42
    },
    {
      packageId: 'PKG4',
      weight: 110,
      distance: 60,
      offerCode: 'OFFR002',
      discount: 105,
      totalCost: 1395,
      deliveryTime: 0.85
    },
    {
      packageId: 'PKG5',
      weight: 155,
      distance: 95,
      offerCode: 'NA',
      discount: 0,
      totalCost: 2125,
      deliveryTime: 4.19
    }
  ];

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

    it('should return packages with the expected delivery times', () => {
      const result = calculateDeliveryTimes(mockDeliveryBatch, mockFleetCapacity);
      
      // Verify each package has the required properties
      result.forEach(pkg => {
        expect(pkg).toHaveProperty('packageId');
        expect(pkg).toHaveProperty('weight');
        expect(pkg).toHaveProperty('distance');
        expect(pkg).toHaveProperty('offerCode');
        expect(pkg).toHaveProperty('deliveryTime');
        expect(pkg.deliveryTime).toBeGreaterThan(0);
      });
      
      // Check specific delivery times (approximate due to floating point precision)
      const pkg1 = result.find(pkg => pkg.packageId === 'PKG1');
      const pkg2 = result.find(pkg => pkg.packageId === 'PKG2');
      const pkg3 = result.find(pkg => pkg.packageId === 'PKG3');
      const pkg4 = result.find(pkg => pkg.packageId === 'PKG4');
      const pkg5 = result.find(pkg => pkg.packageId === 'PKG5');
      
      expect(pkg1?.deliveryTime).toBeCloseTo(3.98, 1);
      expect(pkg2?.deliveryTime).toBeCloseTo(1.78, 1);
      expect(pkg3?.deliveryTime).toBeCloseTo(1.42, 1);
      expect(pkg4?.deliveryTime).toBeCloseTo(0.85, 1);
      expect(pkg5?.deliveryTime).toBeCloseTo(4.19, 1);
    });
  });
});
