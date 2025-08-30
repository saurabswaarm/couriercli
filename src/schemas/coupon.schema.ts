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

export const LessThanConditionSchema = z.object({
  param: z.enum([ConditionParam.WEIGHT, ConditionParam.DISTANCE]),
  type: z.literal(ConditionType.LESS_THAN),
  max: z.number(),
  unit: z.string(),
}).transform((data) => ({
  ...data,
  min: undefined,
}));

export const GreaterThanConditionSchema = z.object({
  param: z.enum([ConditionParam.WEIGHT, ConditionParam.DISTANCE]),
  type: z.literal(ConditionType.GREATER_THAN),
  min: z.number(),
  unit: z.string(),
}).transform((data) => ({
  ...data,
  max: undefined,
}));

export const BetweenConditionSchema = z.object({
  param: z.enum([ConditionParam.WEIGHT, ConditionParam.DISTANCE]),
  type: z.literal(ConditionType.BETWEEN),
  min: z.number(),
  max: z.number(),
  unit: z.string(),
}).refine((data) => data.min <= data.max, {
  message: 'Min value must be less than or equal to max value',
});

export const ConditionSchema = z.discriminatedUnion('type', [
  LessThanConditionSchema,
  GreaterThanConditionSchema,
  BetweenConditionSchema,
]);

export const CouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  pattern: z.string().min(1, 'Pattern is required'),
  discount: z.number().min(0, 'Discount must be a positive number'),
  conditions: z.array(ConditionSchema).min(1, 'At least one condition is required'),
});

export const ValidationRulesSchema = z.object({
  combinedCoupons: z.boolean(),
});

export const CouponConfigSchema = z.object({
  coupons: z.array(CouponSchema).min(1, 'At least one coupon is required'),
  validationRules: ValidationRulesSchema,
});

export type LessThanCondition = z.infer<typeof LessThanConditionSchema>;
export type GreaterThanCondition = z.infer<typeof GreaterThanConditionSchema>;
export type BetweenCondition = z.infer<typeof BetweenConditionSchema>;
export type Condition = z.infer<typeof ConditionSchema>;
export type Coupon = z.infer<typeof CouponSchema>;
export type ValidationRules = z.infer<typeof ValidationRulesSchema>;
export type CouponConfig = z.infer<typeof CouponConfigSchema>;

// Type guards for condition types
export const isLessThanCondition = (condition: Condition): condition is LessThanCondition => {
  return condition.type === ConditionType.LESS_THAN;
};

export const isGreaterThanCondition = (condition: Condition): condition is GreaterThanCondition => {
  return condition.type === ConditionType.GREATER_THAN;
};

export const isBetweenCondition = (condition: Condition): condition is BetweenCondition => {
  return condition.type === ConditionType.BETWEEN;
};

export const hasMinValue = (condition: Condition): condition is GreaterThanCondition | BetweenCondition => {
  return condition.min !== undefined;
};

export const hasMaxValue = (condition: Condition): condition is LessThanCondition | BetweenCondition => {
  return condition.max !== undefined;
};
