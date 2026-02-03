import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('estimated-income.ts')

export interface EstimatedIncomeInput {
  readonly incomeType: '국민연금' | '건강보험'
  readonly monthlyPayment: number
}

export interface EstimatedIncomeResult {
  readonly monthlyEstimatedIncome: number
  readonly annualEstimatedIncome: number
  readonly appliedRate: number
  readonly incomeType: string
}

const schema = z.object({
  incomeType: z.enum(['국민연금', '건강보험']),
  monthlyPayment: z.number().gt(0, '월납입액은 0보다 커야 합니다.'),
})

const INCOME_RATES: Record<string, number> = {
  국민연금: 0.045,
  건강보험: 0.0709,
}

export const calculateEstimatedIncome = (
  input: EstimatedIncomeInput
): EstimatedIncomeResult => {
  logger.logEntry('calculateEstimatedIncome', { ...input })

  try {
    const validated = schema.parse(input)

    const rate = INCOME_RATES[validated.incomeType]
    const monthlyEstimatedIncome = roundToWon(validated.monthlyPayment / rate)
    const annualEstimatedIncome = monthlyEstimatedIncome * 12

    const result: EstimatedIncomeResult = {
      monthlyEstimatedIncome,
      annualEstimatedIncome,
      appliedRate: rate * 100,
      incomeType: validated.incomeType,
    }

    logger.logExit('calculateEstimatedIncome', result)
    return result
  } catch (error) {
    logger.error('calculateEstimatedIncome - error', error)
    throw error
  }
}
