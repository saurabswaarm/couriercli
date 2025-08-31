import run from 'inquirer-test';
import { ENTER, DOWN } from 'inquirer-test';

describe('CalculateTimeCommand Prompts', () => {
    it('should display correct prompts in sequence for Calculate Time command', async () => {
        // Select Calculate Time command
        const result = await run(['dist/index.js'], [ENTER]);
        
        // Check that we're in the Calculate Time flow
        expect(result).toContain('Calculate Time');
    });
    
    it('should prompt for base delivery cost and number of packages', async () => {
        // Select Calculate Time command and check first prompt
        const result = await run(['dist/index.js'], [DOWN, ENTER]);
        
        // Check for prompt asking for base delivery cost and number of packages
        expect(result).toContain('Enter base delivery cost and number of packages');
    });
    
    it('should prompt for package details repeatedly based on package count', async () => {
        // Select Calculate Time command, enter base cost and package count
        // Then check for package details prompt
        const result = await run(['dist/index.js'], [DOWN, ENTER, '100 3', ENTER]);
        
        // Check for prompt asking for package details
        expect(result).toContain('Enter package ID, package weight, distance and offer code');
    });
    
    it('should continue prompting for package details until package count is reached', async () => {
        // Select Calculate Time command, enter base cost and package count (2)
        // Enter first package details and check for second package prompt
        const result = await run(['dist/index.js'], [
            DOWN, ENTER,  // Select Calculate Time
            '100 2', ENTER,  // Enter base cost and package count
            'PKG1 50 30 OFR001', ENTER  // Enter first package
        ]);
        
        // Should still prompt for package details (second package)
        expect(result).toContain('Enter package ID, package weight, distance and offer code');
    });
    
    it('should prompt for vehicle details after all packages are entered', async () => {
        // Select Calculate Time command, enter base cost and package count (1)
        // Enter package details and check for vehicle details prompt
        const result = await run(['dist/index.js'], [
            DOWN, ENTER,  // Select Calculate Time
            '100 1', ENTER,  // Enter base cost and package count
            'PKG1 50 30 OFR001', ENTER  // Enter package
        ]);
        
        // Check for prompt asking for vehicle details
        expect(result).toContain('Enter the number of vehicles, the average max speed and average max carriable weight');
    });
});
