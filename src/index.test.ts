import run from 'inquirer-test';
import { ENTER, DOWN } from 'inquirer-test';

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
        
        it('should display prompt for package details after selecting Calculate Cost', async () => {
            const result = await run(['dist/index.js'], [ENTER, ENTER, "100 0", ENTER]);
            expect(result).not.toContain('Enter package details (e.g., "pkg_id pkg_weight_in_kg distance_in_km offer_code")');
        });
        
        it('should display prompt for package details after selecting Calculate Cost', async () => {
            const result = await run(['dist/index.js'], [ENTER, ENTER, "0 3", ENTER]);
            expect(result).toContain('Enter package details (e.g., "pkg_id pkg_weight_in_kg distance_in_km offer_code")');
        });

        it('should display prompt for package details after selecting Calculate Cost', async () => {
            const result = await run(['dist/index.js'], [ENTER, ENTER, "100 3", ENTER]);
            expect(result).toContain('Enter package details (e.g., "pkg_id pkg_weight_in_kg distance_in_km offer_code")');
        });

        it('should display prompt for package details after selecting Calculate Cost, and adding another package', async () => {
            const result = await run(['dist/index.js'], [ENTER, ENTER, "100 3", ENTER, "pkg1 1 1 OFFER10", ENTER]);
            expect(result).toContain('Enter package details (e.g., "pkg_id pkg_weight_in_kg distance_in_km offer_code")');
        });


        it('should display prompt for package details after selecting Calculate Cost, and adding another package', async () => {
            const result = await run(['dist/index.js'], [ENTER, ENTER, "100 3", ENTER, "pkg1 1 1 OFFER10", ENTER, "pkg2 1 1 OFFER20", ENTER, "pkg3 1 1 OFFER30", ENTER]);
            const expectedStrings = [
                'Package Summary:',
                'Base Delivery Cost',
                'Number of Packages',
                'Package Details',
                'Package ID',
                'Weight (kg)',
                'Distance (km)',
                'Offer Code'
            ];
            expectedStrings.forEach(str => expect(result).toContain(str));
            
        });


    });
