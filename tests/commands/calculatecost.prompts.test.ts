import run from 'inquirer-test';
import { ENTER, DOWN } from 'inquirer-test';




const askingForPackageDetailsString = ["Enter details for package", "pkg_id pkg_weight_in_kg distance_in_km"];
describe('CLI entrypoint',
    () => {
        it('should allow selecting calculatecost', async () => {
            const result = await run(['dist/index.js'], [ENTER]);
            expect(result).toContain('Calculate Cost');
            expect(result).toContain('Calculate Time');
        });

        it('should display prompt for base_delivery_cost and no_of_packages after selecting Calculate Cost', async () => {
            const result = await run(['dist/index.js'], [ENTER, ENTER]);
            expect(result).toContain('Enter base_delivery_cost and no_of_packages (e.g., "100 3")');
        });

        it('should not allow zero number of packages', async () => {
            const result = await run(['dist/index.js'], [ENTER, ENTER, "100 0", ENTER]);
            askingForPackageDetailsString.forEach(str => expect(result).not.toContain(str));
        });

        it('should allow zero base cost', async () => {
            const result = await run(['dist/index.js'], [ENTER, ENTER, "0 3", ENTER]);

            askingForPackageDetailsString.forEach(str => expect(result).toContain(str));
        });

        it('should display prompt for package details after selecting Calculate Cost', async () => {
            const result = await run(['dist/index.js'], [ENTER, ENTER, "100 3", ENTER]);
            askingForPackageDetailsString.forEach(str => expect(result).toContain(str));
        });

        it('should display prompt for package details after selecting Calculate Cost, and adding another package', async () => {
            const result = await run(['dist/index.js'], [ENTER, ENTER, "100 3", ENTER, "pkg1 1 1 OFFER10", ENTER]);
            askingForPackageDetailsString.forEach(str => expect(result).toContain(str));
        });

        it('should not allow zero weight', async () => {
            const result = await run(['dist/index.js'], [ENTER, ENTER, "100 3", ENTER, "pkg1 0 1 OFFER10", ENTER]);
            expect(result).toContain('Weight must be a positive number');
        });

        it('should not allow zero distance', async () => {
            const result = await run(['dist/index.js'], [ENTER, ENTER, "100 3", ENTER, "pkg1 1 0 OFFER10", ENTER]);
            expect(result).toContain('Distance must be a positive number')
        });

        it('should display prompt for package details after selecting Calculate Cost, and adding another package, upto limit', async () => {
            const packageCount = 3;
            const promptArray: string[] = [
                "PKG1 5 5 OFR001",
                "PKG2 15 5 OFR002",
                "PKG3 10 100 OFR003"
            ];

            const result = await run(['dist/index.js'], [ENTER, ENTER, "100 " + packageCount, ...promptArray.map(p => [ENTER, p]).flat()]);
            const expectedStrings = [
                `PKG1 0 175`,
                `PKG2 0 275`,
                `PKG3 35 665`,
            ];
            expectedStrings.forEach(str => expect(result).toContain(str));

        });
    });
