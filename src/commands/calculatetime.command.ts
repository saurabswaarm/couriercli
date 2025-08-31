import inquirer from 'inquirer';
import { z } from 'zod';
import { DeliveryBatch, hasDeliveryTime, hasDiscountAndTotalCost} from '../schemas/package.schema';
import { FleetCapacity, FleetCapacitySchema } from '../schemas/fleet.schema';
import { validateInitialDetails, validatePackageDetails, validateFleetDetails } from '../utils/validationUtils';
import { processInitialDetails, processPackageDetails, processFleetDetails } from '../utils/processingUtils';
import { calculateDeliveryTimes } from '../services/calculateTimeService';
import { calculateSingleBill } from '../services/calculateCostService';
import { loadCouponConfig, loadRateConfig } from '../utils/configLoader';

export class CalculateTimeCommand {
  private deliveryBatch: DeliveryBatch = {
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
    this.calculateAndDisplayTimes();
  }
  
  public getDeliveryTimeInput(): DeliveryBatch {
    return structuredClone(this.deliveryBatch);
  }
  
  public getFleetCapacity(): FleetCapacity {
    return structuredClone(this.fleetCapacity);
  }

  private calculateAndDisplayTimes(): void {
    try {
      const couponConfig = loadCouponConfig();
      const rateConfig = loadRateConfig();
      
      const packagesWithDeliveryTime = calculateDeliveryTimes(this.deliveryBatch, this.fleetCapacity);
      const packagesWithCostAndDeliveryTime = packagesWithDeliveryTime.map((packageWithDeliveryTime) => {
        return calculateSingleBill(packageWithDeliveryTime, couponConfig, rateConfig, this.deliveryBatch.baseDeliveryCost);
      })
      
      console.log('\nDelivery Time Calculation Results:');
      console.log('| Package ID |  Discount | Total Cost | Delivery Time (hours) |');
      console.log('|------------|-----------|------------|-----------------------|');
      
      packagesWithCostAndDeliveryTime.forEach((packageWithCostAndDeliveryTime) => {
        hasDeliveryTime(packageWithCostAndDeliveryTime) && hasDiscountAndTotalCost(packageWithCostAndDeliveryTime) && console.log(`| ${packageWithCostAndDeliveryTime.packageId.padEnd(10)} | ${packageWithCostAndDeliveryTime.discount.toFixed(0).padEnd(10)} | ${packageWithCostAndDeliveryTime.totalCost.toFixed(0).padEnd(10)} | ${packageWithCostAndDeliveryTime.deliveryTime.toFixed(0).padEnd(10)} |`);
      });
    } catch (error) {
      console.error('Error calculating delivery times:', error);
    }
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
      this.deliveryBatch.baseDeliveryCost = parsedInput.baseDeliveryCost;
      this.deliveryBatch.numberOfPackages = parsedInput.numberOfPackages;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  private async promptPackageDetails(): Promise<void> {
    for (let i = 0; i < this.deliveryBatch.numberOfPackages; i++) {
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
      this.deliveryBatch.packages.push(packageData);
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
    console.log(`Base Delivery Cost: ${this.deliveryBatch.baseDeliveryCost}`);
    console.log(`Number of Packages: ${this.deliveryBatch.packages.length}`);

    console.log('\nPackage Details:');

    // Create table header
    const header = '| Package ID | Weight (kg) | Distance (km) | Offer Code |';
    const separator = '|------------|-------------|---------------|------------|';

    console.log(header);
    console.log(separator);

    // Display each package in a table row
    this.deliveryBatch.packages.forEach((pkg) => {
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

