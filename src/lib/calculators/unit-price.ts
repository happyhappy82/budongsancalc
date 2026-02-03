import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon, roundTo } from '@/lib/utils/math'

const logger = createLogger('unit-price.ts')

export interface UnitPriceInput {
  readonly totalPrice: number
  readonly area: number
  readonly unit: 'sqm' | 'pyeong'
}

export interface UnitPriceResult {
  readonly pricePerPyeong: number
  readonly pricePerSqm: number
  readonly areaSqm: number
  readonly areaPyeong: number
}

const schema = z.object({
  totalPrice: z.number().gt(0, '총 금액은 0보다 커야 합니다.'),
  area: z.number().gt(0, '면적은 0보다 커야 합니다.'),
  unit: z.enum(['sqm', 'pyeong']),
})

const PYEONG_TO_SQM = 3.305785

export const calculateUnitPrice = (input: UnitPriceInput): UnitPriceResult => {
  logger.logEntry('calculateUnitPrice', { ...input })

  try {
    const validated = schema.parse(input)
    const { totalPrice, area, unit } = validated

    const areaSqm = unit === 'sqm' ? area : area * PYEONG_TO_SQM
    const areaPyeong = unit === 'pyeong' ? area : area / PYEONG_TO_SQM

    const pricePerSqm = roundToWon(totalPrice / areaSqm)
    const pricePerPyeong = roundToWon(totalPrice / areaPyeong)

    const result: UnitPriceResult = {
      pricePerPyeong,
      pricePerSqm,
      areaSqm: roundTo(areaSqm, 2),
      areaPyeong: roundTo(areaPyeong, 2),
    }

    logger.logExit('calculateUnitPrice', result)
    return result
  } catch (error) {
    logger.error('calculateUnitPrice - error', error)
    throw error
  }
}
