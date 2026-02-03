import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('early-repayment.ts')

export interface EarlyRepaymentInput {
  readonly repaymentAmount: number
  readonly feeRate: number
  readonly remainingDays: number
  readonly totalDays: number
}

export interface EarlyRepaymentResult {
  readonly earlyRepaymentFee: number
  readonly netAmount: number
  readonly repaymentAmount: number
  readonly feeRate: number
  readonly dayRatio: number
}

const schema = z.object({
  repaymentAmount: z.number().gt(0, '중도상환금액은 0보다 커야 합니다.'),
  feeRate: z.number().min(0, '수수료율은 0 이상이어야 합니다.'),
  remainingDays: z.number().min(0, '대출잔여일수는 0 이상이어야 합니다.'),
  totalDays: z.number().gt(0, '대출전체기간은 0보다 커야 합니다.'),
})

export const calculateEarlyRepayment = (
  input: EarlyRepaymentInput
): EarlyRepaymentResult => {
  logger.logEntry('calculateEarlyRepayment', { ...input })

  try {
    const validated = schema.parse(input)

    if (validated.remainingDays > validated.totalDays) {
      throw new Error('대출잔여일수는 대출전체기간보다 클 수 없습니다.')
    }

    const dayRatio = validated.remainingDays / validated.totalDays
    const earlyRepaymentFee = roundToWon(
      validated.repaymentAmount * (validated.feeRate / 100) * dayRatio
    )
    const netAmount = validated.repaymentAmount - earlyRepaymentFee

    const result: EarlyRepaymentResult = {
      earlyRepaymentFee,
      netAmount,
      repaymentAmount: validated.repaymentAmount,
      feeRate: validated.feeRate,
      dayRatio,
    }

    logger.logExit('calculateEarlyRepayment', result)
    return result
  } catch (error) {
    logger.error('calculateEarlyRepayment - error', error)
    throw error
  }
}
