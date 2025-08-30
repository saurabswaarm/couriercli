#!/usr/bin/env node

import inquirer from 'inquirer';
import { CalculateCostCommand } from './commands/calculatecost.command';
import { CalculateTimeCommand } from './commands/calculatetime.command';
import { CouponConfigSchema } from './schemas/coupon.schema';
import couponConfig from '../configs/coupon-config.json';

async function main(): Promise<void> {
  try {
    const couponConfigZod = CouponConfigSchema.safeParse(couponConfig);
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'command',
        message: `Which command would you like to run?`,
        choices: [
          { name: 'Calculate Cost', value: 'calculatecost' },
          { name: 'Calculate Time', value: 'calculatetime' }
        ]
      }
    ]);

    switch (answer.command) {
      case 'calculatecost':
        const calculateCostCommand = new CalculateCostCommand();
        await calculateCostCommand.execute();
        const deliveryCostInput = calculateCostCommand.getDeliveryCostInput();
        console.log(deliveryCostInput);
        break;
      case 'calculatetime':
        const calculateTimeCommand = new CalculateTimeCommand();
        await calculateTimeCommand.execute();
        break;
      default:
        console.error('Invalid command selected');
        process.exit(1);
    }
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
