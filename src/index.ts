#!/usr/bin/env node

import inquirer from 'inquirer';

async function main(): Promise<void> {
  try {
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
        break;
      case 'calculatetime':
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
