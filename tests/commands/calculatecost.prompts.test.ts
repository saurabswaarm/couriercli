import run from 'inquirer-test';
import { ENTER, DOWN } from 'inquirer-test';




const askingForPackageDetailsString = ["Enter details for package", "pkg_id pkg_weight_in_kg distance_in_km"];
describe('CLI entrypoint',
    () => {
        beforeEach(() => {
            console.log("Mock config is loaded")
            // Mock config loader functions
            jest.mock('../../src/utils/configLoader', () => ({
                loadCouponConfig: jest.fn().mockReturnValue({
                    coupons: [
                        {
                            code: 'OFR001',
                            pattern: '^OFR[0-9]{3}$',
                            discount: 10,
                            conditions: [
                                {
                                    param: 'distance',
                                    type: 'lessThan',
                                    max: 200,
                                    unit: 'km'
                                },
                                {
                                    param: 'weight',
                                    type: 'between',
                                    min: 70,
                                    max: 200,
                                    unit: 'kg'
                                }
                            ]
                        },
                        {
                            code: 'OFR002',
                            pattern: '^OFR[0-9]{3}$',
                            discount: 7,
                            conditions: [
                                {
                                    param: 'distance',
                                    type: 'between',
                                    min: 50,
                                    max: 150,
                                    unit: 'km'
                                },
                                {
                                    param: 'weight',
                                    type: 'between',
                                    min: 100,
                                    max: 250,
                                    unit: 'kg'
                                }
                            ]
                        },
                        {
                            code: 'OFR003',
                            pattern: '^OFR[0-9]{3}$',
                            discount: 5,
                            conditions: [
                                {
                                    param: 'distance',
                                    type: 'between',
                                    min: 50,
                                    max: 250,
                                    unit: 'km'
                                },
                                {
                                    param: 'weight',
                                    type: 'between',
                                    min: 10,
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

        });
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
            const promptArray: string[] = [
                "PKG1 5 5 OFR001",
                "PKG2 15 5 OFR002",
                "PKG3 10 100 OFR003"
            ];

            const result = await run(['dist/index.js'], [ENTER, ENTER, "100 " + packageCount, ...promptArray.map(p => [ENTER, p]).flat()]);
            const expectedStrings = [
                `| ${"PKG1".padEnd(10)} | ${"0".padEnd(10)} | ${"175".padEnd(10)} |`,
                `| ${"PKG2".padEnd(10)} | ${"0".padEnd(10)} | ${"275".padEnd(10)} |`,
                `| ${"PKG3".padEnd(10)} | ${"35".padEnd(10)} | ${"665".padEnd(10)} |`,
            ];
            expectedStrings.forEach(str => expect(result).toContain(str));

        });
    });
