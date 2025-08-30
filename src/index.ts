#!/usr/bin/env node

import inquirer from 'inquirer';
import { CalculateCostCommand } from './commands/calculatecost.command';
import { CalculateTimeCommand } from './commands/calculatetime.command';
import { CouponConfigSchema } from './schemas/coupon.schema';
import couponConfig from '../configs/coupon-config.json';
import { ZodError } from 'zod';

async function main(): Promise<void> {
  try {
    const couponConfigZod = CouponConfigSchema.parse(couponConfig);
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
    if (error instanceof ZodError) {
      console.error('Configuration validation error:');
      error.issues.forEach((err, index) => {
        console.error(`  ${index + 1}. Path: ${err.path.join(' -> ')}`);
        console.error(`     Message: ${err.message}`);
      });
      console.error('\nPlease check your configuration files and ensure they match the expected schema.');
    } else {
      console.error('An error occurred:', error);
    }
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
