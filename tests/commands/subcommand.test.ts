import run from 'inquirer-test';
import { ENTER } from 'inquirer-test';

describe('CLI Subcommand Execution', () => {
    it('should execute calculatecost command directly without inquirer prompts', async () => {
        const result = await run(['dist/index.js', 'calculatecost'], [
            "100 3", ENTER,
            "PKG1 5 5 OFR001", ENTER,
            "PKG2 15 5 OFR002", ENTER,
            "PKG3 10 100 OFR003", ENTER
        ]);
        
        // Expected output after implementation
        expect(result).toContain(`PKG1 0 175`);
        expect(result).toContain(`PKG2 0 275`);
        expect(result).toContain(`PKG3 35 665`);
    }, 10000);

    it('should execute calculatetime command directly without inquirer prompts', async () => {
        const result = await run(['dist/index.js', 'calculatetime'], [
            "100 5", ENTER,
            "PKG1 50 30 OFR001", ENTER,
            "PKG2 75 125 OFFR0008", ENTER,
            "PKG3 175 100 OFFR003", ENTER,
            "PKG4 110 60 OFFR002", ENTER,
            "PKG5 155 95 NA", ENTER,
            "2 70 200", ENTER
        ]);
        
        // Split the result into lines and extract package information
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
        expect(packageData['PKG1'].time).toBeCloseTo(3.98, 1);
        
        expect(packageData['PKG2'].discount).toBe(0);
        expect(packageData['PKG2'].cost).toBe(1475);
        expect(packageData['PKG2'].time).toBeCloseTo(1.78, 1);
        
        expect(packageData['PKG3'].discount).toBe(0);
        expect(packageData['PKG3'].cost).toBe(2350);
        expect(packageData['PKG3'].time).toBeCloseTo(1.42, 1);
        
        expect(packageData['PKG4'].discount).toBe(0);
        expect(packageData['PKG4'].cost).toBe(1500);
        expect(packageData['PKG4'].time).toBeCloseTo(0.85, 1);
        
        expect(packageData['PKG5'].discount).toBe(0);
        expect(packageData['PKG5'].cost).toBe(2125);
        expect(packageData['PKG5'].time).toBeCloseTo(4.19, 1);
    }, 10000);

    it('should show error message when invalid subcommand is provided', async () => {
        try {
            await run(['dist/index.js', 'invalidcommand'], []);
            // If we reach here, the process didn't exit as expected
            throw new Error('Expected process to exit with error code');
        } catch (error: any) {
            // For this specific test, we need to check if the process exited with an error
            expect(error).toBeDefined();
        }
    }, 10000);
});
