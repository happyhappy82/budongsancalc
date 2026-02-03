import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon, roundTo } from '@/lib/utils/math'

const logger = createLogger('building-vat.ts')

export interface BuildingVatInput {
  readonly totalPrice: number
  readonly landPrice: number
  readonly buildingPrice?: number
}

export interface BuildingVatResult {
  readonly buildingPrice: number
  readonly landPrice: number
  readonly buildingRatio: number
  readonly vat: number
  readonly totalWithVat: number
}

const inputSchema = z.object({
  totalPrice: z.number().gt(0, '거래총액은 0보다 커야 합니다.'),
  landPrice: z.number().min(0, '토지가는 0 이상이어야 합니다.'),
  buildingPrice: z.number().min(0, '건물가는 0 이상이어야 합니다.').optional(),
})

const VAT_RATE = 0.1

export const calculateBuildingVat = (
  input: BuildingVatInput
): BuildingVatResult => {
  logger.logEntry('calculateBuildingVat', { ...input })

  try {
    const validated = inputSchema.parse(input)

    // 건물가 = 건물가 입력값이 있으면 사용, 없으면 (거래총액 - 토지가)
    const buildingPrice = validated.buildingPrice !== undefined && validated.buildingPrice > 0
      ? roundToWon(validated.buildingPrice)
      : roundToWon(validated.totalPrice - validated.landPrice)

    // 유효성 검증
    if (buildingPrice < 0) {
      throw new Error('건물가는 0 이상이어야 합니다.')
    }

    if (validated.landPrice + buildingPrice > validated.totalPrice * 1.5) {
      throw new Error('토지가와 건물가의 합이 거래총액을 크게 초과합니다.')
    }

    // 부가세 = 건물가 × 10%
    const vat = roundToWon(buildingPrice * VAT_RATE)

    // 건물비율 = (건물가 / 거래총액) × 100
    const buildingRatio = validated.totalPrice > 0
      ? roundTo((buildingPrice / validated.totalPrice) * 100, 2)
      : 0

    // 부가세포함총액 = 거래총액 + 부가세
    const totalWithVat = roundToWon(validated.totalPrice + vat)

    const result: BuildingVatResult = {
      buildingPrice,
      landPrice: validated.landPrice,
      buildingRatio,
      vat,
      totalWithVat,
    }

    logger.logExit('calculateBuildingVat', result)
    return result
  } catch (error) {
    logger.error('calculateBuildingVat - error', error)
    throw error
  }
}
