import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('appraisal-fee.ts')

export interface AppraisalFeeInput {
  readonly appraisalValue: number
}

export interface AppraisalFeeResult {
  readonly baseFee: number
  readonly vat: number
  readonly totalFee: number
}

const inputSchema = z.object({
  appraisalValue: z.number().gt(0, '감정평가액은 0보다 커야 합니다.'),
})

const VAT_RATE = 0.1

const calculateBaseFee = (value: number): number => {
  if (value <= 5_000_000) {
    return 110_000
  } else if (value <= 20_000_000) {
    return 110_000 + (value - 5_000_000) * 0.0033
  } else if (value <= 50_000_000) {
    return 159_500 + (value - 20_000_000) * 0.0025
  } else if (value <= 100_000_000) {
    return 234_500 + (value - 50_000_000) * 0.0021
  } else if (value <= 200_000_000) {
    return 339_500 + (value - 100_000_000) * 0.0017
  } else if (value <= 500_000_000) {
    return 509_500 + (value - 200_000_000) * 0.0011
  } else if (value <= 1_000_000_000) {
    return 839_500 + (value - 500_000_000) * 0.0009
  } else if (value <= 5_000_000_000) {
    return 1_289_500 + (value - 1_000_000_000) * 0.0006
  } else if (value <= 10_000_000_000) {
    return 3_689_500 + (value - 5_000_000_000) * 0.0005
  } else {
    return 6_189_500 + (value - 10_000_000_000) * 0.0004
  }
}

export const calculateAppraisalFee = (
  input: AppraisalFeeInput
): AppraisalFeeResult => {
  logger.logEntry('calculateAppraisalFee', { ...input })

  try {
    const validated = inputSchema.parse(input)
    const { appraisalValue } = validated

    const baseFee = roundToWon(calculateBaseFee(appraisalValue))
    const vat = roundToWon(baseFee * VAT_RATE)
    const totalFee = baseFee + vat

    const result: AppraisalFeeResult = {
      baseFee,
      vat,
      totalFee,
    }

    logger.logExit('calculateAppraisalFee', result)
    return result
  } catch (error) {
    logger.error('calculateAppraisalFee - error', error)
    throw error
  }
}
