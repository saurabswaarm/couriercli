import inquirer from 'inquirer';
import { z } from 'zod';
import { DeliveryBatch, hasDiscountAndTotalCost} from '../schemas/package.schema';
import { calculateBill } from '../services/calculateCostService';
import { loadCouponConfig, loadRateConfig } from '../utils/configLoader';
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

  private calculateAndDisplayCosts(): void {
    try {
      const couponConfig = loadCouponConfig();
      const rateConfig = loadRateConfig();
      
      const packagesWithCost = calculateBill(couponConfig, rateConfig, this.deliveryCostInput);
      
      packagesWithCost.forEach(packageWithCost => {
        hasDiscountAndTotalCost(packageWithCost) && console.log(`${packageWithCost.packageId} ${packageWithCost.discount.toFixed(0)} ${packageWithCost.totalCost.toFixed(0)}`);
      });
    } catch (error) {
      console.error('Error calculating costs:', error);
    }
  }
}
