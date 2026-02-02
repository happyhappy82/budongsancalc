import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('rent-convert.ts')

export interface RentConvertInput {
  readonly jeonseDeposit?: number
  readonly monthlyDeposit: number
  readonly monthlyRent?: number
  readonly conversionRate: number
}

export interface RentConvertResult {
  readonly monthlyRent?: number
  readonly jeonseEquivalent?: number
  readonly conversionRate: number
}

const rentConvertSchema = z.object({
  jeonseDeposit: z.number().min(0).optional(),
  monthlyDeposit: z.number().min(0),
  monthlyRent: z.number().min(0).optional(),
  conversionRate: z.number().gt(0, '전환율은 0보다 커야 합니다.'),
})

export const validateRentConvertInput = (
  input: RentConvertInput
): RentConvertInput => {
  return rentConvertSchema.parse(input)
}

export const convertJeonseToMonthly = (
  input: RentConvertInput
): RentConvertResult => {
  logger.logEntry('convertJeonseToMonthly', { ...input })

  try {
    const validated = validateRentConvertInput(input)
    const { jeonseDeposit, monthlyDeposit, conversionRate } = validated

    if (jeonseDeposit === undefined) {
      throw new Error('전세보증금을 입력해주세요.')
    }
    if (monthlyDeposit >= jeonseDeposit) {
      throw new Error('월세보증금은 전세보증금보다 작아야 합니다.')
    }

    const rateDecimal = conversionRate / 100
    const monthly = roundToWon(
      ((jeonseDeposit - monthlyDeposit) * rateDecimal) / 12
    )

    const result: RentConvertResult = {
      monthlyRent: monthly,
      conversionRate,
    }

    logger.logExit('convertJeonseToMonthly', result)
    return result
  } catch (error) {
    logger.error('convertJeonseToMonthly - error', error)
    throw error
  }
}

export const convertMonthlyToJeonse = (
  input: RentConvertInput
): RentConvertResult => {
  logger.logEntry('convertMonthlyToJeonse', { ...input })

  try {
    const validated = validateRentConvertInput(input)
    const { monthlyDeposit, monthlyRent, conversionRate } = validated

    if (monthlyRent === undefined || monthlyRent <= 0) {
      throw new Error('월세를 입력해주세요.')
    }

    const rateDecimal = conversionRate / 100
    const jeonse = roundToWon(
      monthlyDeposit + (monthlyRent * 12) / rateDecimal
    )

    const result: RentConvertResult = {
      jeonseEquivalent: jeonse,
      conversionRate,
    }

    logger.logExit('convertMonthlyToJeonse', result)
    return result
  } catch (error) {
    logger.error('convertMonthlyToJeonse - error', error)
    throw error
  }
}
