import { z } from 'zod';
import { BaseCostNumPackagesSchema, PackageSchema } from '../schemas/package.schema';
import { FleetCapacitySchema } from '../schemas/fleet.schema';

/**
 * Validates the initial details input (base delivery cost and number of packages)
 * @param input - The input string to validate
 * @returns true if valid, error message if invalid
 */
export function validateInitialDetails(input: string): boolean | string {
  const parts = input.trim().split(/\s+/);
  if (parts.length !== 2) {
    return 'Please provide both base delivery cost and number of packages separated by a space.';
  }

  const baseDeliveryCost = Number(parts[0]);
  const numberOfPackages = Number(parts[1]);

  if (input === "quit") {
    console.log('Exiting...');
    process.exit(0);
  }

  // Use Zod schema for validation
  const result = BaseCostNumPackagesSchema.safeParse({
    baseDeliveryCost,
    numberOfPackages
  });

  if (!result.success) {
    // Return the first error message
    throw result.error.issues[0].message;
  }

  return true;
}

/**
 * Validates package details input (ID, weight, distance, optional offer code)
 * @param input - The input string to validate
 * @returns true if valid, error message if invalid
 */
export function validatePackageDetails(input: string): boolean | string {
  const parts = input.trim().split(/\s+/);
  if (parts.length < 3 || parts.length > 4) {
    return 'Please provide package ID, weight, distance, and optional offer code.';
  }

  const packageId = parts[0];
  const weight = Number(parts[1]);
  const distance = Number(parts[2]);
  const offerCode = parts.length > 3 ? parts[3] : undefined;

  const result = PackageSchema.safeParse({
    packageId,
    weight,
    distance,
    offerCode
  });

  if (!result.success) {
    throw result.error.issues[0].message;
  }

  return true;
}

/**
 * Validates fleet details input (number of vehicles, max speed, max carriable weight)
 * @param input - The input string to validate
 * @returns true if valid, error message if invalid
 */
export function validateFleetDetails(input: string): boolean | string {
  const parts = input.trim().split(/\s+/);
  if (parts.length !== 3) {
    return 'Please provide number of vehicles, max speed, and max carriable weight separated by spaces.';
  }

  const numberOfVehicles = Number(parts[0]);
  const maxSpeed = Number(parts[1]);
  const maxCarriableWeight = Number(parts[2]);

  const result = FleetCapacitySchema.safeParse({
    numberOfVehicles,
    maxSpeed,
    maxCarriableWeight
  });

  if (!result.success) {
    throw result.error.issues[0].message;
  }

  return true;
}
