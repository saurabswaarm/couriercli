import run from 'inquirer-test';
import { ENTER, DOWN } from 'inquirer-test';

// Mock config loader functions
jest.mock('./utils/configLoader', () => ({
  loadCouponConfig: jest.fn().mockReturnValue({
    coupons: [
      {
        code: 'OFR001',
        pattern: '^OFR[0-9]{3}$',
        discount: 10,
        conditions: [
          {
            param: 'weight',
            type: 'lessThan',
            max: 150,
            unit: 'kg'
          }
        ]
      }
    ],
    validationRules: {
      combinedCoupons: false
    }
  }),
  loadRateConfig: jest.fn().mockReturnValue({
    weight: 10,
    distance: 5
  })
}));


            const askingForPackageDetailsString = [ "Enter details for package", "pkg_id pkg_weight_in_kg distance_in_km"];
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

        it('should display prompt for package details after selecting Calculate Cost, and adding another package, upto limit', async () => {
            const packageCount = 3;
            const promptArray: string[] = [];
            for (let i = 0; i < packageCount; i++) {
                promptArray.push(`pkg${i+1} 1 1 OFFER${i+10}`);
            }
            const result = await run(['dist/index.js'], [ENTER, ENTER, "100 " + packageCount, ...promptArray.map(p => [ENTER, p]).flat()]);
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
