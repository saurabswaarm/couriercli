import { z } from 'zod';
import { BaseCostNumPackages, BaseCostNumPackagesSchema, Package, PackageSchema } from '../schemas/package.schema';
import { FleetCapacity, FleetCapacitySchema } from '../schemas/fleet.schema';

/**
 * Processes the initial details input (base delivery cost and number of packages)
 * @param input - The input string to process
 * @returns Parsed BaseCostNumPackages object
 */
export function processInitialDetails(input: string): BaseCostNumPackages {
  if (!input) {
    throw new Error('Input is required');
  }
  
  const [baseDeliveryCostStr, numberOfPackagesStr] = input.trim().split(/\s+/);

  return BaseCostNumPackagesSchema.parse({
    baseDeliveryCost: Number(baseDeliveryCostStr),
    numberOfPackages: Number(numberOfPackagesStr)
  });
}

/**
 * Processes package details input (ID, weight, distance, optional offer code)
 * @param input - The input string to process
 * @returns Parsed Package object
 */
export function processPackageDetails(input: string): Package {
  const parts = input.trim().split(/\s+/);
  const packageId = parts[0];
  const weight = Number(parts[1]);
  const distance = Number(parts[2]);
  const offerCode = parts.length > 3 ? parts[3] : undefined;

  return PackageSchema.parse({
    packageId,
    weight,
    distance,
    offerCode
  });
}

/**
 * Processes fleet details input (number of vehicles, max speed, max carriable weight)
 * @param input - The input string to process
 * @returns Parsed FleetCapacity object
 */
export function processFleetDetails(input: string): FleetCapacity {
  if (!input) {
    throw new Error('Input is required');
  }
  
  const [numberOfVehiclesStr, maxSpeedStr, maxCarriableWeightStr] = input.trim().split(/\s+/);

  return FleetCapacitySchema.parse({
    numberOfVehicles: Number(numberOfVehiclesStr),
    maxSpeed: Number(maxSpeedStr),
    maxCarriableWeight: Number(maxCarriableWeightStr)
  });
}
