import { CalculateCostCommand } from './calculatecost.command';
import inquirer from 'inquirer';

// Mock inquirer.prompt to control user input
jest.mock('inquirer', () => ({
  __esModule: true,
  default: {
    prompt: jest.fn(),
  },
}));

// Mock process.exit to prevent tests from exiting
jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

describe('CalculateCostCommand', () => {
  let calculateCostCommand: CalculateCostCommand;
  let consoleLogSpy: jest.SpyInstance;
  let inquirerPromptSpy: jest.Mock;

  beforeEach(() => {
    calculateCostCommand = new CalculateCostCommand();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    inquirerPromptSpy = inquirer.prompt as unknown as jest.Mock;
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('execute', () => {
    it('should execute the command successfully with valid inputs', async () => {
      // Mock the inquirer responses
      inquirerPromptSpy
        .mockResolvedValueOnce({ initialDetails: '100 2' }) // First prompt for initial details
        .mockResolvedValueOnce({ packageDetails: 'PKG1 5 5 OFR001' }) // First package
        .mockResolvedValueOnce({ packageDetails: 'PKG2 10 10 OFR002' }); // Second package

      await calculateCostCommand.execute();

      // Verify that inquirer.prompt was called the correct number of times
      expect(inquirerPromptSpy).toHaveBeenCalledTimes(3);
      
      // Verify that the summary is displayed
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Package Summary:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Base Delivery Cost: 100'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Number of Packages: 2'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Package Details:'));
    });
  });

  describe('promptInitialDetails', () => {
    it('should set baseDeliveryCost and numberOfPackages correctly', async () => {
      // Mock the inquirer response with valid input
      inquirerPromptSpy.mockResolvedValueOnce({ initialDetails: '100 3' });

      // Call the method
      await (calculateCostCommand as any).promptInitialDetails();

      // Verify the private properties were set correctly
      expect((calculateCostCommand as any).deliveryCostInput.baseDeliveryCost).toBe(100);
      expect((calculateCostCommand as any).deliveryCostInput.numberOfPackages).toBe(3);
    });

    it('should throw error for invalid input', async () => {
      // Mock the inquirer response with invalid input
      inquirerPromptSpy.mockResolvedValueOnce({ initialDetails: 'invalid' });
      
      // Expect the method to throw an error
      await expect((calculateCostCommand as any).promptInitialDetails()).rejects.toThrow();
      
      // Verify that inquirer.prompt was called
      expect(inquirerPromptSpy).toHaveBeenCalled();
    });
  });

  describe('promptPackageDetails', () => {
    it('should call promptSinglePackageDetails for each package', async () => {
      // Set the numberOfPackages
      (calculateCostCommand as any).deliveryCostInput.numberOfPackages = 2;
      
      // Mock the promptSinglePackageDetails method
      const promptSinglePackageDetailsSpy = jest.spyOn(calculateCostCommand as any, 'promptSinglePackageDetails')
        .mockResolvedValue(undefined);
      
      // Mock the displaySummary method
      const displaySummarySpy = jest.spyOn(calculateCostCommand as any, 'displaySummary')
        .mockImplementation();

      // Call the method
      await (calculateCostCommand as any).promptPackageDetails();

      // Verify that promptSinglePackageDetails was called for each package
      expect(promptSinglePackageDetailsSpy).toHaveBeenCalledTimes(2);
      expect(promptSinglePackageDetailsSpy).toHaveBeenCalledWith(1);
      expect(promptSinglePackageDetailsSpy).toHaveBeenCalledWith(2);
      
      // Verify that displaySummary was called
      expect(displaySummarySpy).toHaveBeenCalled();
    });
  });

  describe('promptSinglePackageDetails', () => {
    it('should add package to packages array', async () => {
      // Mock the inquirer response with valid input
      inquirerPromptSpy.mockResolvedValueOnce({ packageDetails: 'PKG1 5 5 OFR001' });
      
      // Initialize the packages array
      (calculateCostCommand as any).deliveryCostInput.packages = [];

      // Call the method
      await (calculateCostCommand as any).promptSinglePackageDetails(1);

      // Verify that the package was added to the array
      expect((calculateCostCommand as any).deliveryCostInput.packages).toHaveLength(1);
      expect((calculateCostCommand as any).deliveryCostInput.packages[0]).toEqual({
        packageId: 'PKG1',
        weight: 5,
        distance: 5,
        offerCode: 'OFR001'
      });
    });

    it('should throw error for invalid input', async () => {
      // Mock the inquirer response with invalid input
      inquirerPromptSpy.mockResolvedValueOnce({ packageDetails: '' });
      
      // Initialize the packages array
      (calculateCostCommand as any).deliveryCostInput.packages = [];

      // Expect the method to throw an error
      await expect((calculateCostCommand as any).promptSinglePackageDetails(1)).rejects.toThrow();
      
      // Verify that inquirer.prompt was called
      expect(inquirerPromptSpy).toHaveBeenCalled();
    });
  });

  describe('displaySummary', () => {
    it('should display package summary correctly', async () => {
      // Set up the command with some package data
      (calculateCostCommand as any).deliveryCostInput.baseDeliveryCost = 100;
      (calculateCostCommand as any).deliveryCostInput.packages = [
        { packageId: 'PKG1', weight: 5, distance: 5, offerCode: 'OFR001' },
        { packageId: 'PKG2', weight: 10, distance: 10 },
      ];

      (calculateCostCommand as any).displaySummary();

      // Verify the summary output
      expect(consoleLogSpy).toHaveBeenCalledWith('\nPackage Summary:');
      expect(consoleLogSpy).toHaveBeenCalledWith('Base Delivery Cost: 100');
      expect(consoleLogSpy).toHaveBeenCalledWith('Number of Packages: 2');
      expect(consoleLogSpy).toHaveBeenCalledWith('\nPackage Details:');
      
      // Check that table headers are displayed
      expect(consoleLogSpy).toHaveBeenCalledWith('| Package ID | Weight (kg) | Distance (km) | Offer Code |');
      expect(consoleLogSpy).toHaveBeenCalledWith('|------------|-------------|---------------|------------|');
      
      // Check that package data is displayed in table format
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('PKG1'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('PKG2'));
    });

    it('should display N/A for packages without offer codes', async () => {
      // Set up the command with a package that has no offer code
      (calculateCostCommand as any).deliveryCostInput.baseDeliveryCost = 100;
      (calculateCostCommand as any).deliveryCostInput.packages = [
        { packageId: 'PKG1', weight: 5, distance: 5 },
      ];

      (calculateCostCommand as any).displaySummary();

      // Verify that N/A is displayed for missing offer code
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('N/A'));
    });
  });
});
