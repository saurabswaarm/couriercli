import * as fs from 'fs';
import * as path from 'path';
import { CouponConfig } from '../schemas/coupon.schema';
import { RateConfig } from '../schemas/rate.schema';

export class ConfigLoader {
  static loadCouponConfig(): CouponConfig {
    const configPath = path.join(__dirname, '../../configs/coupon-config.json');
    const configFile = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(configFile);
  }

  static loadRateConfig(): RateConfig {
    const configPath = path.join(__dirname, '../../configs/rate-config.json');
    const configFile = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(configFile);
  }
}

// For testing purposes, we export functions that can be mocked
export function loadCouponConfig(): CouponConfig {
  return ConfigLoader.loadCouponConfig();
}

export function loadRateConfig(): RateConfig {
  return ConfigLoader.loadRateConfig();
}
