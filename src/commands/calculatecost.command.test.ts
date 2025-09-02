import { CalculateCostCommand } from './calculatecost.command';
import inquirer from 'inquirer';

jest.mock('inquirer', () => ({
  __esModule: true,
  default: {
    prompt: jest.fn(),
  },
}));

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
      inquirerPromptSpy
        .mockResolvedValueOnce({ initialDetails: '100 2' })
        .mockResolvedValueOnce({ packageDetails: 'PKG1 5 5 OFR001' })
        .mockResolvedValueOnce({ packageDetails: 'PKG2 10 10 OFR002' });

      await calculateCostCommand.execute();

      expect(inquirerPromptSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('promptInitialDetails', () => {
    it('should set baseDeliveryCost and numberOfPackages correctly', async () => {
      inquirerPromptSpy.mockResolvedValueOnce({ initialDetails: '100 3' });
      await (calculateCostCommand as any).promptInitialDetails();
      expect((calculateCostCommand as any).deliveryCostInput.baseDeliveryCost).toBe(100);
      expect((calculateCostCommand as any).deliveryCostInput.numberOfPackages).toBe(3);
    });

    it('should throw error for invalid input', async () => {
      inquirerPromptSpy.mockResolvedValueOnce({ initialDetails: 'invalid' });
      await expect((calculateCostCommand as any).promptInitialDetails()).rejects.toThrow();
      expect(inquirerPromptSpy).toHaveBeenCalled();
    });
  });

  describe('promptPackageDetails', () => {
    it('should call promptSinglePackageDetails for each package', async () => {
      (calculateCostCommand as any).deliveryCostInput.numberOfPackages = 2;
      const promptSinglePackageDetailsSpy = jest.spyOn(calculateCostCommand as any, 'promptSinglePackageDetails')
        .mockResolvedValue(undefined);
      await (calculateCostCommand as any).promptPackageDetails();
      expect(promptSinglePackageDetailsSpy).toHaveBeenCalledTimes(2);
      expect(promptSinglePackageDetailsSpy).toHaveBeenCalledWith(1);
      expect(promptSinglePackageDetailsSpy).toHaveBeenCalledWith(2);
    });
  });

  describe('promptSinglePackageDetails', () => {
    it('should add package to packages array', async () => {
      inquirerPromptSpy.mockResolvedValueOnce({ packageDetails: 'PKG1 5 5 OFR001' });
      (calculateCostCommand as any).deliveryCostInput.packages = [];
      await (calculateCostCommand as any).promptSinglePackageDetails(1);
      expect((calculateCostCommand as any).deliveryCostInput.packages).toHaveLength(1);
      expect((calculateCostCommand as any).deliveryCostInput.packages[0]).toEqual({
        packageId: 'PKG1',
        weight: 5,
        distance: 5,
        offerCode: 'OFR001'
      });
    });

    it('should throw error for invalid input', async () => {
      inquirerPromptSpy.mockResolvedValueOnce({ packageDetails: '' });
      (calculateCostCommand as any).deliveryCostInput.packages = [];
      await expect((calculateCostCommand as any).promptSinglePackageDetails(1)).rejects.toThrow();
      expect(inquirerPromptSpy).toHaveBeenCalled();
    });
  });
});
