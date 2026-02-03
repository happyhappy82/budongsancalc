import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('future-income.ts')

export interface FutureIncomeInput {
  readonly currentIncome: number
  readonly age: number
  readonly loanTermYears: 10 | 15 | 20 | 30
}

export interface FutureIncomeResult {
  readonly currentIncome: number
  readonly growthRate: number
  readonly futureIncome: number
  readonly incomeIncrease: number
}

const schema = z.object({
  currentIncome: z.number().gt(0, '현재 연소득은 0보다 커야 합니다.'),
  age: z.number().int().gte(20, '만 나이는 20세 이상이어야 합니다.').lte(70, '만 나이는 70세 이하여야 합니다.'),
  loanTermYears: z.union([z.literal(10), z.literal(15), z.literal(20), z.literal(30)]),
})

const GROWTH_RATES: Record<string, Record<number, number>> = {
  '20-24': {
    10: 20.6,
    15: 31.1,
    20: 39.7,
    30: 50.7,
  },
  '25-29': {
    10: 16.8,
    15: 23.5,
    20: 28.4,
    30: 31.6,
  },
  '30-34': {
    10: 13.0,
    15: 16.6,
    20: 18.4,
    30: 13.5,
  },
}

export const AVERAGE_INCOME_BY_AGE = {
  '20-24': { monthly: 253.6, yearly: 3043.2 },
  '25-29': { monthly: 307.2, yearly: 3686.4 },
  '30-34': { monthly: 357.1, yearly: 4285.2 },
  '35-39': { monthly: 412.3, yearly: 4947.6 },
}

const getAgeGroup = (age: number): string | null => {
  if (age >= 20 && age <= 24) return '20-24'
  if (age >= 25 && age <= 29) return '25-29'
  if (age >= 30 && age <= 34) return '30-34'
  return null
}

export const calculateFutureIncome = (
  input: FutureIncomeInput
): FutureIncomeResult => {
  logger.logEntry('calculateFutureIncome', { ...input })

  try {
    const validated = schema.parse(input)

    const ageGroup = getAgeGroup(validated.age)
    let growthRate = 0

    if (ageGroup && GROWTH_RATES[ageGroup]) {
      growthRate = GROWTH_RATES[ageGroup][validated.loanTermYears] || 0
    }

    const futureIncome = roundToWon(
      validated.currentIncome * (1 + growthRate / 100)
    )
    const incomeIncrease = roundToWon(futureIncome - validated.currentIncome)

    const result: FutureIncomeResult = {
      currentIncome: validated.currentIncome,
      growthRate,
      futureIncome,
      incomeIncrease,
    }

    logger.logExit('calculateFutureIncome', result)
    return result
  } catch (error) {
    logger.error('calculateFutureIncome - error', error)
    throw error
  }
}
