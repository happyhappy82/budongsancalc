export interface AcquisitionTaxBracket {
  readonly minPrice: number
  readonly maxPrice: number
  readonly rate: number
}

export const SINGLE_HOME_BRACKETS: readonly AcquisitionTaxBracket[] = [
  { minPrice: 0, maxPrice: 600_000_000, rate: 0.01 },
  { minPrice: 600_000_000, maxPrice: 900_000_000, rate: -1 },
  { minPrice: 900_000_000, maxPrice: Infinity, rate: 0.03 },
] as const

export const getSingleHomeTaxRate = (price: number): number => {
  if (price <= 600_000_000) return 0.01
  if (price >= 900_000_000) return 0.03
  return 0.01 + ((price - 600_000_000) / 300_000_000) * 0.02
}

export const MULTI_HOME_RATES = {
  regulated: { twoHomes: 0.08, threeOrMore: 0.12 },
  nonRegulated: { twoHomes: -1, threeOrMore: 0.08 },
} as const

export const LOCAL_EDUCATION_TAX_RATE = 0.1

export const RURAL_SPECIAL_TAX_RATE = 0.002

export const FIRST_TIME_BUYER_DISCOUNT = 2_000_000

export const FIRST_TIME_BUYER_DEADLINE = '2025-12-31'
