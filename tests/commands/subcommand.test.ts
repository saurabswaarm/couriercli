import run from 'inquirer-test';
import { ENTER } from 'inquirer-test';
import { spawn } from 'child_process';
import { promisify } from 'util';

// Test to verify CLI can be called directly with subcommands
// This test should initially fail since the functionality doesn't exist yet
describe('CLI Subcommand Execution', () => {
    it('should execute calculatecost command directly without inquirer prompts', async () => {
        // This test will fail initially because the CLI doesn't support direct subcommand execution
        // The functionality needs to be implemented in src/index.ts
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
        // This test will fail initially because the CLI doesn't support direct subcommand execution
        // The functionality needs to be implemented in src/index.ts
        const result = await run(['dist/index.js', 'calculatetime'], [
            "100 5", ENTER,
            "PKG1 50 30 OFR001", ENTER,
            "PKG2 75 125 OFFR0008", ENTER,
            "PKG3 175 100 OFFR003", ENTER,
            "PKG4 110 60 OFFR002", ENTER,
            "PKG5 155 95 NA", ENTER,
            "2 70 200", ENTER
        ]);
        
        // Expected output after implementation
        expect(result).toContain('PKG1 0 750 3.98');
        expect(result).toContain('PKG2 0 1475 1.78');
        expect(result).toContain('PKG3 0 2350 1.42');
        expect(result).toContain('PKG4 105 1395 0.85');
        expect(result).toContain('PKG5 0 2125 4.19');
    }, 10000);

    it('should show error message when invalid subcommand is provided', async () => {
        try {
            await run(['dist/index.js', 'invalidcommand'], []);
            fail('Expected process to exit with error code');
        } catch (error: any) {
            expect(error.message || error.toString()).toContain('Invalid command');
        }
    }, 10000);
});
