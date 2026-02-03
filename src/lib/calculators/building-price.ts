import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('building-price.ts')

export interface BuildingPriceInput {
  readonly area: number
  readonly constructionPricePerSqm: number
  readonly structureIndex: number
  readonly useIndex: number
  readonly locationIndex: number
  readonly ageRate: number
}

export interface BuildingPriceResult {
  readonly standardPrice: number
  readonly pricePerSqm: number
  readonly pricePerPyeong: number
}

const inputSchema = z.object({
  area: z.number().gt(0, '면적은 0보다 커야 합니다.'),
  constructionPricePerSqm: z.number().gt(0, '건물신축가격기준액은 0보다 커야 합니다.'),
  structureIndex: z.number().gt(0, '구조지수는 0보다 커야 합니다.'),
  useIndex: z.number().gt(0, '용도지수는 0보다 커야 합니다.'),
  locationIndex: z.number().gt(0, '위치지수는 0보다 커야 합니다.'),
  ageRate: z.number().min(0, '경과연수별잔가율은 0 이상이어야 합니다.').max(100, '경과연수별잔가율은 100 이하여야 합니다.'),
})

const SQM_TO_PYEONG = 0.3025

export const calculateBuildingPrice = (
  input: BuildingPriceInput
): BuildingPriceResult => {
  logger.logEntry('calculateBuildingPrice', { ...input })

  try {
    const validated = inputSchema.parse(input)

    // ㎡당 금액 = 건물신축가격기준액 × 구조지수 × 용도지수 × 위치지수 × (경과연수별잔가율/100)
    const pricePerSqm = roundToWon(
      validated.constructionPricePerSqm *
        validated.structureIndex *
        validated.useIndex *
        validated.locationIndex *
        (validated.ageRate / 100)
    )

    // 기준시가 = 면적 × ㎡당 금액
    const standardPrice = roundToWon(validated.area * pricePerSqm)

    // 평당 금액 = ㎡당 금액 / 0.3025
    const pricePerPyeong = roundToWon(pricePerSqm / SQM_TO_PYEONG)

    const result: BuildingPriceResult = {
      standardPrice,
      pricePerSqm,
      pricePerPyeong,
    }

    logger.logExit('calculateBuildingPrice', result)
    return result
  } catch (error) {
    logger.error('calculateBuildingPrice - error', error)
    throw error
  }
}
