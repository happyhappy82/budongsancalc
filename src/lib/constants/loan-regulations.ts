export const LTV_LIMITS = {
  speculation: 0.40,
  overheated: 0.40,
  regulated: 0.50,
  none: 0.70,
  firstTimeBuyer: 0.80,
} as const

export const DTI_LIMITS = {
  speculation: 0.40,
  overheated: 0.40,
  regulated: 0.50,
  capitalArea: 0.60,
} as const

export const DSR_LIMITS = {
  firstTier: 0.40,
  secondTier: 0.50,
} as const

export const STRESS_DSR = {
  capital: 0.015,
  nonCapital: 0.0075,
} as const
