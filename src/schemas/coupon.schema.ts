import { z } from 'zod';

export enum ConditionParam {
  WEIGHT = 'weight',
  DISTANCE = 'distance',
}

export enum ConditionType {
  LESS_THAN = 'lessThan',
  GREATER_THAN = 'greaterThan',
  BETWEEN = 'between',
}

export const ConditionSchema = z.object({
  param: z.enum([ConditionParam.WEIGHT, ConditionParam.DISTANCE]),
  type: z.enum([ConditionType.LESS_THAN, ConditionType.GREATER_THAN, ConditionType.BETWEEN]),
  min: z.number().optional(),
  max: z.number().optional(),
  unit: z.string(),
}).refine((data) => {
  if (data.type === ConditionType.BETWEEN) {
    return data.min !== undefined && data.max !== undefined && data.min <= data.max;
  }
  if (data.type === ConditionType.LESS_THAN) {
    return data.max !== undefined;
  }
  if (data.type === ConditionType.GREATER_THAN) {
    return data.min !== undefined;
  }
  return true;
}, {
  message: 'Invalid condition configuration',
});

export const CouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  pattern: z.string().min(1, 'Pattern is required'),
  conditions: z.array(ConditionSchema).min(1, 'At least one condition is required'),
});

export const ValidationRulesSchema = z.object({
  combinedConditions: z.boolean(),
});

export const CouponConfigSchema = z.object({
  coupons: z.array(CouponSchema).min(1, 'At least one coupon is required'),
  validationRules: ValidationRulesSchema,
});

export type Condition = z.infer<typeof ConditionSchema>;
export type Coupon = z.infer<typeof CouponSchema>;
export type ValidationRules = z.infer<typeof ValidationRulesSchema>;
export type CouponConfig = z.infer<typeof CouponConfigSchema>;
