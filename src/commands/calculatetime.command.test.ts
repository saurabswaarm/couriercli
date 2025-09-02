import { CalculateTimeCommand } from './calculatetime.command';
import inquirer from 'inquirer';

jest.mock('inquirer', () => ({
  __esModule: true,
  default: {
    prompt: jest.fn(),
  },
}));

jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

describe('CalculateTimeCommand', () => {
  let calculateTimeCommand: CalculateTimeCommand;
  let consoleLogSpy: jest.SpyInstance;
  let inquirerPromptSpy: jest.Mock;

  beforeEach(() => {
    calculateTimeCommand = new CalculateTimeCommand();
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
        .mockResolvedValueOnce({ packageDetails: 'PKG1 5 30 OFR001' })
        .mockResolvedValueOnce({ packageDetails: 'PKG2 10 60 OFR002' })
        .mockResolvedValueOnce({ fleetDetails: '2 70 200' });

      const promptInitialDetailsSpy = jest.spyOn(calculateTimeCommand as any, 'promptInitialDetails');
      const promptPackageDetailsSpy = jest.spyOn(calculateTimeCommand as any, 'promptPackageDetails');
      const promptFleetDetailsSpy = jest.spyOn(calculateTimeCommand as any, 'promptFleetDetails');
      const calculateAndDisplayTimesSpy = jest.spyOn(calculateTimeCommand as any, 'calculateAndDisplayTimes');

      await calculateTimeCommand.execute();

      expect(inquirerPromptSpy).toHaveBeenCalledTimes(4);
      expect(promptInitialDetailsSpy).toHaveBeenCalled();
      expect(promptPackageDetailsSpy).toHaveBeenCalled();
      expect(promptFleetDetailsSpy).toHaveBeenCalled();
      expect(calculateAndDisplayTimesSpy).toHaveBeenCalled();
    });
  });

  describe('promptInitialDetails', () => {
    it('should set baseDeliveryCost and numberOfPackages correctly', async () => {
      inquirerPromptSpy.mockResolvedValueOnce({ initialDetails: '100 3' });
      await (calculateTimeCommand as any).promptInitialDetails();
      expect((calculateTimeCommand as any).deliveryBatch.baseDeliveryCost).toBe(100);
      expect((calculateTimeCommand as any).deliveryBatch.numberOfPackages).toBe(3);
    });

    it('should throw error for invalid input', async () => {
      inquirerPromptSpy.mockResolvedValueOnce({ initialDetails: 'invalid' });
      // Mock console.error to avoid error output in test logs
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      await expect((calculateTimeCommand as any).promptInitialDetails()).rejects.toThrow();
      expect(inquirerPromptSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('promptPackageDetails', () => {
    it('should call promptSinglePackageDetails for each package', async () => {
      (calculateTimeCommand as any).deliveryBatch.numberOfPackages = 2;
      const promptSinglePackageDetailsSpy = jest.spyOn(calculateTimeCommand as any, 'promptSinglePackageDetails')
        .mockResolvedValue(undefined);
      await (calculateTimeCommand as any).promptPackageDetails();
      expect(promptSinglePackageDetailsSpy).toHaveBeenCalledTimes(2);
      expect(promptSinglePackageDetailsSpy).toHaveBeenCalledWith(1);
      expect(promptSinglePackageDetailsSpy).toHaveBeenCalledWith(2);
    });
  });

  describe('promptSinglePackageDetails', () => {
    it('should add package to packages array', async () => {
      inquirerPromptSpy.mockResolvedValueOnce({ packageDetails: 'PKG1 5 30 OFR001' });
      (calculateTimeCommand as any).deliveryBatch.packages = [];
      await (calculateTimeCommand as any).promptSinglePackageDetails(1);
      expect((calculateTimeCommand as any).deliveryBatch.packages).toHaveLength(1);
      expect((calculateTimeCommand as any).deliveryBatch.packages[0]).toEqual({
        packageId: 'PKG1',
        weight: 5,
        distance: 30,
        offerCode: 'OFR001'
      });
    });

    it('should throw error for invalid input', async () => {
      inquirerPromptSpy.mockResolvedValueOnce({ packageDetails: '' });
      (calculateTimeCommand as any).deliveryBatch.packages = [];
      // Mock console.error to avoid error output in test logs
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      await expect((calculateTimeCommand as any).promptSinglePackageDetails(1)).rejects.toThrow();
      expect(inquirerPromptSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('promptFleetDetails', () => {
    it('should set fleet capacity correctly', async () => {
      inquirerPromptSpy.mockResolvedValueOnce({ fleetDetails: '2 70 200' });
      await (calculateTimeCommand as any).promptFleetDetails();
      expect((calculateTimeCommand as any).fleetCapacity.numberOfVehicles).toBe(2);
      expect((calculateTimeCommand as any).fleetCapacity.maxSpeed).toBe(70);
      expect((calculateTimeCommand as any).fleetCapacity.maxCarriableWeight).toBe(200);
    });

    it('should throw error for invalid input', async () => {
      inquirerPromptSpy.mockResolvedValueOnce({ fleetDetails: 'invalid' });
      // Mock console.error to avoid error output in test logs
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      await expect((calculateTimeCommand as any).promptFleetDetails()).rejects.toThrow();
      expect(inquirerPromptSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});
