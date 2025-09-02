import inquirer from 'inquirer';
import { z } from 'zod';
import { DeliveryBatch, hasDeliveryTime, hasDiscountAndTotalCost } from '../schemas/package.schema';
import { FleetCapacity, FleetCapacitySchema } from '../schemas/fleet.schema';
import { validateInitialDetails, validatePackageDetails, validateFleetDetails } from '../utils/validationUtils';
import { processInitialDetails, processPackageDetails, processFleetDetails } from '../utils/processingUtils';
import { calculateSingleBill } from '../services/calculateCostService';
import { loadCouponConfig, loadRateConfig } from '../utils/configLoader';
import { CalcTime } from '../types/calcTimeType';

export class CalculateTimeCommand {
  private calculateDeliveryTimes: CalcTime;
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


  constructor(
    private calculateDeliveryTimesFunction: CalcTime
  ) {
    this.calculateDeliveryTimes = this.calculateDeliveryTimesFunction;
  }
   

  public async execute(): Promise<void> {
    await this.promptInitialDetails();
    await this.promptPackageDetails();
    await this.promptFleetDetails();
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

      const packagesWithDeliveryTime = this.calculateDeliveryTimes(this.deliveryBatch, this.fleetCapacity);
      const packagesWithCostAndDeliveryTime = packagesWithDeliveryTime.map((packageWithDeliveryTime) => {
        const singleBill = calculateSingleBill(packageWithDeliveryTime, couponConfig, rateConfig, this.deliveryBatch.baseDeliveryCost);
        console.log('singlebill', singleBill);
        return {
          ...singleBill,
          deliveryTime: packageWithDeliveryTime.deliveryTime,
        };
      });

      packagesWithCostAndDeliveryTime.forEach((packageWithCostAndDeliveryTime) => {
        if (hasDiscountAndTotalCost(packageWithCostAndDeliveryTime) && hasDeliveryTime(packageWithCostAndDeliveryTime)) {
          const discount = packageWithCostAndDeliveryTime.discount
          const totalCost = packageWithCostAndDeliveryTime.totalCost
          const deliveryTime = packageWithCostAndDeliveryTime.deliveryTime
          console.log(`${packageWithCostAndDeliveryTime.packageId} ${discount.toFixed(0)} ${totalCost.toFixed(0)} ${deliveryTime.toFixed(2)}`);
        }
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
}

