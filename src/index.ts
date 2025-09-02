#!/usr/bin/env node

import inquirer from 'inquirer';
import { CalculateCostCommand } from './commands/calculatecost.command';
import { CalculateTimeCommand } from './commands/calculatetime.command';
import { ZodError } from 'zod';
import { calculateDeliveryTimes } from './services/calculateTimeService';

async function main(): Promise<void> {
    // Check if a subcommand was provided as an argument
    const args = process.argv.slice(2);
    
    if (args.length > 0) {
        // Handle subcommands directly
        const subcommand = args[0];
        
        switch (subcommand) {
            case 'calculatecost':
                const calculateCostCommand = new CalculateCostCommand();
                await calculateCostCommand.execute();
                return;
            case 'calculatetime':
                const calculateTimeCommand = new CalculateTimeCommand(calculateDeliveryTimes);
                await calculateTimeCommand.execute();
                return;
            case 'help':
            case '--help':
            case '-h':
                showHelp();
                return;
            default:
                console.error('Invalid command');
                process.exit(1);
        }
    }
    
    // Default to interactive mode if no subcommand provided
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
        break;
      case 'calculatetime':
        const calculateTimeCommand = new CalculateTimeCommand(calculateDeliveryTimes);
        await calculateTimeCommand.execute();
        break;
      default:
        console.error('Invalid command selected');
        process.exit(1);
    }
}

function showHelp(): void {
    console.log(`
Courier CLI - Package delivery cost and time calculator

Usage:
  couriercli [command]

Available Commands:
  calculatecost    Calculate delivery costs for packages
  calculatetime    Calculate delivery times for packages
  help             Show help information

Examples:
  couriercli calculatecost
  couriercli calculatetime
  couriercli help

If no command is provided, the CLI will run in interactive mode.
`);
}

main().catch(error => {
  handleErrors(error);
});

function handleErrors(error: unknown) {
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
