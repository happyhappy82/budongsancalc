import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundTo } from '@/lib/utils/math'

const logger = createLogger('area-convert.ts')

export type AreaUnit = 'pyeong' | 'sqm' | 'sqft' | 'acre'

export interface AreaConvertInput {
  readonly value: number
  readonly fromUnit: AreaUnit
}

export interface AreaConvertResult {
  readonly pyeong: number
  readonly sqm: number
  readonly sqft: number
  readonly acre: number
}

const schema = z.object({
  value: z.number().gt(0, '면적은 0보다 커야 합니다.'),
  fromUnit: z.enum(['pyeong', 'sqm', 'sqft', 'acre']),
})

const CONVERSION_TO_SQM = {
  pyeong: 3.305785,
  sqm: 1,
  sqft: 0.09290304,
  acre: 4046.86,
} as const

export const calculateAreaConvert = (input: AreaConvertInput): AreaConvertResult => {
  logger.logEntry('calculateAreaConvert', { ...input })

  try {
    const validated = schema.parse(input)

    const valueInSqm = validated.value * CONVERSION_TO_SQM[validated.fromUnit]

    const result: AreaConvertResult = {
      pyeong: roundTo(valueInSqm / CONVERSION_TO_SQM.pyeong, 2),
      sqm: roundTo(valueInSqm, 2),
      sqft: roundTo(valueInSqm / CONVERSION_TO_SQM.sqft, 2),
      acre: roundTo(valueInSqm / CONVERSION_TO_SQM.acre, 4),
    }

    logger.logExit('calculateAreaConvert', result)
    return result
  } catch (error) {
    logger.error('calculateAreaConvert - error', error)
    throw error
  }
}
