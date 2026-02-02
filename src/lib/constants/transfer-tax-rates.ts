export interface TransferTaxBracket {
  readonly threshold: number
  readonly rate: number
  readonly deduction: number
}

export const BASIC_TAX_BRACKETS: readonly TransferTaxBracket[] = [
  { threshold: 14_000_000, rate: 0.06, deduction: 0 },
  { threshold: 50_000_000, rate: 0.15, deduction: 1_260_000 },
  { threshold: 88_000_000, rate: 0.24, deduction: 5_760_000 },
  { threshold: 150_000_000, rate: 0.35, deduction: 15_440_000 },
  { threshold: 300_000_000, rate: 0.38, deduction: 19_940_000 },
  { threshold: 500_000_000, rate: 0.40, deduction: 25_940_000 },
  { threshold: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
  { threshold: Infinity, rate: 0.45, deduction: 65_940_000 },
] as const

export const SHORT_TERM_RATES = {
  lessThanOneYear: 0.45,
  oneToTwoYears: -1,
} as const

export const BASIC_DEDUCTION = 2_500_000

export const LOCAL_INCOME_TAX_RATE = 0.10

export const HIGH_VALUE_THRESHOLD = 1_200_000_000

export const MULTI_HOME_SURCHARGE_SUSPENDED_UNTIL = '2026-05-09'

export const getTaxBracket = (
  taxBase: number
): { rate: number; deduction: number } => {
  for (const bracket of BASIC_TAX_BRACKETS) {
    if (taxBase <= bracket.threshold) {
      return { rate: bracket.rate, deduction: bracket.deduction }
    }
  }
  const last = BASIC_TAX_BRACKETS[BASIC_TAX_BRACKETS.length - 1]
  return { rate: last.rate, deduction: last.deduction }
}
