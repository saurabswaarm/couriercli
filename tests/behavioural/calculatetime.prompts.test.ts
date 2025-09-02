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

        const lines: string[] = result.split('\n');
        const pkgLines = lines.filter((line: string) => line.match(/^PKG[1-5] \d+ \d+ \d+\.\d+$/));
        
        expect(pkgLines.length).toBe(5);
        
        const packageData: { [key: string]: { discount: number; cost: number; time: number } } = {};
        pkgLines.forEach((line: string) => {
            const parts = line.split(' ');
            const pkgId = parts[0];
            const discount = parseInt(parts[1]);
            const cost = parseInt(parts[2]);
            const time = parseFloat(parts[3]);
            packageData[pkgId] = { discount, cost, time };
        });
        
        expect(packageData['PKG1'].discount).toBe(0);
        expect(packageData['PKG1'].cost).toBe(750);
        expect(packageData['PKG1'].time).toBeCloseTo(3.98, 1); // Expected ~3.98
        
        expect(packageData['PKG2'].discount).toBe(0);
        expect(packageData['PKG2'].cost).toBe(1475);
        expect(packageData['PKG2'].time).toBeCloseTo(1.78, 1); // Expected ~1.78
        
        expect(packageData['PKG3'].discount).toBe(0);
        expect(packageData['PKG3'].cost).toBe(2350);
        expect(packageData['PKG3'].time).toBeCloseTo(1.42, 1); // Expected ~1.42
        
        expect(packageData['PKG4'].discount).toBe(0);
        expect(packageData['PKG4'].cost).toBe(1500);
        expect(packageData['PKG4'].time).toBeCloseTo(0.85, 1); // Expected ~0.85
        
        expect(packageData['PKG5'].discount).toBe(0);
        expect(packageData['PKG5'].cost).toBe(2125);
        expect(packageData['PKG5'].time).toBeCloseTo(4.19, 1); // Expected ~4.19
    });

    it('should provide the correct discount and total cost for each package', async () => {
        const result = await run(['dist/index.js'], [
            DOWN, ENTER,
            '100 1', ENTER,
            'PKG1 10 100 OFR003', ENTER,
            '2 70 200', ENTER
        ]);

        expect(result).toContain(`PKG1 35 665`);
    });
});
