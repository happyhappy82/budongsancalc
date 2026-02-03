import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('deemed-rental.ts')

export interface DeemedRentalInput {
  readonly deposit: number
  readonly rentalDays: number
  readonly interestRate: number
  readonly propertyType: 'residential' | 'commercial'
}

export interface DeemedRentalResult {
  readonly deemedRental: number
  readonly taxableDeposit: number
  readonly appliedRate: number
}

const inputSchema = z.object({
  deposit: z.number().gt(0, '보증금은 0보다 커야 합니다.'),
  rentalDays: z.number().gt(0, '임대기간은 0보다 커야 합니다.'),
  interestRate: z.number().gt(0, '이자율은 0보다 커야 합니다.'),
  propertyType: z.enum(['residential', 'commercial']),
})

export const calculateDeemedRental = (
  input: DeemedRentalInput
): DeemedRentalResult => {
  logger.logEntry('calculateDeemedRental', { ...input })

  try {
    const validated = inputSchema.parse(input)
    const { deposit, rentalDays, interestRate, propertyType } = validated

    let deemedRental = 0
    let taxableDeposit = 0
    const appliedRate = interestRate

    if (propertyType === 'residential') {
      // 주거용: 3억 초과분만 과세, 60% 적용
      if (deposit >= 300_000_000) {
        taxableDeposit = deposit - 300_000_000
        deemedRental = roundToWon(
          (taxableDeposit * 0.6 * (interestRate / 100) * rentalDays) / 365
        )
      }
    } else {
      // 상업용: 전액 과세
      taxableDeposit = deposit
      deemedRental = roundToWon(
        (deposit * (interestRate / 100) * rentalDays) / 365
      )
    }

    const result: DeemedRentalResult = {
      deemedRental,
      taxableDeposit,
      appliedRate,
    }

    logger.logExit('calculateDeemedRental', result)
    return result
  } catch (error) {
    logger.error('calculateDeemedRental - error', error)
    throw error
  }
}
