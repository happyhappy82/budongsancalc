import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('overdue-interest.ts')

export interface OverdueInterestInput {
  readonly overdueAmount: number
  readonly annualRate: number
  readonly days: number
}

export interface OverdueInterestResult {
  readonly overdueInterest: number
  readonly totalAmount: number
}

const schema = z.object({
  overdueAmount: z.number().gt(0, '연체금액은 0보다 커야 합니다.'),
  annualRate: z.number().min(0, '연체이율은 0 이상이어야 합니다.'),
  days: z.number().min(0, '연체일수는 0 이상이어야 합니다.'),
})

export const calculateOverdueInterest = (input: OverdueInterestInput): OverdueInterestResult => {
  logger.logEntry('calculateOverdueInterest', { ...input })

  try {
    const validated = schema.parse(input)

    const overdueInterest = validated.overdueAmount * (validated.annualRate / 100) * (validated.days / 365)
    const totalAmount = validated.overdueAmount + overdueInterest

    const result: OverdueInterestResult = {
      overdueInterest: roundToWon(overdueInterest),
      totalAmount: roundToWon(totalAmount),
    }

    logger.logExit('calculateOverdueInterest', result)
    return result
  } catch (error) {
    logger.error('calculateOverdueInterest - error', error)
    throw error
  }
}
