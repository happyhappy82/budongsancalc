import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('rent-increase.ts')

export interface RentIncreaseInput {
  readonly currentDeposit: number
  readonly currentRent: number
  readonly conversionRate: number
  readonly increaseRate: number
}

export interface RentIncreaseMethod {
  readonly methodName: string
  readonly newDeposit: number
  readonly newRent: number
  readonly depositIncrease: number
  readonly rentIncrease: number
  readonly totalIncrease: number
}

export interface RentIncreaseResult {
  readonly method1: RentIncreaseMethod
  readonly method2: RentIncreaseMethod
}

const schema = z.object({
  currentDeposit: z.number().min(0, '현재 보증금은 0 이상이어야 합니다.'),
  currentRent: z.number().min(0, '현재 월세는 0 이상이어야 합니다.'),
  conversionRate: z.number().gt(0, '전환율은 0보다 커야 합니다.'),
  increaseRate: z
    .number()
    .gt(0, '인상률은 0보다 커야 합니다.')
    .max(5, '주택임대차보호법상 최대 5%입니다.'),
})

export const calculateRentIncrease = (
  input: RentIncreaseInput
): RentIncreaseResult => {
  logger.logEntry('calculateRentIncrease', { ...input })

  try {
    const validated = schema.parse(input)
    const { currentDeposit, currentRent, conversionRate, increaseRate } =
      validated

    const rateDecimal = conversionRate / 100
    const increaseDecimal = increaseRate / 100

    const convertedDeposit = roundToWon(
      currentDeposit + (currentRent * 12) / rateDecimal
    )
    const increaseLimit = roundToWon(convertedDeposit * increaseDecimal)

    const method1NewDeposit = roundToWon(currentDeposit + increaseLimit)
    const method1NewRent = currentRent
    const method1DepositIncrease = method1NewDeposit - currentDeposit
    const method1RentIncrease = 0

    const method2NewDeposit = roundToWon(
      currentDeposit * (1 + increaseDecimal)
    )
    const method2NewRent = roundToWon(currentRent * (1 + increaseDecimal))
    const method2DepositIncrease = method2NewDeposit - currentDeposit
    const method2RentIncrease = method2NewRent - currentRent

    const result: RentIncreaseResult = {
      method1: {
        methodName: '전월세전환방식',
        newDeposit: method1NewDeposit,
        newRent: method1NewRent,
        depositIncrease: method1DepositIncrease,
        rentIncrease: method1RentIncrease,
        totalIncrease: method1DepositIncrease,
      },
      method2: {
        methodName: '각각인상방식',
        newDeposit: method2NewDeposit,
        newRent: method2NewRent,
        depositIncrease: method2DepositIncrease,
        rentIncrease: method2RentIncrease,
        totalIncrease:
          method2DepositIncrease + roundToWon(method2RentIncrease * 12),
      },
    }

    logger.logExit('calculateRentIncrease', result)
    return result
  } catch (error) {
    logger.error('calculateRentIncrease - error', error)
    throw error
  }
}
