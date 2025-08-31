import inquirer from 'inquirer';
import { z } from 'zod';
import { DeliveryBatch, BaseCostNumPackages, BaseCostNumPackagesSchema, Package, PackageSchema} from '../schemas/package.schema';
import { CalculateCostService } from '../services/calculateCostService';
import { loadCouponConfig, loadRateConfig } from '../utils/configLoader';
import { Bill } from '../schemas/bill.schema';
import { validateInitialDetails, validatePackageDetails } from '../utils/validationUtils';
import { processInitialDetails, processPackageDetails } from '../utils/processingUtils';

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
        console.log(`| ${bill.packageId.padEnd(10)} | ${bill.discount.toFixed(0).padEnd(10)} | ${bill.totalCost.toFixed(0).padEnd(10)} |`);
      });
    } catch (error) {
      console.error('Error calculating costs:', error);
    }
  }
}
