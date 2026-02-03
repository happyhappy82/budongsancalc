import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('good-landlord.ts')

export interface GoodLandlordInput {
  readonly previousRent: number
  readonly reducedRent: number
  readonly monthsReduced: number
  readonly taxRate: number
}

export interface GoodLandlordResult {
  readonly rentReduction: number
  readonly totalReduction: number
  readonly taxCredit: number
  readonly actualTaxSavings: number
  readonly netBurdenReduction: number
}

const inputSchema = z.object({
  previousRent: z.number().min(0, '기존 월세는 0 이상이어야 합니다.'),
  reducedRent: z.number().min(0, '인하된 월세는 0 이상이어야 합니다.'),
  monthsReduced: z.number().int().gt(0, '인하 개월수는 0보다 커야 합니다.').max(12, '인하 개월수는 12개월 이하여야 합니다.'),
  taxRate: z.number().min(6, '세율은 6% 이상이어야 합니다.').max(45, '세율은 45% 이하여야 합니다.'),
})

const TAX_CREDIT_RATE = 0.7 // 70% 세액공제

export const calculateGoodLandlord = (
  input: GoodLandlordInput
): GoodLandlordResult => {
  logger.logEntry('calculateGoodLandlord', { ...input })

  try {
    const validated = inputSchema.parse(input)

    // 월세인하액 = 기존 월세 - 인하된 월세
    const rentReduction = roundToWon(validated.previousRent - validated.reducedRent)

    if (rentReduction < 0) {
      throw new Error('인하된 월세가 기존 월세보다 클 수 없습니다.')
    }

    // 총인하액 = 월세인하액 × 인하 개월수
    const totalReduction = roundToWon(rentReduction * validated.monthsReduced)

    // 세액공제 = 총인하액 × 70%
    const taxCredit = roundToWon(totalReduction * TAX_CREDIT_RATE)

    // 적용세율별 실질절세액 = 총인하액 × 세율
    const theoreticalTaxSavings = roundToWon(totalReduction * (validated.taxRate / 100))

    // 실질절세액 = MIN(세액공제, 이론상 절세액)
    const actualTaxSavings = Math.min(taxCredit, theoreticalTaxSavings)

    // 실질부담감소 = 세액공제 - (총인하액 - 실질절세액)
    // = 세액공제 - 총인하액 + 실질절세액
    const netBurdenReduction = roundToWon(taxCredit - totalReduction + actualTaxSavings)

    const result: GoodLandlordResult = {
      rentReduction,
      totalReduction,
      taxCredit,
      actualTaxSavings,
      netBurdenReduction,
    }

    logger.logExit('calculateGoodLandlord', result)
    return result
  } catch (error) {
    logger.error('calculateGoodLandlord - error', error)
    throw error
  }
}
