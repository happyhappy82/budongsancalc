import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon, roundTo } from '@/lib/utils/math'

const logger = createLogger('remaining-value.ts')

export type StructureType = 'rc' | 'brick' | 'light-steel' | 'container'

export interface RemainingValueInput {
  readonly originalValue: number
  readonly elapsedYears: number
  readonly structureType: StructureType
}

export interface RemainingValueResult {
  readonly originalValue: number
  readonly usefulLife: number
  readonly depreciationAmount: number
  readonly remainingValue: number
  readonly depreciationRate: number
}

const schema = z.object({
  originalValue: z.number().gt(0, '신축가액은 0보다 커야 합니다.'),
  elapsedYears: z
    .number()
    .min(0, '경과연수는 0 이상이어야 합니다.')
    .int('경과연수는 정수여야 합니다.'),
  structureType: z.enum(['rc', 'brick', 'light-steel', 'container']),
})

const USEFUL_LIFE: Record<StructureType, number> = {
  rc: 50,
  brick: 40,
  'light-steel': 30,
  container: 20,
}

const MINIMUM_RESIDUAL_RATE = 0.1

export const calculateRemainingValue = (
  input: RemainingValueInput
): RemainingValueResult => {
  logger.logEntry('calculateRemainingValue', { ...input })

  try {
    const validated = schema.parse(input)
    const { originalValue, elapsedYears, structureType } = validated

    const usefulLife = USEFUL_LIFE[structureType]

    if (elapsedYears > usefulLife) {
      throw new Error(
        `경과연수는 내용연수 ${usefulLife}년을 초과할 수 없습니다.`
      )
    }

    const depreciationRate = roundTo(elapsedYears / usefulLife, 4)

    let remainingValue = roundToWon(
      originalValue * (1 - depreciationRate)
    )

    const minimumValue = roundToWon(originalValue * MINIMUM_RESIDUAL_RATE)
    if (remainingValue < minimumValue) {
      remainingValue = minimumValue
    }

    const depreciationAmount = originalValue - remainingValue

    const result: RemainingValueResult = {
      originalValue,
      usefulLife,
      depreciationAmount,
      remainingValue,
      depreciationRate: roundTo(depreciationRate * 100, 2),
    }

    logger.logExit('calculateRemainingValue', result)
    return result
  } catch (error) {
    logger.error('calculateRemainingValue - error', error)
    throw error
  }
}
