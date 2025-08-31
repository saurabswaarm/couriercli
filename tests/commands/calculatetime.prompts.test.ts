import run from 'inquirer-test';
import { ENTER, DOWN } from 'inquirer-test';

describe('CalculateTimeCommand Prompts', () => {
    it('should display correct prompts in sequence for Calculate Time command', async () => {
        const result = await run(['dist/index.js'], [ENTER]);
        expect(result).toContain('Calculate Time');
    });
    
    it('should prompt for base delivery cost and number of packages', async () => {
        const result = await run(['dist/index.js'], [DOWN, ENTER]);
        expect(result).toContain('Enter base delivery cost and number of packages');
    });
    
    it('should prompt for package details repeatedly based on package count', async () => {
        const result = await run(['dist/index.js'], [DOWN, ENTER, '100 3', ENTER]);
        expect(result).toContain('Enter package ID, package weight, distance and offer code');
    });
    
    it('should continue prompting for package details until package count is reached', async () => {
        const result = await run(['dist/index.js'], [
            DOWN, ENTER, 
            '100 2', ENTER, 
            'PKG1 50 30 OFR001', ENTER 
        ]);
        
        expect(result).toContain('Enter package ID, package weight, distance and offer code');
        expect(result).toContain('Enter package ID, package weight, distance and offer code');
    });
    
    it('should prompt for vehicle details after all packages are entered', async () => {
        const result = await run(['dist/index.js'], [
            DOWN, ENTER, 
            '100 1', ENTER, 
            'PKG1 50 30 OFR001', ENTER 
        ]);
        
        const strings = ['Enter', 'the', 'number', 'of', 'vehicles', 'the', 'average', 'max', 'speed', 'and', 'average', 'max', 'carriable', 'weight'];
        strings.forEach(str => expect(result).toContain(str));
    });

    it('should process multiple packages with different weights, distances and offer codes', async () => {
        const result = await run(['dist/index.js'], [
            DOWN, ENTER, 
            '100 5', ENTER, 
            'PKG1 50 30 OFR001', ENTER, 
            'PKG2 75 125 OFFR0008', ENTER, 
            'PKG3 175 100 OFFR003', ENTER,
            'PKG4 110 60 OFFR002', ENTER, 
            'PKG5 155 95 NA', ENTER, 
            '2 70 200', ENTER 
        ]);
        
        expect(result).toContain('PKG1 0 750 3.98');
        expect(result).toContain('PKG2 0 1475 1.78');
        expect(result).toContain('PKG3 0 2350 1.42');
        expect(result).toContain('PKG4 105 1395 0.85');
        expect(result).toContain('PKG5 0 2125 4.19');
    });
});
