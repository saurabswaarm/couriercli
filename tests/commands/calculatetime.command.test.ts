import { CalculateTimeCommand } from '../../src/commands/calculatetime.command';

describe('CalculateTimeCommand', () => {
  let calculateTimeCommand: CalculateTimeCommand;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    calculateTimeCommand = new CalculateTimeCommand();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should display feature disabled message', async () => {
    await calculateTimeCommand.execute();
    expect(consoleLogSpy).toHaveBeenCalledWith('Feature is disabled');
  });
});
