import inquirer from 'inquirer';
import { z } from 'zod';
import { DeliveryBatch, BaseCostNumPackages, BaseCostNumPackagesSchema, Package, PackageSchema} from '../schemas/package.schema';
import { CalculateCostService } from '../services/calculateCostService';
import { loadCouponConfig, loadRateConfig } from '../utils/configLoader';
import { Bill } from '../schemas/bill.schema';

export class CalculateCostCommand {
  private deliveryCostInput: DeliveryBatch = {
    baseDeliveryCost: 0,
    numberOfPackages: 0,
    packages: []
  };

  public async execute(): Promise<void> {
    await this.promptInitialDetails();
    await this.promptPackageDetails();
    this.displaySummary();
    this.calculateAndDisplayCosts();
  }
  
  public getDeliveryCostInput(): DeliveryBatch {
    return structuredClone(this.deliveryCostInput);
  }

  private async promptInitialDetails(): Promise<void> {
    try {
      const initialAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'initialDetails',
          message: 'Enter base_delivery_cost and no_of_packages (e.g., "100 3"):',
          validate: validateInitialDetails
        }
      ]);

      const parsedInput = processInitialDetails(initialAnswer.initialDetails);
      this.deliveryCostInput.baseDeliveryCost = parsedInput.baseDeliveryCost;
      this.deliveryCostInput.numberOfPackages = parsedInput.numberOfPackages;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  private async promptPackageDetails(): Promise<void> {
    for (let i = 0; i < this.deliveryCostInput.numberOfPackages; i++) {
      await this.promptSinglePackageDetails(i + 1);
    }
    this.displaySummary();
  }

  private async promptSinglePackageDetails(packageNumber: number): Promise<void> {
    try {
      const packageAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'packageDetails',
          message: `Enter details for package ${packageNumber} (pkg_id pkg_weight_in_kg distance_in_km offer_code):`,
          validate: validatePackageDetails
        }
      ]);

      const packageData = processPackageDetails(packageAnswer.packageDetails);
      this.deliveryCostInput.packages.push(packageData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.format());
      } else {
        console.error('Error:', error);
      }
      throw error;
    }
  }

  private displaySummary(): void {
    console.log('\nPackage Summary:');
    console.log(`Base Delivery Cost: ${this.deliveryCostInput.baseDeliveryCost}`);
    console.log(`Number of Packages: ${this.deliveryCostInput.packages.length}`);

    console.log('\nPackage Details:');

    // Create table header
    const header = '| Package ID | Weight (kg) | Distance (km) | Offer Code |';
    const separator = '|------------|-------------|---------------|------------|';

    console.log(header);
    console.log(separator);

    // Display each package in a table row
    this.deliveryCostInput.packages.forEach((pkg) => {
      const offerCode = pkg.offerCode || 'N/A';
      console.log(`| ${pkg.packageId.padEnd(10)} | ${pkg.weight.toString().padEnd(11)} | ${pkg.distance.toString().padEnd(13)} | ${offerCode.padEnd(10)} |`);
    });
  }

  private calculateAndDisplayCosts(): void {
    try {
      // Load configurations
      const couponConfig = loadCouponConfig();
      const rateConfig = loadRateConfig();
      
      // Create service instance
      const calculateCostService = new CalculateCostService(couponConfig, rateConfig, this.deliveryCostInput);
      
      // Calculate bills
      const bills = calculateCostService.calculateBill();
      
      // Display results
      console.log('\nCost Calculation Results:');
      console.log('| Package ID | Discount | Total Cost |');
      console.log('|------------|----------|------------|');
      
      bills.forEach(bill => {
        console.log(`| ${bill.packageId.padEnd(10)} | ${bill.discount.toFixed(2).padEnd(8)} | ${bill.totalCost.toFixed(2).padEnd(10)} |`);
      });
    } catch (error) {
      console.error('Error calculating costs:', error);
    }
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