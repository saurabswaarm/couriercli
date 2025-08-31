import inquirer from 'inquirer';
import { z } from 'zod';
import { DeliveryBatch, BaseCostNumPackages, BaseCostNumPackagesSchema, Package, PackageSchema} from '../schemas/package.schema';
import { FleetCapacity, FleetCapacitySchema } from '../schemas/fleet.schema';

export class CalculateTimeCommand {
  private deliveryTimeInput: DeliveryBatch = {
    baseDeliveryCost: 0,
    numberOfPackages: 0,
    packages: []
  };
  
  private fleetCapacity: FleetCapacity = {
    numberOfVehicles: 0,
    maxSpeed: 0,
    maxCarriableWeight: 0
  };

  public async execute(): Promise<void> {
    await this.promptInitialDetails();
    await this.promptPackageDetails();
    await this.promptFleetDetails();
    this.displaySummary();
    // TODO: Implement time calculation logic
    console.log('Time calculation logic will be implemented here');
  }
  
  public getDeliveryTimeInput(): DeliveryBatch {
    return structuredClone(this.deliveryTimeInput);
  }
  
  public getFleetCapacity(): FleetCapacity {
    return structuredClone(this.fleetCapacity);
  }

  private async promptInitialDetails(): Promise<void> {
    try {
      const initialAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'initialDetails',
          message: 'Enter base delivery cost and number of packages (e.g., "100 5"):',
          validate: validateInitialDetails
        }
      ]);

      const parsedInput = processInitialDetails(initialAnswer.initialDetails);
      this.deliveryTimeInput.baseDeliveryCost = parsedInput.baseDeliveryCost;
      this.deliveryTimeInput.numberOfPackages = parsedInput.numberOfPackages;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  private async promptPackageDetails(): Promise<void> {
    for (let i = 0; i < this.deliveryTimeInput.numberOfPackages; i++) {
      await this.promptSinglePackageDetails(i + 1);
    }
    this.displayPackageSummary();
  }

  private async promptSinglePackageDetails(packageNumber: number): Promise<void> {
    try {
      const packageAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'packageDetails',
          message: `Enter package ID, package weight, distance and offer code (e.g., "PKG1 50 30 OFR001"):`,
          validate: validatePackageDetails
        }
      ]);

      const packageData = processPackageDetails(packageAnswer.packageDetails);
      this.deliveryTimeInput.packages.push(packageData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.format());
      } else {
        console.error('Error:', error);
      }
      throw error;
    }
  }
  
  private async promptFleetDetails(): Promise<void> {
    try {
      const fleetAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'fleetDetails',
          message: 'Enter the number of vehicles, the average max speed and average max carriable weight (e.g., "2 70 200"):',
          validate: validateFleetDetails
        }
      ]);

      const fleetData = processFleetDetails(fleetAnswer.fleetDetails);
      this.fleetCapacity = fleetData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.format());
      } else {
        console.error('Error:', error);
      }
      throw error;
    }
  }

  private displayPackageSummary(): void {
    console.log('\nPackage Summary:');
    console.log(`Base Delivery Cost: ${this.deliveryTimeInput.baseDeliveryCost}`);
    console.log(`Number of Packages: ${this.deliveryTimeInput.packages.length}`);

    console.log('\nPackage Details:');

    // Create table header
    const header = '| Package ID | Weight (kg) | Distance (km) | Offer Code |';
    const separator = '|------------|-------------|---------------|------------|';

    console.log(header);
    console.log(separator);

    // Display each package in a table row
    this.deliveryTimeInput.packages.forEach((pkg) => {
      const offerCode = pkg.offerCode || 'N/A';
      console.log(`| ${pkg.packageId.padEnd(10)} | ${pkg.weight.toString().padEnd(11)} | ${pkg.distance.toString().padEnd(13)} | ${offerCode.padEnd(10)} |`);
    });
  }
  
  private displaySummary(): void {
    this.displayPackageSummary();
    
    console.log('\nFleet Details:');
    console.log(`Number of Vehicles: ${this.fleetCapacity.numberOfVehicles}`);
    console.log(`Max Speed: ${this.fleetCapacity.maxSpeed} km/hr`);
    console.log(`Max Carriable Weight: ${this.fleetCapacity.maxCarriableWeight} kg`);
  }
}

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
