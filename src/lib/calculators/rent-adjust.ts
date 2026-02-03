import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('rent-adjust.ts')

export interface RentAdjustInput {
  readonly currentDeposit: number
  readonly currentRent: number
  readonly newDeposit?: number
  readonly newRent?: number
  readonly conversionRate: number
}

export interface RentAdjustResult {
  readonly newDeposit: number
  readonly newRent: number
  readonly depositDiff: number
  readonly rentDiff: number
}

const schema = z.object({
  currentDeposit: z.number().min(0, '현재 보증금은 0 이상이어야 합니다.'),
  currentRent: z.number().min(0, '현재 월세는 0 이상이어야 합니다.'),
  newDeposit: z.number().min(0).optional(),
  newRent: z.number().min(0).optional(),
  conversionRate: z.number().gt(0, '전환율은 0보다 커야 합니다.'),
})

export const adjustDepositToRent = (
  input: RentAdjustInput
): RentAdjustResult => {
  logger.logEntry('adjustDepositToRent', { ...input })

  try {
    const validated = schema.parse(input)
    const { currentDeposit, currentRent, newDeposit, conversionRate } =
      validated

    if (newDeposit === undefined) {
      throw new Error('변경 보증금을 입력해주세요.')
    }

    const depositDiff = newDeposit - currentDeposit
    const rateDecimal = conversionRate / 100
    const calculatedNewRent = roundToWon(
      currentRent - (depositDiff * rateDecimal) / 12
    )

    const result: RentAdjustResult = {
      newDeposit,
      newRent: Math.max(0, calculatedNewRent),
      depositDiff,
      rentDiff: calculatedNewRent - currentRent,
    }

    logger.logExit('adjustDepositToRent', result)
    return result
  } catch (error) {
    logger.error('adjustDepositToRent - error', error)
    throw error
  }
}

export const adjustRentToDeposit = (
  input: RentAdjustInput
): RentAdjustResult => {
  logger.logEntry('adjustRentToDeposit', { ...input })

  try {
    const validated = schema.parse(input)
    const { currentDeposit, currentRent, newRent, conversionRate } = validated

    if (newRent === undefined) {
      throw new Error('변경 월세를 입력해주세요.')
    }

    const rentDiff = newRent - currentRent
    const rateDecimal = conversionRate / 100
    const calculatedNewDeposit = roundToWon(
      currentDeposit - (rentDiff * 12) / rateDecimal
    )

    const result: RentAdjustResult = {
      newDeposit: Math.max(0, calculatedNewDeposit),
      newRent,
      depositDiff: calculatedNewDeposit - currentDeposit,
      rentDiff,
    }

    logger.logExit('adjustRentToDeposit', result)
    return result
  } catch (error) {
    logger.error('adjustRentToDeposit - error', error)
    throw error
  }
}
